# AI機能UI（APIキー設定画面）実装仕様書

## 概要
Gemini APIキーをLocalStorageで管理し、アプリ内設定画面で登録・変更できるようにする。

## 実装状況
❌ **未実装** - 現在は環境変数（`NEXT_PUBLIC_GEMINI_API_KEY`）からのみ取得

## 要件（requirements.mdより）

### 4.4 AI機能（Gemini API）
- **APIキー管理**
  - 保存場所: LocalStorage
  - 保存形式: 平文（暗号化なし）
  - キー名: `gemini_api_key`
  - 設定UI: アプリ内設定画面で登録・変更可能

- **起動時チェック**
  - APIキー未登録時は設定画面を表示
  - APIキー検証（簡易的な接続テスト）
  - エラーハンドリング（APIキー無効時の対応）

- **AI機能の利用**
  - AI機能はオプション（APIキーなしでも基本機能は利用可能）
  - API呼び出しエラー時の適切なフィードバック
  - レート制限への対応

## 実装仕様

### 1. 設定画面コンポーネント（Settings.tsx）

#### 配置場所
```
app030/app/settings/page.tsx
app030/app/components/Settings.tsx
```

#### UI構成
```
┌─────────────────────────────┐
│  ⚙️ 設定                     │
├─────────────────────────────┤
│                             │
│  🤖 AI機能（Gemini API）    │
│                             │
│  APIキー:                   │
│  [__________________] 👁️    │
│                             │
│  ステータス:                │
│  ✅ 接続済み                │
│  または                     │
│  ❌ 未設定 / 無効           │
│                             │
│  [保存] [テスト] [削除]    │
│                             │
│  ℹ️ APIキーの取得方法:      │
│  https://makersuite...      │
│                             │
├─────────────────────────────┤
│  [ホームに戻る]             │
└─────────────────────────────┘
```

### 2. LocalStorage管理

#### 保存形式
```typescript
// キー名
const GEMINI_API_KEY = 'gemini_api_key';

// 保存
localStorage.setItem(GEMINI_API_KEY, apiKey);

// 取得
const apiKey = localStorage.getItem(GEMINI_API_KEY);

// 削除
localStorage.removeItem(GEMINI_API_KEY);
```

### 3. GeminiService修正

#### 現在の実装
```typescript
constructor(options: GeminiServiceOptions = {}) {
  this.apiKey = options.apiKey
    ?? process.env.GEMINI_API_KEY
    ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}
```

#### 修正後の実装
```typescript
constructor(options: GeminiServiceOptions = {}) {
  this.apiKey = options.apiKey
    ?? (typeof window !== 'undefined'
        ? localStorage.getItem('gemini_api_key') ?? undefined
        : undefined)
    ?? process.env.GEMINI_API_KEY
    ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}
```

### 4. 起動時チェック機能

#### app/layout.tsx に追加
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // 初回アクセス時のみチェック
    const hasChecked = sessionStorage.getItem('api_key_checked');

    if (!hasChecked) {
      const apiKey = localStorage.getItem('gemini_api_key');

      if (!apiKey) {
        // APIキー未設定時は設定画面を表示
        setShowSettings(true);
      }

      sessionStorage.setItem('api_key_checked', 'true');
    }
  }, []);

  if (showSettings) {
    return <SettingsPrompt onComplete={() => setShowSettings(false)} />;
  }

  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

### 5. APIキー検証機能

#### テストリクエスト
```typescript
async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    return response.ok;
  } catch {
    return false;
  }
}
```

### 6. エラーハンドリング

#### エラーメッセージ
- **APIキー未設定**: "AI機能を使用するには、設定画面でAPIキーを登録してください。"
- **APIキー無効**: "APIキーが無効です。設定画面で確認してください。"
- **レート制限**: "APIの利用制限に達しました。しばらくお待ちください。"
- **ネットワークエラー**: "ネットワークエラーが発生しました。接続を確認してください。"

## UI/UXフロー

### 初回アクセス時
1. アプリ起動
2. LocalStorageチェック
3. APIキーなし → 設定画面プロンプト表示
4. ユーザーが「スキップ」または「設定する」を選択
5. 設定完了 → ホーム画面へ

### 設定画面アクセス時
1. ホーム画面の⚙️アイコンをクリック
2. 設定画面表示
3. APIキー入力
4. 「テスト」ボタンで検証
5. 「保存」ボタンで保存
6. ホーム画面に戻る

### AI機能使用時
1. AI機能をリクエスト
2. LocalStorageからAPIキー取得
3. APIキーなし → フォールバック応答
4. APIキーあり → Gemini API呼び出し
5. エラー時 → フォールバック応答 + エラーメッセージ

## セキュリティ考慮事項

### 平文保存のリスク
- LocalStorageは平文保存（暗号化なし）
- ブラウザのDevToolsでアクセス可能
- XSS攻撃に脆弱

### 対策
- HTTPS通信必須
- Content Security Policy設定
- ユーザーへの注意喚起
  - "APIキーは安全に管理してください"
  - "公共のPCでは使用を避けてください"

## テストシナリオ

### 1. 初回アクセステスト
- [ ] APIキー未設定時、設定画面プロンプトが表示される
- [ ] 「スキップ」で基本機能が使える
- [ ] 「設定する」で設定画面に遷移

### 2. APIキー設定テスト
- [ ] APIキーを入力できる
- [ ] 「テスト」ボタンで検証できる
- [ ] 有効なAPIキーで成功メッセージ
- [ ] 無効なAPIキーでエラーメッセージ
- [ ] 「保存」で LocalStorage に保存

### 3. AI機能統合テスト
- [ ] APIキー設定後、AI機能が動作
- [ ] APIキー削除後、フォールバック応答
- [ ] API呼び出しエラー時、適切なエラー表示

## 実装優先度
**高** - AI機能を使用するために必須

## 参考リンク
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
