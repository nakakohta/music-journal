/**
 * アーティスト情報を取得するAPI
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; //シングルトンパターンでエクスポートされたPrisma Client

export async function GET() {
    try {
        // アーティスト一覧を名前順で取得
        const artists = await prisma.artist.findMany({
            orderBy: { name: 'asc' },
                select: { name: true }
            });
            return NextResponse.json(artists);

    } catch (error) {
        return NextResponse.json([], { status: 500 });
    }
}