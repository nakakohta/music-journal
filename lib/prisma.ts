/**
 * Prisma Clientをシングルトンパターンでエクスポートする
 * シングルトンパターン: アプリケーション全体でインスタンスを1つだけ共有するデザインパターン
 */

import { PrismaClient } from '@prisma/client';

// TypeScriptの型定義(グローバル変数用)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// シングルトンパターン:
// すでにインスタンスがあればそれを使い、なければ新規作成
// javaの||演算子と同様の動作をする
export const prisma = 
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

// 保存する(Cont+S)たびに新しいDBインスタンスを作ってしまうのでglobalにprismaがすでにあるかチェックしてあれば再利用する
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;