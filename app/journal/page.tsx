'use client';
import { useState } from 'react';

export default function JournalPage() {
  // フォームの入力値をひとまとめにする
  const [form, setForm] = useState({
    title: '',
    artist: '',
    mood: 'Happy',
    content: ''
  });

  const [status, setStatus] = useState(''); // 送信状態メッセージ

  // 入力欄が変わるたびに実行される共通ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form, //今のformの内容を展開して...
      [e.target.name]: e.target.value // 変更された項目だけ上書きする
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //リロード阻止
    setStatus('送信中...');

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      // エラーハンドリング
      if (!res.ok) {
        //apiの生のエラーメッセージをここで表示
        throw new Error(data.error || data.details || 'エラーが発生');
      }

      setStatus('保存しました');
      // フォームをリセット
      setForm({
        title: '',
        artist: '',
        mood: 'Happy',
        content: ''
      });
    } catch (err: any) {
      setStatus(`エラー: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">🎵 音楽ジャーナル</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 曲名 */}
          <div>
            <label className="block text-sm font-bold text-gray-700">曲名</label>
            <input
              name="title"
              type="text"
              required
              className="w-full border p-2 rounded text-black"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          {/* アーティスト */}
          <div>
            <label className="block text-sm font-bold text-gray-700">アーティスト</label>
            <input
              name="artist"
              type="text"
              required
              className="w-full border p-2 rounded text-black"
              value={form.artist}
              onChange={handleChange}
            />
          </div>

          {/* 気分 (セレクトボックス) */}
          <div>
            <label className="block text-sm font-bold text-gray-700">今の気分</label>
            <select
              name="mood"
              className="w-full border p-2 rounded text-black"
              value={form.mood}
              onChange={handleChange}
            >
              <option value="Happy">Happy 😊</option>
              <option value="Sad">Sad 😢</option>
              <option value="Excited">Excited 🤩</option>
              <option value="Relaxed">Relaxed 😌</option>
            </select>
          </div>

          {/* 日記本文 */}
          <div>
            <label className="block text-sm font-bold text-gray-700">一言コメント</label>
            <textarea
              name="content"
              required
              className="w-full border p-2 rounded text-black"
              rows={3}
              value={form.content}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition"
          >
            記録する
          </button>
        </form>

        {/* ステータス表示エリア */}
        {status && (
          <p className="mt-4 text-center font-bold text-gray-700 whitespace-pre-wrap">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
