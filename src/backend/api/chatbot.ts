import { Env } from '../types';
import OpenAI from 'openai';
import { verifyToken } from '../lib/auth';

interface ChatbotRequest {
  message: string;
}

// Helper function to detect pillar ID from message
function detectPillarId(message: string): number {
  const msg = message.toLowerCase();
  if (msg.includes("afraid") || msg.includes("scared") || msg.includes("fear")) return 5;
  if (msg.includes("friends") || msg.includes("shy") || msg.includes("talking") || msg.includes("group")) return 3;
  if (msg.includes("try") || msg.includes("quit") || msg.includes("give up") || msg.includes("fail")) return 2;
  if (msg.includes("decide") || msg.includes("problem") || msg.includes("solve") || msg.includes("choice")) return 1;
  if (msg.includes("talent") || msg.includes("good at") || msg.includes("purpose") || msg.includes("passion")) return 4;
  return 2; // Default to Growth Mindset & Resilience
}

// Helper function to get age range from child's age
function getAgeRange(age: number): string {
  if (age >= 3 && age <= 5) return "3-5";
  if (age >= 6 && age <= 9) return "6-9";
  if (age >= 10 && age <= 13) return "10-13";
  return "6-9"; // fallback default
}

// Helper function to get pillar name
function getPillarName(pillarId: number): string {
  const pillarMap = {
    1: "Independence & Problem-Solving",
    2: "Growth Mindset & Resilience",
    3: "Social Confidence & Communication",
    4: "Purpose & Strength Discovery",
    5: "Managing Fear & Anxiety"
  };
  return pillarMap[pillarId as keyof typeof pillarMap] || "Growth Mindset & Resilience";
}

// Helper function to format challenges for the prompt
function formatChallenges(challenges: any[]): string {
  return challenges.map(c => {
    const traits = c.traits ? `\nTraits: ${JSON.parse(c.traits as string).map((t: any) => `${t.name} (${t.weight})`).join(', ')}` : '';
    const type = c.challenge_type_name ? `\nType: ${c.challenge_type_name} - ${c.challenge_type_description}` : '';
    return `• [challenge:${c.id}] ${c.title} - ${c.what_you_practice}${type}${traits}\nGuide: ${c.guide_prompt}`;
  }).join('\n');
}

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
});

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  console.log('🧭 Chatbot request:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('https://kidoova.com')
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token, env.JWT_SECRET);
    const userId = decodedToken.sub;

    // Get user's selected child
    const { results: userData } = await env.DB.prepare(`
      SELECT selected_child_id FROM users WHERE id = ?
    `).bind(userId).all();

    const selectedChildId = userData[0]?.selected_child_id;
    if (!selectedChildId) {
      console.log('❌ No child selected for user:', userId);
      return new Response(JSON.stringify({ error: 'No child selected' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('https://kidoova.com')
        }
      });
    }

    // Get child's details and trait scores
    const { results: childData } = await env.DB.prepare(`
      SELECT 
        c.id, 
        c.name, 
        c.age_range,
        json_group_array(json_object(
          'trait_id', ts.trait_id,
          'score', ts.score,
          'name', t.name
        )) as trait_scores
      FROM children c
      LEFT JOIN child_trait_scores ts ON c.id = ts.child_id
      LEFT JOIN traits t ON ts.trait_id = t.id
      WHERE c.id = ?
      GROUP BY c.id
    `).bind(selectedChildId).all();

    const selectedChild = childData[0];
    if (!selectedChild) {
      console.log('❌ Child not found:', selectedChildId);
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('https://kidoova.com')
        }
      });
    }

    // Get completed challenges with reflections
    const { results: completedChallenges } = await env.DB.prepare(`
      SELECT 
        cl.challenge_id,
        cl.completed_at,
        cl.reflection,
        cl.mood_rating,
        c.title,
        c.pillar_id,
        json_group_array(json_object(
          'trait_id', ct.trait_id,
          'weight', ct.weight,
          'name', t.name
        )) as traits
      FROM challenge_logs cl
      JOIN challenges c ON cl.challenge_id = c.id
      LEFT JOIN challenge_traits ct ON c.id = ct.challenge_id
      LEFT JOIN traits t ON ct.trait_id = t.id
      WHERE cl.child_id = ?
      GROUP BY cl.challenge_id
      ORDER BY cl.completed_at DESC
      LIMIT 5
    `).bind(selectedChildId).all();

    // Get request body
    const body = await request.json() as ChatbotRequest;
    if (!body.message) {
      console.log('❌ No message provided');
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('https://kidoova.com')
        }
      });
    }

    // Detect pillar from message
    const pillarId = detectPillarId(body.message);
    const pillarName = getPillarName(pillarId);
    const ageRange = selectedChild.age_range;

    // Get available challenges that match the pillar and age range
    let { results: availableChallenges } = await env.DB.prepare(`
      SELECT 
        c.id, 
        c.title, 
        c.what_you_practice,
        c.guide_prompt,
        c.start_prompt,
        c.success_signals,
        c.why_it_matters,
        c.difficulty_level,
        c.age_range,
        c.pillar_id,
        ct.name as challenge_type_name,
        json_group_array(json_object(
          'trait_id', t.id,
          'weight', ct2.weight,
          'name', t.name
        )) as traits
      FROM challenges c
      LEFT JOIN challenge_types ct ON c.challenge_type_id = ct.id
      LEFT JOIN challenge_traits ct2 ON c.id = ct2.challenge_id
      LEFT JOIN traits t ON ct2.trait_id = t.id
      WHERE c.pillar_id = ? 
        AND c.age_range = ?
        AND c.id NOT IN (${completedChallenges.map(c => `'${c.challenge_id}'`).join(',') || 'NULL'})
      GROUP BY c.id
      ORDER BY c.difficulty_level ASC
      LIMIT 3
    `).bind(pillarId, ageRange).all();

    // Fallback: If no available challenges, fetch one (even if completed)
    if (!availableChallenges || availableChallenges.length === 0) {
      const fallback = await env.DB.prepare(`
        SELECT 
          c.id, 
          c.title, 
          c.what_you_practice,
          c.guide_prompt,
          c.start_prompt,
          c.success_signals,
          c.why_it_matters,
          c.difficulty_level,
          c.age_range,
          c.pillar_id,
          ct.name as challenge_type_name,
          ct.description as challenge_type_description,
          json_group_array(json_object(
            'trait_id', t.id,
            'weight', ct2.weight,
            'name', t.name
          )) as traits
        FROM challenges c
        LEFT JOIN challenge_types ct ON c.challenge_type_id = ct.id
        LEFT JOIN challenge_traits ct2 ON c.id = ct2.challenge_id
        LEFT JOIN traits t ON ct2.trait_id = t.id
        WHERE c.pillar_id = ? AND c.age_range = ?
        GROUP BY c.id
        ORDER BY c.difficulty_level ASC
        LIMIT 1
      `).bind(pillarId, ageRange).all();
      availableChallenges = fallback.results;
    }

    // Format challenges for the prompt
    const challengeList = formatChallenges(availableChallenges);

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Prepare context about completed challenges
    const completedContext = completedChallenges.length > 0 ? `
Recent completed challenges:
${completedChallenges.map(c => 
  `• ${c.title} (${getPillarName(Number(c.pillar_id))})
   Reflection: ${c.reflection || 'No reflection provided'}
   Mood: ${c.mood_rating}/5
   Traits: ${c.traits ? JSON.parse(c.traits as string).map((t: any) => `${t.name} (${t.weight})`).join(', ') : 'None'}
`).join('\n')}
` : '';

    // Prepare context about child's traits
    const traitContext = selectedChild.trait_scores ? `
Child's current trait scores:
${JSON.parse(selectedChild.trait_scores as string).map((t: any) => 
  `• ${t.name}: ${t.score} - ${t.description}`
).join('\n')}
` : '';

    // Log the request to OpenAI
    console.log('🤖 Sending request to OpenAI:', {
      model: 'gpt-3.5-turbo',
      messageLength: body.message.length,
      availableChallenges: availableChallenges.length,
      pillar: pillarName,
      ageRange
    });

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a kind parenting coach helping parents raise confident, resilient children.

The selected child is ${selectedChild.name}, age ${selectedChild.age_range}, and you're helping their parent.

${traitContext}

${completedContext}

Here are challenge ideas from the Raising Confident Kids playbook, aligned to the "${pillarName}" pillar and appropriate for a ${ageRange}-year-old:

${challengeList}

Give short, actionable suggestions with warmth and encouragement. You may reference the child's name if helpful.
When suggesting challenges, use the format [challenge:ID] to reference them.
At the end of your response, always include a link to the challenge using the format: "Click here to check out the challenge details: [challenge:ID]"

Format your response with natural line breaks between paragraphs and ideas.`
        },
        {
          role: 'user',
          content: body.message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Log the response from OpenAI
    console.log('🤖 Received response from OpenAI:', {
      status: 'success',
      usage: completion.usage
    });

    const response = completion.choices[0].message.content || '';

    // Extract challenge IDs from the response
    let challengeIds = [...response.matchAll(/\[challenge[: ]([^\]]+)\]/gi)].map(match => match[1]);
    let responseWithLinks = response
      .replace(/Click here to check out the challenge details:? ?\[challenge[: ][^\]]+\]/gi, '')
      .replace(/\n/g, '<br>');

    // If no challenge ID found, append a recommended challenge and tag
    if (!challengeIds.length && availableChallenges.length > 0) {
      const fallback = availableChallenges[0];
      responseWithLinks += `<br><br><strong>Recommended Challenge:</strong> ${fallback.title}<br>${fallback.what_you_practice}<br><button onclick=\"window.dispatchEvent(new CustomEvent('openChallenge',{detail:'${fallback.id as string}'}));\" class=\"bg-kidoova-green text-white px-4 py-2 rounded-lg hover:bg-kidoova-accent transition-colors mt-2\">Start Challenge</button>`;
      challengeIds = [fallback.id as string];
    } else {
      // For each challenge ID in the response, add a Start Challenge button
      challengeIds.forEach(challengeId => {
        const challenge = availableChallenges.find(c => c.id === challengeId);
        if (challenge) {
          responseWithLinks += `<br><br><button onclick=\"window.dispatchEvent(new CustomEvent('openChallenge',{detail:'${challengeId}'}));\" class=\"bg-kidoova-green text-white px-4 py-2 rounded-lg hover:bg-kidoova-accent transition-colors mt-2\">Start Challenge</button>`;
        }
      });
    }

    return new Response(JSON.stringify({ 
      response: responseWithLinks,
      challengeIds
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('https://kidoova.com')
      }
    });
  } catch (error) {
    console.error('❌ Error in chatbot:', error);
    if (error instanceof OpenAI.APIError && error.status === 429) {
      return new Response(JSON.stringify({ 
        error: 'The AI service is currently busy. Please try again in a moment.' 
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('https://kidoova.com')
        }
      });
    }
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request.' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('https://kidoova.com')
      }
    });
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function onRequestOptions({ request }: { request: Request }) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders('https://kidoova.com')
    }
  });
} 