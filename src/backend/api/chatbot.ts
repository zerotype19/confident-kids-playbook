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
  return challenges.map(c =>
    `• ${c.title}: ${c.description} Tip: ${c.tip}`
  ).join('\n');
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

    // Get child's details
    const { results: childData } = await env.DB.prepare(`
      SELECT id, name, age_range FROM children WHERE id = ?
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

    // Get completed challenges for the selected child
    const { results: completedChallenges } = await env.DB.prepare(`
      SELECT challenge_id FROM challenge_logs 
      WHERE child_id = ?
    `).bind(selectedChildId).all();

    const completedChallengeIds = completedChallenges.map(c => c.challenge_id);

    // Get request body
    const { message } = await request.json();
    if (!message) {
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
    const pillarId = detectPillarId(message);
    const pillarName = getPillarName(pillarId);
    const ageRange = selectedChild.age_range;

    // Get available challenges that match the pillar and age range
    const { results: availableChallenges } = await env.DB.prepare(`
      SELECT id, title, description, tip, difficulty_level, age_range, pillar_id
      FROM challenges
      WHERE pillar_id = ? 
        AND age_range = ?
        AND id NOT IN (${completedChallengeIds.map(() => '?').join(',')})
      ORDER BY difficulty_level ASC
      LIMIT 3
    `).bind(pillarId, ageRange, ...completedChallengeIds).all();

    // Format challenges for the prompt
    const challengeList = availableChallenges.map(challenge => 
      `• [Challenge ${challenge.id}]: ${challenge.title} - ${challenge.description} Tip: ${challenge.tip}`
    ).join('\n');

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Log the request to OpenAI
    console.log('🤖 Sending request to OpenAI:', {
      model: 'gpt-3.5-turbo',
      messageLength: message.length,
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

Here are challenge ideas from the Raising Confident Kids playbook, aligned to the "${pillarName}" pillar and appropriate for a ${ageRange}-year-old:

${challengeList}

Give short, actionable suggestions with warmth and encouragement. You may reference the child's name if helpful.
When suggesting challenges, use the format [challenge:ID] to reference them.
At the end of your response, always include a link to the challenge using the format: "Click here to check out the challenge details: https://kidoova.com/challenges/[challenge:ID]"`
        },
        {
          role: 'user',
          content: message
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

    const response = completion.choices[0].message.content;

    // Extract challenge IDs from the response and create proper links
    const responseWithLinks = response.replace(
      /\[challenge:([^\]]+)\]/g,
      (match, id) => `https://kidoova.com/challenges/${id}`
    );

    return new Response(JSON.stringify({ 
      response: responseWithLinks,
      challengeIds: [...response.matchAll(/\[challenge:([^\]]+)\]/g)].map(match => match[1])
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