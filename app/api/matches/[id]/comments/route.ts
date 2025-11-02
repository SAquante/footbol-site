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
    
    const comments = db.comments?.filter((c: any) => c.match_id === matchId) || [];
    
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const { user_id, username, comment } = await request.json();
    const matchId = parseInt(params.id);
    
    if (!db.comments) db.comments = [];
    
    const newComment = {
      id: db.comments.length > 0 ? Math.max(...db.comments.map((c: any) => c.id)) + 1 : 1,
      match_id: matchId,
      user_id,
      username,
      comment,
      created_at: new Date().toISOString()
    };
    
    db.comments.push(newComment);
    saveDb(db);
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
