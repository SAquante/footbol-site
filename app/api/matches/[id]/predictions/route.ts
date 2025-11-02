import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'elclasico.json');

function getDb() {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

function saveDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const matchId = parseInt(params.id);
    
    const predictions = db.predictions?.filter((p: any) => p.match_id === matchId) || [];
    
    return NextResponse.json(predictions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { user_id, username, predicted_score_real, predicted_score_barca } = await request.json();
    const matchId = parseInt(params.id);
    
    if (!db.predictions) db.predictions = [];
    
    // Проверяем, есть ли уже прогноз этого пользователя на этот матч
    const existingIndex = db.predictions.findIndex((p: any) => 
      p.match_id === matchId && p.user_id === user_id
    );
    
    if (existingIndex !== -1) {
      return NextResponse.json({ error: 'You already made a prediction for this match' }, { status: 400 });
    }
    
    const newPrediction = {
      id: db.predictions.length > 0 ? Math.max(...db.predictions.map((p: any) => p.id)) + 1 : 1,
      match_id: matchId,
      user_id,
      username,
      predicted_score_real,
      predicted_score_barca,
      points_earned: null,
      created_at: new Date().toISOString()
    };
    
    db.predictions.push(newPrediction);
    saveDb(db);
    
    return NextResponse.json(newPrediction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 });
  }
}
