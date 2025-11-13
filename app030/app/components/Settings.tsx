'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const GEMINI_API_KEY_STORAGE = 'gemini_api_key';

export default function Settings() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage on mount
    if (typeof window !== 'undefined') {
      return localStorage.getItem(GEMINI_API_KEY_STORAGE) || '';
    }
    return '';
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'testing'>(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE);
      return storedKey ? 'connected' : 'disconnected';
    }
    return 'disconnected';
  });
  const [message, setMessage] = useState('');

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}`
      );
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      setMessage('❌ APIキーを入力してください');
      return;
    }

    localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKey.trim());
    setStatus('connected');
    setMessage('✅ APIキーを保存しました');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setMessage('❌ APIキーを入力してください');
      return;
    }

    setStatus('testing');
    setMessage('⏳ テスト中...');

    const isValid = await validateApiKey(apiKey.trim());

    if (isValid) {
      setStatus('connected');
      setMessage('✅ APIキーは有効です');
    } else {
      setStatus('disconnected');
      setMessage('❌ APIキーが無効です。設定画面で確認してください。');
    }

    setTimeout(() => setMessage(''), 5000);
  };

  const handleDelete = () => {
    if (window.confirm('APIキーを削除してもよろしいですか？')) {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
      setApiKey('');
      setStatus('disconnected');
      setMessage('✅ APIキーを削除しました');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-md border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <span>⚙️</span>
          <span>設定</span>
        </h1>

        <div className="space-y-6">
          {/* AI機能セクション */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🤖</span>
              <span>AI機能（Gemini API）</span>
            </h2>

            {/* APIキー入力 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                APIキー:
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2 pr-12 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
                  placeholder="AIzaSy..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-700 rounded"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* ステータス表示 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                ステータス:
              </label>
              <div className="px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg">
                {status === 'connected' && (
                  <span className="text-green-400">✅ 接続済み</span>
                )}
                {status === 'disconnected' && (
                  <span className="text-red-400">❌ 未設定 / 無効</span>
                )}
                {status === 'testing' && (
                  <span className="text-yellow-400">⏳ テスト中...</span>
                )}
              </div>
            </div>

            {/* メッセージ表示 */}
            {message && (
              <div className="mb-4 px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-sm">
                {message}
              </div>
            )}

            {/* ボタングループ */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
              >
                保存
              </button>
              <button
                onClick={handleTest}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                disabled={status === 'testing'}
              >
                テスト
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                削除
              </button>
            </div>

            {/* 案内情報 */}
            <div className="text-sm text-slate-400 bg-slate-900/30 rounded-lg p-4">
              <p className="mb-2">ℹ️ APIキーの取得方法:</p>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Google AI Studio でAPIキーを取得
              </a>
              <p className="mt-3 text-xs text-slate-500">
                ⚠️ APIキーは安全に管理してください
                <br />
                公共のPCでは使用を避けてください
              </p>
            </div>
          </div>

          {/* ホームに戻るボタン */}
          <button
            onClick={handleBack}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
