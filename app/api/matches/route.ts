import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM matches 
       ORDER BY match_datetime ASC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении матчей' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      match_datetime, 
      location, 
      status = 'scheduled',
      score_real,
      score_barca,
      lineup_real,
      lineup_barca,
      coach_real,
      coach_barca,
      goals_real,
      goals_barca,
      conceded_real,
      conceded_barca,
      points_real,
      points_barca,
      announcement
    } = body;

    if (!match_datetime || !location) {
      return NextResponse.json(
        { error: 'Требуются дата/время и место проведения' },
        { status: 400 }
      );
    }

    // Формируем запрос с всеми полями
    const fields = ['match_datetime', 'location', 'status'];
    const values: any[] = [match_datetime, location, status];
    let paramCount = 3;

    // Добавляем опциональные поля
    if (score_real !== undefined) {
      fields.push('score_real');
      values.push(score_real);
      paramCount++;
    }
    if (score_barca !== undefined) {
      fields.push('score_barca');
      values.push(score_barca);
      paramCount++;
    }
    if (lineup_real !== undefined) {
      fields.push('lineup_real');
      values.push(lineup_real);
      paramCount++;
    }
    if (lineup_barca !== undefined) {
      fields.push('lineup_barca');
      values.push(lineup_barca);
      paramCount++;
    }
    if (coach_real !== undefined) {
      fields.push('coach_real');
      values.push(coach_real);
      paramCount++;
    }
    if (coach_barca !== undefined) {
      fields.push('coach_barca');
      values.push(coach_barca);
      paramCount++;
    }
    if (goals_real !== undefined) {
      fields.push('goals_real');
      values.push(goals_real);
      paramCount++;
    }
    if (goals_barca !== undefined) {
      fields.push('goals_barca');
      values.push(goals_barca);
      paramCount++;
    }
    if (conceded_real !== undefined) {
      fields.push('conceded_real');
      values.push(conceded_real);
      paramCount++;
    }
    if (conceded_barca !== undefined) {
      fields.push('conceded_barca');
      values.push(conceded_barca);
      paramCount++;
    }
    if (points_real !== undefined) {
      fields.push('points_real');
      values.push(points_real);
      paramCount++;
    }
    if (points_barca !== undefined) {
      fields.push('points_barca');
      values.push(points_barca);
      paramCount++;
    }
    if (announcement !== undefined) {
      fields.push('announcement');
      values.push(announcement);
      paramCount++;
    }

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const fieldNames = fields.join(', ');

    const result = await query(
      `INSERT INTO matches (${fieldNames}) 
       VALUES (${placeholders}) 
       RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Create match error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании матча' },
      { status: 500 }
    );
  }
}
