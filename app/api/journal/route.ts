import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; //シングルトンパターンでエクスポートされたPrisma Client
import { create } from 'domain';

export async function POST(req: NextRequest) {
    try {
        // フロントからデータを受け取る
        const body = await req.json();
        const { title, artistName, content, mood } = body;

        // artistテーブルの処理
        const artist = await prisma.artist.upsert({
            where: { name: artistName },
            update: {},
            create: { name: artistName },   
        });

        // songテーブルの処理
        const song = await prisma.song.upsert({
            where: {
                title_artistId:{
                    title: title,
                    artistId: artist.id,
                },
            },
            update: {},
            create: {
                title: title,
                artistId: artist.id,
            },
        });
        
        // journalテーブルの処理
        const newJournal = await prisma.journal.create({
            data: {
                content: content || null,
                mood: Number(mood),
                songId: song.id, // 取得したsongのIDを使う
            },
            include: {
                song: { include: { artist: true }  }
            }
        });

        return NextResponse.json(newJournal);

       
    }catch (error:any) {
        console.error(error);
        return NextResponse.json({ error: error.message ||'保存に失敗しました' }, { status: 500 } , );
    }
}


export async function GET() {
    try {
        const journals = await prisma.journal.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                song: { include: { artist: true }  },
            },
        });
        
        return NextResponse.json(journals);
    }catch (error) {
        return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        //URLから削除したいIDを取得する
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'IDが指定されていません' }, { status: 400 });
    }
    await prisma.journal.delete({
        where: {
            id: Number(id),
        }
    });
    return NextResponse.json({ message: '削除しました' });
    } catch (error) {
        return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
    }
}