import { Env } from '../types';

interface TraitMapping {
  trait_id: number;
  weight: number;
}

export async function calculateTraitScores(
  child_id: string,
  challenge_id: string,
  completed_at: string,
  env: Env
) {
  try {
    // 1. Get reflection and feeling from challenge_reflections
    const reflectionRecord = await env.DB.prepare(`
      SELECT feeling, reflection 
      FROM challenge_reflections 
      WHERE child_id = ? 
      AND challenge_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).bind(child_id, challenge_id).first();

    const emoji_slider = (reflectionRecord?.feeling as number) ?? 3; // default if missing
    const reflection = reflectionRecord?.reflection as string ?? null;

    // 2. Lookup trait mappings for this challenge
    const traitsResult = await env.DB.prepare(`
      SELECT trait_id, weight 
      FROM challenge_traits 
      WHERE challenge_id = ?
    `).bind(challenge_id).all();

    const traits = (traitsResult.results as unknown as TraitMapping[]);

    // 3. Calculate scores and update records
    const multiplier = 0.6 + 0.1 * emoji_slider;
    const base = 10;

    for (const { trait_id, weight } of traits) {
      const delta = base * multiplier * weight;

      // 4. Upsert into child_trait_scores
      await env.DB.prepare(`
        INSERT INTO child_trait_scores (child_id, trait_id, score, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (child_id, trait_id)
        DO UPDATE SET
          score = score + excluded.score,
          updated_at = excluded.updated_at
      `).bind(child_id, trait_id, delta, completed_at).run();

      // 5. Insert into trait_score_history
      await env.DB.prepare(`
        INSERT INTO trait_score_history (
          child_id, 
          trait_id, 
          challenge_id, 
          score_delta, 
          emoji_slider, 
          reflection, 
          completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        child_id,
        trait_id,
        challenge_id,
        delta,
        emoji_slider,
        reflection,
        completed_at
      ).run();
    }

    return { success: true };
  } catch (error) {
    console.error('Error calculating trait scores:', error);
    throw error;
  }
} 