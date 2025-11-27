import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/spotify';

export async function GET(req: NextRequest) {
    // 検索クエリを取得
    try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: '検索ワードが必要です' }, { status: 400 });
    }

    // Spotifyのアクセストークンを取得
    const { access_token } = await getAccessToken();

    // Spotify Serch APIを呼び出す
    const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    const data = await spotifyRes.json();

    // Spotifyの巨大なJsonから、必要な情報だけ抜き出す
    const tracks = data.tracks.items.map((track: any) => ({
        id: track.id, // これがSpotifyの曲ID
        title: track.name, // 曲名
        artist: track.artists[0].name, // アーティスト名
        albumArt: track.album.images[0]?.url, // アルバムアート
        previewUrl: track.preview_url // 視聴用URL
        
    }))
    return NextResponse.json(tracks);
 } catch (error){
    console.error(error);
    return NextResponse.json({ error: '接続に失敗しました' }, { status: 500 });
 }
}