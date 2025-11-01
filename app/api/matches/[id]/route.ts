import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'SELECT * FROM matches WHERE id = $1',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Матч не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Get match error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении матча' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Динамическое построение запроса
    if (data.match_datetime !== undefined) {
      fields.push(`match_datetime = $${paramCount++}`);
      values.push(data.match_datetime);
    }
    if (data.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(data.location);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.score_real !== undefined) {
      fields.push(`score_real = $${paramCount++}`);
      values.push(data.score_real);
    }
    if (data.score_barca !== undefined) {
      fields.push(`score_barca = $${paramCount++}`);
      values.push(data.score_barca);
    }
    if (data.lineup_real !== undefined) {
      fields.push(`lineup_real = $${paramCount++}`);
      values.push(data.lineup_real);
    }
    if (data.lineup_barca !== undefined) {
      fields.push(`lineup_barca = $${paramCount++}`);
      values.push(data.lineup_barca);
    }
    if (data.coach_real !== undefined) {
      fields.push(`coach_real = $${paramCount++}`);
      values.push(data.coach_real);
    }
    if (data.coach_barca !== undefined) {
      fields.push(`coach_barca = $${paramCount++}`);
      values.push(data.coach_barca);
    }
    if (data.goals_real !== undefined) {
      fields.push(`goals_real = $${paramCount++}`);
      values.push(data.goals_real);
    }
    if (data.goals_barca !== undefined) {
      fields.push(`goals_barca = $${paramCount++}`);
      values.push(data.goals_barca);
    }
    if (data.conceded_real !== undefined) {
      fields.push(`conceded_real = $${paramCount++}`);
      values.push(data.conceded_real);
    }
    if (data.conceded_barca !== undefined) {
      fields.push(`conceded_barca = $${paramCount++}`);
      values.push(data.conceded_barca);
    }
    if (data.points_real !== undefined) {
      fields.push(`points_real = $${paramCount++}`);
      values.push(data.points_real);
    }
    if (data.points_barca !== undefined) {
      fields.push(`points_barca = $${paramCount++}`);
      values.push(data.points_barca);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'Нет данных для обновления' },
        { status: 400 }
      );
    }

    values.push(params.id);
    
    const result = await query(
      `UPDATE matches SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Матч не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update match error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении матча' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'DELETE FROM matches WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Матч не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Матч успешно удален' });
  } catch (error) {
    console.error('Delete match error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении матча' },
      { status: 500 }
    );
  }
}
