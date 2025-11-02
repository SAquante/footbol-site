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
    
    const reactions = db.reactions?.filter((r: any) => r.match_id === matchId) || [];
    
    return NextResponse.json(reactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { user_id, username, type } = await request.json();
    const matchId = parseInt(params.id);
    
    if (!db.reactions) db.reactions = [];
    
    // Проверяем, есть ли уже реакция этого пользователя на этот матч
    const existingIndex = db.reactions.findIndex((r: any) => 
      r.match_id === matchId && r.user_id === user_id
    );
    
    if (existingIndex !== -1) {
      // Обновляем существующую реакцию
      db.reactions[existingIndex].type = type;
      db.reactions[existingIndex].created_at = new Date().toISOString();
      saveDb(db);
      return NextResponse.json(db.reactions[existingIndex]);
    }
    
    const newReaction = {
      id: db.reactions.length > 0 ? Math.max(...db.reactions.map((r: any) => r.id)) + 1 : 1,
      match_id: matchId,
      user_id,
      username,
      type,
      created_at: new Date().toISOString()
    };
    
    db.reactions.push(newReaction);
    saveDb(db);
    
    return NextResponse.json(newReaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reaction' }, { status: 500 });
  }
}
