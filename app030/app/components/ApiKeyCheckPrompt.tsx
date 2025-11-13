'use client';

import { useRouter } from 'next/navigation';

interface ApiKeyCheckPromptProps {
  onComplete: () => void;
}

export default function ApiKeyCheckPrompt({ onComplete }: ApiKeyCheckPromptProps) {
  const router = useRouter();

  const handleSetup = () => {
    router.push('/settings');
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold mb-2">AI機能のセットアップ</h2>
          <p className="text-slate-300 text-sm">
            Gemini APIキーを設定すると、AI機能を使用できます
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 text-sm text-slate-300">
          <p className="mb-2">AI機能でできること:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>音の詳しい解説を表示</li>
            <li>聞き分けのヒントを取得</li>
            <li>学習プランの提案</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSetup}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
          >
            APIキーを設定する
          </button>
          <button
            onClick={handleSkip}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            スキップ（後で設定）
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          ※ AI機能なしでも基本機能は利用できます
        </p>
      </div>
    </div>
  );
}
