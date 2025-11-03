# app030: 音当てクイズ - 実装計画書（TDD準拠版）

## 概要
本実装計画書は、TDD（Test-Driven Development）の原則に従い、全ての機能実装において**Red-Green-Refactor**サイクルを適用します。Web Audio API、音源管理、AI音声説明機能を段階的に実装します。

## 完了条件
- ✅ 全テストがパス（Jest + React Testing Library + Playwright）
- ✅ コードカバレッジ80%以上
- ✅ ESLintエラー・警告ゼロ
- ✅ 音声再生レイテンシ < 100ms
- ✅ 50音以上のプリセット音源
- ✅ 要件定義書の全機能が実装済み

## 工数見積もり合計
**約48時間**（TDD対応分を含む）

---

## Phase 0: テスト環境構築（予定工数: 3時間）

### タスク

#### 【✔】0-1. Next.jsプロジェクト初期化（30分）
- `npx create-next-app@latest app030 --typescript --tailwind --app`
- **Red**: 動作確認テスト
- **Green**: プロジェクト起動確認
- **Refactor**: 不要ファイル削除

#### 【✔】0-2. Jestセットアップ（1時間）
- **Red**: Jest設定ファイルのテスト
- **Green**: Jest, @testing-library/react インストール
- Web Audio API モック設定
  ```typescript
  global.AudioContext = jest.fn();
  ```
- **Refactor**: 設定最適化

#### 【✔】0-3. Playwrightセットアップ（1時間）
- **Red**: E2Eテストスケルトン
- **Green**: Playwright インストール・設定
- **Refactor**: テスト構成整理

#### 【✔】0-4. テスト実行確認（30分）
- **Red**: ダミーテスト作成
- **Green**: テスト実行スクリプト設定
- **Refactor**: テストコマンド整理

---

## Phase 1: データモデル・状態管理実装（予定工数: 5時間）

### タスク

#### 【✔】1-1. 型定義作成（1時間）
- **Red**: 型定義のテスト
- **Green**: SoundData, QuizSession, UserProgress, AppSettings 定義
- **Refactor**: 型の共通化

#### 【✔】1-2. Zustand Store実装（3時間）
- **Red**: Store各アクションのテスト
  ```typescript
  test('should start quiz', () => {
    const { startQuiz, currentSession } = useQuizStore.getState();
    startQuiz('楽器の音', 'beginner');
    expect(currentSession).toBeDefined();
  });
  ```
- **Green**: `store/useQuizStore.ts` 実装
  - startQuiz, answerQuestion, playSound, stopSound
  - recordResult, recordConfusedPair
- **Refactor**: 状態管理最適化

#### 【✔】1-3. LocalStorage統合（1時間）
- **Red**: 永続化テスト
- **Green**: `lib/storage.ts` 実装
- **Refactor**: デバウンス処理

---

## Phase 2: 音源収集・配置（予定工数: 6時間）

### 目的
50音の著作権フリー音源を収集し、カテゴリー別に配置。

### タスク

#### 【✔】2-1. 音源収集（4時間）
- **Red**: 音源読み込みテスト
- **Green**: 50音収集
  - 楽器の音（15音）: piano.mp3, guitar.mp3, violin.mp3等
  - 動物の鳴き声（12音）: dog.mp3, cat.mp3等
  - 日常の音（10音）: doorbell.mp3, car-horn.mp3等
  - 自然の音（8音）: rain.mp3, thunder.mp3等
  - 効果音（5音）: clap.mp3, footstep.mp3等
- 音源: Freesound.org, SoundBible.com等から収集
- **Refactor**: 音質統一、ファイルサイズ最適化

#### 【✔】2-2. 音源配置・メタデータ作成（2時間）
- **Red**: メタデータ読み込みテスト
- **Green**:
  - public/sounds/ に音源配置（カテゴリー別フォルダ）
  - data/sounds.json 作成（SoundData配列）
- **Refactor**: スキーマ最適化

---

## Phase 3: 音声処理エンジン実装（Web Audio API）（予定工数: 7時間）

### タスク

#### 【 】3-1. AudioEngineクラス実装（3時間）
- **Red**: AudioEngineテスト（モック）
- **Green**: `lib/audioEngine.ts` 実装
  - AudioContext初期化
  - loadSound（音源読み込み）
  - playSound（音声再生）
  - stopSound（停止）
- **Refactor**: レイテンシ最適化

#### 【 】3-2. 音量正規化処理（2時間）
- **Red**: 音量正規化テスト
- **Green**: normalizeVolume 実装
  - 最大振幅検出
  - ピーク0.8に正規化
- **Refactor**: アルゴリズム最適化

#### 【 】3-3. ボリューム制御（1時間）
- **Red**: ボリューム制御テスト
- **Green**: setVolume 実装、GainNode使用
- **Refactor**: スムーズな音量変更

#### 【 】3-4. 音源プリロード（1時間）
- **Red**: プリロードテスト
- **Green**: カテゴリー選択時の音源事前読み込み
- **Refactor**: バッファリング最適化

---

## Phase 4: クイズエンジン実装（予定工数: 5時間）

### タスク

#### 【 】4-1. 問題選択ロジック（2時間）
- **Red**: 問題選択テスト
- **Green**: `lib/quizEngine.ts` 実装
  ```typescript
  function generateQuiz(category: string, difficulty: string, count: number): SoundData[]
  ```
- **Refactor**: シャッフルアルゴリズム

#### 【 】4-2. 選択肢生成（4択）（2時間）
- **Red**: 選択肢生成テスト
- **Green**: generateChoices 実装
  - 同カテゴリーから3つの誤答
  - シャッフル
- **Refactor**: 紛らわしい選択肢生成

#### 【 】4-3. 正答判定・スコア計算（1時間）
- **Red**: 正答判定テスト
- **Green**: checkAnswer, calculateScore 実装
- **Refactor**: ロジック最適化

---

## Phase 5: UIコンポーネント実装（予定工数: 8時間）

### タスク

#### 【 】5-1. Homeコンポーネント（1時間）
- **Red**: ホーム画面表示テスト
- **Green**: ホームUI実装
- **Refactor**: レイアウト調整

#### 【 】5-2. CategorySelectorコンポーネント（2時間）
- **Red**: カテゴリー選択テスト
- **Green**: カテゴリー一覧、アイコン表示実装
- **Refactor**: UX改善

#### 【 】5-3. AudioPlayerコンポーネント（2時間）
- **Red**: 音声プレイヤーテスト
- **Green**: 再生ボタン、再生回数表示実装
- **Refactor**: 視覚的フィードバック

#### 【 】5-4. QuizQuestionコンポーネント（1時間）
- **Red**: 問題表示テスト
- **Green**: 問題番号、カテゴリー名表示実装
- **Refactor**: レスポンシブ対応

#### 【 】5-5. QuizChoicesコンポーネント（2時間）
- **Red**: 選択肢表示・選択テスト
- **Green**: 4択ボタン、正誤フィードバック実装
- **Refactor**: framer-motion統合

---

## Phase 6: 学習モード実装（予定工数: 4時間）

### タスク

#### 【 】6-1. SoundLibraryコンポーネント（2時間）
- **Red**: 音源ライブラリ表示テスト
- **Green**: カテゴリー別タブ、音源リスト実装
- **Refactor**: 再生機能統合

#### 【 】6-2. 音源説明表示（2時間）
- **Red**: 説明文表示テスト
- **Green**: 各音源の説明文表示UI実装
- **Refactor**: レイアウト改善

---

## Phase 7: 間違えやすい音の記録機能実装（予定工数: 3時間）

### タスク

#### 【 】7-1. ConfusedPair記録ロジック（2時間）
- **Red**: 記録テスト
- **Green**: recordConfusedPair 実装
  - 音の組み合わせ記録
  - 頻度順ソート
- **Refactor**: データ構造最適化

#### 【 】7-2. 間違えやすい音の表示（1時間）
- **Red**: 表示テスト
- **Green**: よく間違える音の組み合わせ表示UI実装
- **Refactor**: ビジュアル改善

---

## Phase 8: AI機能実装（Gemini API）（予定工数: 6時間）

### タスク

#### 【 】8-1. Gemini API統合（1時間）
- **Red**: API接続テスト（モック）
- **Green**: `lib/geminiService.ts` 実装
- **Refactor**: エラーハンドリング

#### 【 】8-2. 音声説明文の自動生成（2時間）
- **Red**: 説明文生成テスト
- **Green**: generateSoundDescription 実装
  - 音の特徴解説
  - 由来・背景情報
- **Refactor**: プロンプト最適化

#### 【 】8-3. 聞き分けアドバイス（2時間）
- **Red**: アドバイス生成テスト
- **Green**: generateListeningTips 実装
  - 音の違い解説
  - 聞き分けポイント
- **Refactor**: アドバイス内容改善

#### 【 】8-4. 学習プラン提案（1時間）
- **Red**: プラン生成テスト
- **Green**: suggestStudyPlan 実装
  - 苦手カテゴリー分析
  - 学習順序提案
- **Refactor**: プラン内容最適化

---

## Phase 9: エラーハンドリング・バリデーション（予定工数: 3時間）

### タスク

#### 【 】9-1. 音声処理エラーハンドリング（1時間）
- **Red**: エラー処理テスト
- **Green**: 音源ロード失敗、Web Audio未対応処理
- **Refactor**: フォールバック実装

#### 【 】9-2. Gemini APIエラーハンドリング（1時間）
- **Red**: APIエラーテスト
- **Green**: レート制限、生成失敗処理
- **Refactor**: リトライロジック

#### 【 】9-3. 音源データバリデーション（1時間）
- **Red**: データ検証テスト
- **Green**: メタデータ検証、ファイル存在確認
- **Refactor**: エラーメッセージ改善

---

## Phase 10: E2Eテスト・統合テスト（予定工数: 4時間）

### タスク

#### 【 】10-1. クイズ出題・回答シナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: アサーション強化

#### 【 】10-2. 音声再生シナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: 音声再生確認
- **Refactor**: レイテンシ計測

#### 【 】10-3. 学習モードシナリオ（1時間）
- **Red**: E2Eテスト作成
- **Green**: テストパス確認
- **Refactor**: エッジケース追加

#### 【 】10-4. AI機能統合テスト（1時間）
- **Red**: AI機能E2Eテスト作成
- **Green**: モックAPI使用テスト
- **Refactor**: テスト安定性向上

---

## Phase 11: デプロイ準備・最終調整（予定工数: 2時間）

### タスク

#### 【 】11-1. 音源ファイル配置（30分）
- public/sounds/ に全音源配置
- 著作権フリー確認

#### 【 】11-2. 静的エクスポート設定（30分）
- next.config.js 設定
- ビルドエラー修正

#### 【 】11-3. ビルド・動作確認（30分）
- `npm run build` 実行
- 音声再生確認

#### 【 】11-4. README・音源クレジット作成（30分）
- セットアップ手順、使い方
- 音源提供元のクレジット表記

---

## マイルストーン

### M1: 音声エンジン実装完了（Phase 0-3）
- 期限: 開始から1週間
- 完了条件: 音源収集、Web Audio APIが動作

### M2: クイズ機能実装完了（Phase 4-5）
- 期限: 開始から2週間
- 完了条件: クイズ出題、音声再生、回答が動作

### M3: 学習・AI機能実装完了（Phase 6-8）
- 期限: 開始から3週間
- 完了条件: 学習モード、Gemini APIが動作

### M4: 品質保証・デプロイ準備完了（Phase 9-11）
- 期限: 開始から4週間
- 完了条件: 全テストパス、50音完成

---

## 依存関係

- Phase 0 → 全Phase（テスト環境必須）
- Phase 1 → Phase 4, 5, 8（データモデル依存）
- Phase 2 → Phase 3, 4, 5（音源データ依存）
- Phase 3 → Phase 5, 6（音声エンジン依存）
- Phase 4 → Phase 5（クイズエンジン依存）
- Phase 8 → Phase 2（音源メタデータ依存）
- Phase 9, 10 → 全機能実装完了後

---

## リスク管理

### 高リスク項目
1. **音源収集**: 著作権フリー音源の収集に時間がかかる
   - 対策: 事前に音源サイト調査、自作も検討
2. **音声レイテンシ**: 100ms以下の達成が困難
   - 対策: Web Audio API最適化、プリロード徹底

### 中リスク項目
1. **音質のばらつき**: 音源ごとに音質が異なる
   - 対策: 音量正規化処理、サンプリングレート統一
2. **ブラウザ互換性**: SafariでWeb Audio API制約
   - 対策: Safari専用テスト、フォールバック実装

---

## 品質チェックリスト

### コード品質
- [ ] ESLint エラー・警告ゼロ
- [ ] TypeScript型エラーゼロ
- [ ] 音声再生レイテンシ < 100ms
- [ ] 50音以上のプリセット音源

### テスト品質
- [ ] 単体テストカバレッジ80%以上
- [ ] E2Eテスト全シナリオパス
- [ ] ブラウザ間互換性確認（特にSafari）

### 音質品質
- [ ] 音質がクリアで聞き取りやすい
- [ ] 音量が統一されている
- [ ] 背景ノイズが除去されている

### UX品質
- [ ] 音声再生が直感的
- [ ] クイズがスムーズ
- [ ] 学習モードが役立つ
- [ ] AI説明が分かりやすい

### 著作権
- [ ] 全音源が著作権フリー
- [ ] 音源提供元のクレジット表記
