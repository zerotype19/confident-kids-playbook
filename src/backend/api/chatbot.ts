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
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token, env.JWT_SECRET);
    const userId = decodedToken.sub;

    // Parse request body
    const body = await request.json() as ChatbotRequest;
    const { message } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user's selected child from the database
    const { results: userData } = await env.DB.prepare(`
      SELECT selected_child_id FROM users WHERE id = ?
    `).bind(userId).all();

    const selectedChildId = userData[0]?.selected_child_id;

    if (!selectedChildId) {
      return new Response(JSON.stringify({ error: 'No child selected' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
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

    // Query challenges from D1
    const { results: challenges } = await env.DB.prepare(`
      SELECT title, description, tip
      FROM challenges
      WHERE pillar_id = ? AND age_range = ?
      ORDER BY difficulty_level ASC
      LIMIT 3
    `).bind(pillarId, ageRange).all();

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

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0].message.content;

    return new Response(JSON.stringify({ response }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 