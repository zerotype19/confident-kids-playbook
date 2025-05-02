import { db } from '../lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const { childId } = params;

    const traitScores = await db
      .selectFrom('child_trait_scores')
      .innerJoin('traits', 'traits.id', 'child_trait_scores.trait_id')
      .select([
        'traits.id as trait_id',
        'traits.name as trait_name',
        'traits.code as trait_code',
        'traits.pillar_id',
        'child_trait_scores.score'
      ])
      .where('child_trait_scores.child_id', '=', childId)
      .orderBy('child_trait_scores.score', 'desc')
      .execute();

    return NextResponse.json(traitScores, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching trait scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trait scores' },
      { status: 500 }
    );
  }
} 