'use client';
import { useState, useEffect } from 'react';

// 型定義 (JavaのDTOクラスのようなもの)
interface Journal {
  id: number;
  content: string | null;
  mood: number;
  createdAt: string;
  song: {
    title: string;
    // Songの中にArtist情報も含める
    artist: {
        name: string;
    }
  };
}

export default function JournalPage() {
  const [form, setForm] = useState({
    title: '',
    artist: '',
    mood: 3,
    content: ''
  });
  
  // 日記一覧を管理するリスト (初期値は空の配列)
  const [journals, setJournals] = useState<Journal[]>([]);
  const [status, setStatus] = useState('');

  // データを取得する関数
  const fetchJournals = async () => {
    try {
      const res = await fetch('/api/journal'); // GETリクエスト
      const data = await res.json();

      // サーバから配列が返ってくる想定
      // もし配列ならStateにセット
      if (Array.isArray(data)) {
        setJournals(data);  // 取得したデータをStateに入れる -> 画面が更新される！
      } else {
        console.error('サーバからの応答が配列で来るはずなのに来ていないぜ:', data);
        alert("データ取得エラー: " + (data.error || "詳細不明"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 画面が表示された「後」に一度だけ実行される (初期ロード)
  useEffect(() => {
    fetchJournals();
    fetchArtists();
  }, []);



  // フォーム入力変更時のハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    // フォーム送信時のハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('送信中...');

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // フォームからはStringとして送られてくるので、moodをNumberに変換して送る
        body: JSON.stringify({
            title: form.title,
            artistName: form.artist,
            mood: Number(form.mood),
            content: form.content
        })
      });

      if (!res.ok) throw new Error('保存失敗');

      setStatus('✅ 保存しました！');
      setForm({ title: '', artist: '', mood: 3, content: '' });
      
      // 保存に成功したら、リストを再取得して表示を更新する
      fetchJournals();

    } catch (err: any) {
      setStatus(`❌ エラー: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return; // 確認ダイアログ

    try {
      const res = await fetch(`/api/journal?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('削除失敗');

      // 成功したらリストを更新
      fetchJournals();
      setStatus('✅ 削除しました！');
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  const [suggestedArtists, setSuggestedArtists] = useState<{ name: string }[]>([]);

  // 取得関数を追加
  const fetchArtists = async () => {
    const res = await fetch('/api/artist');
    const data = await res.json();
    setSuggestedArtists(data);
  };



  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 投稿フォーム */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">🎵 音楽ジャーナル</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">曲名</label>
              <input name="title" type="text" required className="w-full border p-2 rounded text-black" value={form.title} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">アーティスト</label>
              <input 
                name="artist" 
                type="text" 
                required 
                list="artist-list" 
                className="w-full border p-2 rounded text-black" 
                value={form.artist} 
                onChange={handleChange}
                placeholder="入力または選択..."
              />
              <datalist id="artist-list">
                {suggestedArtists.map((a) => (
                  <option key={a.name} value={a.name} />
                ))}
              </datalist>

            </div>

            {/* 気分スコアの選択肢 */}
            <div>
              <label className="block text-sm font-bold text-gray-700">今の気分スコア (1-5)</label>
              <select 
                name="mood" 
                className="w-full border p-2 rounded text-black" 
                value={form.mood} 
                onChange={handleChange}
              >
                <option value="5">5 - 最高！ (Happy) 😆</option>
                <option value="4">4 - 良い (Good) 😊</option>
                <option value="3">3 - 普通 (Neutral) 😐</option>
                <option value="2">2 - いまいち (Bad) 😞</option>
                <option value="1">1 - 最悪... (Terrible) 😭</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">コメント</label>
              <textarea name="content" className="w-full border p-2 rounded text-black" rows={3} value={form.content} onChange={handleChange} />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition">記録する</button>
          </form>
          {status && <p className="mt-4 text-center font-bold text-gray-700">{status}</p>}
        </div>

        {/* タイムライン */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📅 タイムライン</h2>
          <div className="space-y-4">
            {journals.map((journal) => (
              <div key={journal.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-indigo-500 relative group">
                <button
                  onClick={() => handleDelete(journal.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >✕</button>

                <div className="flex justify-between items-start pr-6">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{journal.song.title}</h3>
                    <p className="text-sm text-gray-500">{journal.song.artist.name}</p>
                  </div>
                  {/* スコアを表示 */}
                  <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                    Score: {journal.mood}
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{journal.content}</p>
                <p className="text-xs text-gray-400 mt-2 text-right">
                  {new Date(journal.createdAt).toLocaleString()}
                </p>
              </div>
            ))}

            {journals.length === 0 && (
              <p className="text-gray-500 text-center">まだ記録がありません。</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}