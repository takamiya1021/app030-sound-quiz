# Claude Code on the Web - タスク指示

このドキュメントは、Claude Code on the Webで並行実行するタスクの指示文です。
各タスクを別々のタブで実行してください。

---

## タブ1: 音源ダウンロード（41個）

### タスク概要
空ファイル（0バイト）の音源41個を、Internet ArchiveなどからダウンロードしてPublic Domain音源で埋める。

### 指示文（そのままコピペ）

```
app030-sound-quizプロジェクトの音源ファイルをダウンロードしてください。

【現状】
- app030/public/sounds/ 配下に50個のmp3ファイルがある
- そのうち9個は既にダウンロード済み（サイズあり）
- 残り41個が空ファイル（0バイト）

【やること】
1. 空ファイルのリストを作成:
   ```bash
   find app030/public/sounds -name "*.mp3" -size 0 | sort
   ```

2. 各カテゴリーごとに著作権フリー音源をダウンロード:
   - 動物の鳴き声（9個）: cat, cow, dog, dolphin, horse, lion, owl, rooster, sparrow
   - 楽器の音（12個）: accordion, bass, cello, clarinet, drum, flute, harp, organ, saxophone, synth, trumpet, xylophone
   - 日常の音（10個）: car-horn, clock-tick, door-open, doorbell, microwave, phone-ring, typing, vacuum, washing-machine, water-tap
   - 自然の音（5個）: campfire, forest-birds, river, waterfall, waves
   - 効果音（5個）: applause, door-knock, footsteps, glass-break, laughter

3. 音源は以下から取得（CC0/Public Domain):
   - Internet Archive: https://archive.org/
     - https://archive.org/details/animalsounds1
     - https://archive.org/details/soundcollectionofdifferentinstruments
     - https://archive.org/details/relaxingsounds
   - SoundBible: https://soundbible.com/
   - Pixabay: https://pixabay.com/sound-effects/

4. ダウンロードは並列実行で高速化（10個ずつ&でバックグラウンド実行）

5. 完了後、ファイルサイズを確認:
   ```bash
   ls -lh app030/public/sounds/*/*.mp3 | grep -v " 0 "
   ```

【注意】
- ファイル名は既存の空ファイル名に合わせる
- すべてMP3形式
- ファイルサイズは100KB〜1MB程度を目安
- ライセンスは必ずCC0/Public Domainを確認
```

---

## タブ2: AI機能UI実装（APIキー設定画面）

### タスク概要
Gemini APIキーをLocalStorageで管理し、設定画面UIを実装する。

### 指示文（そのままコピペ）

```
app030-sound-quizプロジェクトにAI機能UI（APIキー設定画面）を実装してください。

【参照ドキュメント】
doc/ai-ui-spec.md を読んで、仕様に従って実装してください。

【実装内容】
1. 設定画面コンポーネント作成:
   - app/settings/page.tsx
   - app/components/Settings.tsx

2. LocalStorage管理機能:
   - キー名: 'gemini_api_key'
   - 保存・取得・削除機能

3. GeminiService修正:
   - lib/geminiService.ts
   - LocalStorageからAPIキー取得する処理を追加

4. 起動時チェック機能:
   - app/layout.tsx に追加
   - 初回アクセス時、APIキー未設定なら設定画面プロンプト表示

5. APIキー検証機能:
   - テストリクエストでAPIキーの有効性確認

6. エラーハンドリング:
   - 適切なエラーメッセージ表示

【UI要件】
- シンプルで使いやすいデザイン
- APIキーの表示/非表示切り替え（👁️ボタン）
- 保存・テスト・削除ボタン
- ステータス表示（✅接続済み / ❌未設定）

【テスト】
実装後、以下を確認:
1. APIキーを設定できる
2. LocalStorageに保存される
3. テストボタンで検証できる
4. AI機能が動作する
```

---

## タブ3: PWA実装

### タスク概要
アプリをPWA化し、オフライン動作・ホーム画面追加を可能にする。

### 指示文（そのままコピペ）

```
app030-sound-quizプロジェクトをPWA化してください。

【参照ドキュメント】
doc/pwa-spec.md を読んで、仕様に従って実装してください。

【実装内容】
1. Web App Manifest作成:
   - app030/public/manifest.json
   - アプリ名、アイコン、テーマカラー等を設定

2. アイコン画像作成:
   - app030/public/icons/ 配下に複数サイズ作成
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - maskable 192x192, 512x512
   - デザイン: 音符🎵またはスピーカー🔊をモチーフに

3. Service Worker実装:
   - app030/public/sw.js
   - キャッシュ戦略:
     - App Shell: Cache First
     - 音源ファイル: Cache First
     - Gemini API: Network First

4. HTMLへの統合:
   - app/layout.tsx に追加
   - manifest.jsonリンク
   - Service Worker登録
   - theme-color設定

5. インストールプロンプト:
   - コンポーネント作成
   - beforeinstallpromptイベント処理

【推奨: next-pwa使用】
より簡単に実装するなら next-pwa パッケージを使用:
```bash
npm install next-pwa
```
next.config.ts に設定追加

【テスト】
実装後、Lighthouseでスコア確認:
1. PWAスコアが80点以上
2. オフラインで動作する
3. ホーム画面に追加できる
```

---

## 並行実行の推奨順序

### Phase 1（同時実行可）
- タブ1: 音源ダウンロード（時間かかる）
- タブ2: AI機能UI実装
- タブ3: PWA実装

### Phase 2（全タブ完了後）
- 統合テスト
- 品質確認

---

## 完了チェックリスト

### タブ1（音源ダウンロード）
- [ ] 41個全てダウンロード完了
- [ ] 空ファイル（0バイト）がゼロ
- [ ] 全ファイルが再生可能

### タブ2（AI機能UI）
- [ ] 設定画面が表示される
- [ ] APIキーを保存できる
- [ ] AI機能が動作する

### タブ3（PWA）
- [ ] manifest.jsonが読み込まれる
- [ ] Service Workerが登録される
- [ ] Lighthouseスコア80点以上

---

## 注意事項

1. **各タブは独立して実行**
   - 依存関係がないため、どの順番でもOK
   - 完了したらコミット・プッシュ

2. **エラー発生時**
   - エラーメッセージを確認
   - 仕様書を参照
   - 必要に応じてクロに質問

3. **テストを忘れずに**
   - 実装後は必ず動作確認
   - 開発サーバーで確認: `npm run dev`

---

## 質問がある場合

仕様書（ai-ui-spec.md、pwa-spec.md）を参照してください。
それでも不明な場合は、クロに質問してください。
