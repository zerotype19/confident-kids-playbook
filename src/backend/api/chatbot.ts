import { Env } from '../types';
import OpenAI from 'openai';
import { verifyToken } from '../lib/auth';
import { corsHeaders } from '../lib/cors';

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

// Helper function to get pillar name
function getPillarName(pillarId: number): string {
  const pillarMap = {
    1: "Independence & Problem-Solving",
    2: "Growth Mindset & Resilience",
    3: "Social Confidence & Communication",
    4: "Purpose & Strength Discovery",
    5: "Managing Fear & Anxiety",
  };
  return pillarMap[pillarId as keyof typeof pillarMap] || "Growth Mindset & Resilience";
}

// Helper function to format challenges for the prompt
function formatChallenges(challenges: any[]): string {
  return challenges.map(c =>
    `• ${c.title}: ${c.description} Tip: ${c.tip}`
  ).join('\n');
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  console.log('🚀 Chatbot endpoint called:', {
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
          ...corsHeaders('*')
        }
      });
    }

    console.log('🔑 Starting JWT verification:', {
      tokenLength: authHeader.length,
      tokenPrefix: authHeader.substring(0, 20) + '...',
      hasJwtSecret: !!env.JWT_SECRET,
      jwtSecretLength: env.JWT_SECRET?.length,
      jwtSecretPreview: env.JWT_SECRET ? env.JWT_SECRET.substring(0, 4) + '...' : undefined,
      currentTime: Math.floor(Date.now() / 1000)
    });

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token, env.JWT_SECRET);
    const userId = decodedToken.sub;

    console.log('✅ JWT verification result:', {
      hasPayload: true,
      hasSub: true,
      sub: userId,
      name: decodedToken.name,
      email: decodedToken.email
    });

    // Parse request body
    const body = await request.json() as ChatbotRequest;
    const { message } = body;

    if (!message) {
      console.log('❌ No message provided');
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('*')
        }
      });
    }

    // Get user's selected child from the database
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
          ...corsHeaders('*')
        }
      });
    }

    // Get child's details
    const { results: childData } = await env.DB.prepare(`
      SELECT name, age_range FROM children WHERE id = ?
    `).bind(selectedChildId).all();

    const child = childData[0];
    const ageRange = child?.age_range || '6-9'; // Default to middle range if not set

    // Detect pillar from message
    const pillarId = detectPillarId(message);
    const pillarName = getPillarName(pillarId);

    console.log('👶 Child details:', {
      selectedChildId,
      childName: child?.name,
      ageRange,
      pillarId,
      pillarName
    });

    // Query challenges from D1
    const { results: challenges } = await env.DB.prepare(`
      SELECT title, description, tip
      FROM challenges
      WHERE pillar_id = ? AND age_range = ?
      ORDER BY difficulty_level ASC
      LIMIT 3
    `).bind(pillarId, ageRange).all();

    console.log('🎯 Found challenges:', {
      count: challenges?.length || 0,
      pillarId,
      ageRange
    });

    // Format challenges for the prompt
    const formattedChallenges = formatChallenges(challenges);

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Create the system prompt
    const systemPrompt = `
You are a kind parenting coach helping parents raise confident, resilient children.

The selected child is ${child?.name || 'your child'}, and you're helping their parent.

Here are some challenge ideas from the Raising Confident Kids playbook, aligned to the "${pillarName}" pillar and appropriate for a ${ageRange}-year-old:

${formattedChallenges}

Keep responses short, supportive, and actionable. Use a warm tone and offer one idea at a time.
`;

    console.log('🤖 Sending request to OpenAI:', {
      model: 'gpt-3.5-turbo',
      messageLength: message.length,
      systemPromptLength: systemPrompt.length
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('✅ OpenAI response received:', {
      status: 'success',
      usage: completion.usage
    });

    return new Response(JSON.stringify({
      response: completion.choices[0].message.content
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://kidoova.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      }
    });
  } catch (error: any) {
    console.error('❌ OpenAI API error:', {
      error: error.message,
      status: error.status,
      type: error.type,
      code: error.code
    });

    // Handle specific OpenAI errors
    if (error.status === 429) {
      return new Response(JSON.stringify({
        error: 'The AI service is currently unavailable. Please try again later.'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://kidoova.com',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin'
        }
      });
    }

    // Handle other errors
    return new Response(JSON.stringify({
      error: 'An error occurred while processing your request. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://kidoova.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
      }
    });
  }
} 