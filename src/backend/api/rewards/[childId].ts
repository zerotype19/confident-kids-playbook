import { Env } from "../../types";
import { getChildRewards, getChildProgress } from "../../lib/rewardEngine";

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const childId = url.pathname.split('/').pop();

  if (!childId) {
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Reward Engine: Starting to fetch rewards and progress for child:', childId);
    
    const [rewards, progress] = await Promise.all([
      getChildRewards(childId, env),
      getChildProgress(childId, env)
    ]);

    console.log('Reward Engine: Successfully fetched rewards and progress:', {
      rewards: rewards || [],
      progress: {
        total_challenges: progress.total_challenges,
        current_streak: progress.current_streak,
        longest_streak: progress.longest_streak,
        weekly_challenges: progress.weekly_challenges,
        pillar_progress: progress.pillar_progress,
        milestone_progress: progress.milestone_progress
      }
    });

    return new Response(JSON.stringify({
      rewards: rewards || [],
      progress: {
        total_challenges: progress.total_challenges,
        current_streak: progress.current_streak,
        longest_streak: progress.longest_streak,
        weekly_challenges: progress.weekly_challenges,
        pillar_progress: progress.pillar_progress,
        milestone_progress: progress.milestone_progress
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Reward Engine: Error fetching rewards:', error);
    console.error('Reward Engine: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch rewards',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 