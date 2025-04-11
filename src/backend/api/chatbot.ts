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
          ...corsHeaders('*')
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
          ...corsHeaders('*')
        }
      });
    }

    // Get completed challenges for the selected child
    const { results: completedChallenges } = await env.DB.prepare(`
      SELECT challenge_id FROM challenge_log 
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
          ...corsHeaders('*')
        }
      });
    }

    // Get available challenges that haven't been completed
    const { results: availableChallenges } = await env.DB.prepare(`
      SELECT id, title, description, tip, difficulty_level, age_range, pillar_id
      FROM challenges
      WHERE id NOT IN (${completedChallengeIds.map(() => '?').join(',')})
      ORDER BY RANDOM()
      LIMIT 5
    `).bind(...completedChallengeIds).all();

    // Format challenges for the prompt
    const challengeList = availableChallenges.map(challenge => 
      `[Challenge ${challenge.id}]: ${challenge.title} - ${challenge.description}`
    ).join('\n');

    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Log the request to OpenAI
    console.log('🤖 Sending request to OpenAI:', {
      model: 'gpt-3.5-turbo',
      messageLength: message.length,
      availableChallenges: availableChallenges.length
    });

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a friendly and encouraging parenting coach. Your goal is to help parents build their child's confidence through daily challenges. 
          You have access to the following challenges that haven't been completed yet:
          ${challengeList}
          
          When suggesting challenges, use the format [challenge:ID] to reference them. For example: "Try this challenge: [challenge:1]"
          Always be positive and encouraging. If a parent shares a success, celebrate it! If they're struggling, offer support and suggest a challenge that might help.`
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

    // Extract challenge IDs from the response
    const challengeIds = [...response.matchAll(/\[challenge:(\d+)\]/g)]
      .map(match => match[1]);

    return new Response(JSON.stringify({ 
      response,
      challengeIds
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('*')
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
          ...corsHeaders('*')
        }
      });
    }
    return new Response(JSON.stringify({ 
      error: 'An error occurred while processing your request.' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('*')
      }
    });
  }
} 