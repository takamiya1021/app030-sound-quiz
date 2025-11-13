# PWA（Progressive Web App）実装仕様書

## 概要
音当てクイズアプリをPWA化し、オフライン動作・ホーム画面追加を可能にする。

## 実装状況
❌ **未実装** - manifest.json、Service Workerが存在しない

## 要件（requirements.mdより）

### 6.1 環境要件
- モダンブラウザ対応（Web Audio API）
- レスポンシブデザイン（デスクトップ・タブレット・スマホ）
- **オフライン動作可能（音源プリロード）**

## PWA要件

### 1. 必須要件
- ✅ HTTPS通信（開発環境ではlocalhostでOK）
- ❌ Web App Manifest（manifest.json）
- ❌ Service Worker
- ❌ アイコン画像（複数サイズ）

### 2. オプション要件
- インストール可能（A2HS: Add to Home Screen）
- オフライン動作
- プッシュ通知（不要）
- バックグラウンド同期（不要）

## 実装仕様

### 1. Web App Manifest（manifest.json）

#### 配置場所
```
app030/public/manifest.json
```

#### 設定内容
```json
{
  "name": "音当てクイズ - Sound Quiz",
  "short_name": "音当てクイズ",
  "description": "ランダムに再生される音を聞いて、何の音かを当てるクイズアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["education", "games", "entertainment"],
  "lang": "ja",
  "dir": "ltr"
}
```

### 2. アイコン画像

#### 必要なサイズ
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192（最小推奨サイズ）
- 384x384
- 512x512（推奨サイズ）
- maskable 192x192
- maskable 512x512

#### 配置場所
```
app030/public/icons/
  ├── icon-72x72.png
  ├── icon-96x96.png
  ├── icon-128x128.png
  ├── icon-144x144.png
  ├── icon-152x152.png
  ├── icon-192x192.png
  ├── icon-384x384.png
  ├── icon-512x512.png
  ├── icon-maskable-192x192.png
  └── icon-maskable-512x512.png
```

#### デザインガイドライン
- 背景色: 白（#ffffff）
- アイコン色: 青系（#3b82f6）
- モチーフ: 音符🎵 or スピーカー🔊
- シンプルで視認性の高いデザイン

### 3. Service Worker

#### 配置場所
```
app030/public/sw.js
```

#### キャッシュ戦略

**1. App Shell（Cache First）**
- HTML, CSS, JS
- アプリの骨格部分

**2. 音源ファイル（Cache First）**
- `/sounds/**/*.mp3`
- 一度ダウンロードしたらキャッシュから提供

**3. API（Network First）**
- Gemini API
- ネットワーク優先、失敗時はフォールバック

#### 実装例
```javascript
const CACHE_NAME = 'sound-quiz-v1';
const SOUND_CACHE = 'sound-quiz-sounds-v1';

const APP_SHELL = [
  '/',
  '/quiz',
  '/library',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== SOUND_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// フェッチ時
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 音源ファイル: Cache First
  if (url.pathname.includes('/sounds/')) {
    event.respondWith(
      caches.open(SOUND_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) return response;

          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Gemini API: Network First
  if (url.hostname === 'generativelanguage.googleapis.com') {
    event.respondWith(
      fetch(request).catch(() => {
        // ネットワークエラー時はフォールバック
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // App Shell: Cache First
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
```

### 4. HTMLへの統合（app/layout.tsx）

#### manifest.jsonリンク
```typescript
export const metadata = {
  title: '音当てクイズ - Sound Quiz',
  description: 'ランダムに再生される音を聞いて、何の音かを当てるクイズアプリ',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '音当てクイズ',
  },
};
```

#### Service Worker登録
```typescript
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 5. インストールプロンプト

#### UI実装
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <p className="mb-2">アプリをインストールしますか？</p>
      <button
        onClick={handleInstall}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        インストール
      </button>
      <button
        onClick={() => setShowInstall(false)}
        className="text-gray-600 px-4 py-2"
      >
        後で
      </button>
    </div>
  );
}
```

## テストシナリオ

### 1. Manifestテスト
- [ ] manifest.jsonが正しく読み込まれる
- [ ] アイコンが全サイズ表示される
- [ ] theme-colorが反映される

### 2. Service Workerテスト
- [ ] Service Workerが登録される
- [ ] App Shellがキャッシュされる
- [ ] 音源ファイルがキャッシュされる
- [ ] オフライン時も音が再生できる

### 3. インストールテスト
- [ ] インストールプロンプトが表示される
- [ ] ホーム画面に追加できる
- [ ] スタンドアロンモードで起動できる
- [ ] アイコンが正しく表示される

### 4. オフライン動作テスト
- [ ] ネットワークをオフにしてもアプリが動作
- [ ] キャッシュ済み音源が再生できる
- [ ] AI機能はフォールバック応答

## Lighthouse PWAチェックリスト

### Core Progressive Web App
- [ ] Registers a service worker
- [ ] Responds with a 200 when offline
- [ ] Provides a valid manifest.json
- [ ] Uses HTTPS

### Additional PWA Checks
- [ ] Contains content when JavaScript is not available
- [ ] Has a viewport meta tag
- [ ] Content is sized correctly for the viewport
- [ ] Has a theme-color meta tag
- [ ] Provides a valid apple-touch-icon

## Next.js 14 での PWA 実装

### next-pwa パッケージ使用（推奨）

#### インストール
```bash
npm install next-pwa
```

#### next.config.ts 設定
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // 既存の設定
});
```

## 実装優先度
**中** - UX向上のために推奨

## 参考リンク
- [PWA Documentation - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
