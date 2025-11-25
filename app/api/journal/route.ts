import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; //シングルトンパターンでエクスポートされたPrisma Client

export async function POST(req: NextRequest) {
    try {
        // フロントからデータを受け取る
        const body = await req.json();
        const { title, artist, content, mood } = body;

        // データベースに保存
        const newPost = await prisma.post.create({
            data: {
                content: content,
                mood: mood,
                song: {
                    create: {
                        title: title,
                        artist: artist,
                    }
                }
            },
            // 保存したデータを、関連するSong情報込みで返す設定
            include: {
                song: true,
            }
        });

        return NextResponse.json(newPost);
    }catch (error:any) {
        console.error(error);
        return NextResponse.json({ error: error.message ||'保存に失敗しました' }, { status: 500 } , );
    }
}


export async function GET() {
    console.log("🟢 GETリクエストを受け取りました");
    try {

        console.log("🟡 PrismaでDB検索開始...");

        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                song: true,
            },
        });
        
        console.log("🟢 データ取得成功:", posts);
        return NextResponse.json(posts);
    }catch (error) {
        console.error("🔴 APIエラー発生:", error);
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
    await prisma.post.delete({
        where: {
            id: Number(id),
        }
    });
    return NextResponse.json({ message: '削除しました' });
    } catch (error) {
        return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
    }
}