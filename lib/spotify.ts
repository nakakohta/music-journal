/**
 * トークン取得ロジック
 * SpotifyのClient Credentials Flowを使用してアクセストークンを取得します。
 * 要は、Spotifyからトークンをもらうためのコード
 */

interface SpotifyToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export const getAccessToken = async (): Promise<SpotifyToken> => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    // Basic認証用の文字列を作成
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }),
        cache: 'no-store', // 毎回新しいトークンを取る設定
    });

    return response.json();
};