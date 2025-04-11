import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import OpenAI from 'openai';

const router = Router();

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

// Chatbot endpoint
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const selectedChild = req.user.selectedChild;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get the child's age range
    const ageRange = selectedChild?.age_range || '6-9'; // Default to middle range if not set

    // Detect pillar from message
    const pillarId = detectPillarId(message);
    const pillarName = getPillarName(pillarId);

    // Query challenges from D1
    const { DB } = req.env;
    const { results: challenges } = await DB.prepare(`
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
      apiKey: req.env.OPENAI_API_KEY,
    });

    // Create the system prompt
    const systemPrompt = `
You are a kind parenting coach helping parents raise confident, resilient children.

The selected child is ${selectedChild?.name || 'your child'}, and you're helping their parent.

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

    res.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router; 