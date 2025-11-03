# app030: 音当てクイズ - 技術設計書

## 1. 技術スタック

### 1.1 フレームワーク・ライブラリ
- **Next.js**: 14.x (App Router)
- **React**: 18.x
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x

### 1.2 選定理由
- **Next.js 14**: App Router、静的エクスポート可能、音声ファイル配信に最適
- **React 18**: useTransition等の最新機能、スムーズな音声再生制御
- **TypeScript**: 音声処理・クイズロジックの型安全性が重要
- **Tailwind CSS**: 楽しく親しみやすいUIを迅速に構築

### 1.3 主要ライブラリ
- **音声処理**: Web Audio API（ネイティブ）
- **状態管理**: Zustand
- **データ永続化**: LocalStorage
- **AI API**: @google/genai（Gemini API）
- **UI コンポーネント**: Radix UI
- **アイコン**: lucide-react
- **アニメーション**: framer-motion（正解時のアニメーション）

## 2. アーキテクチャ設計

### 2.1 全体アーキテクチャ
```
┌────────────────────────────────────────┐
│        Presentation Layer              │
│      (React Components + Quiz UI)      │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│       Application Layer                │
│    (State Management: Zustand)         │
│         (Quiz Engine)                  │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│          Audio Layer                   │
│        (Web Audio API)                 │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼─────────────────────────┐
│          Data Layer                    │
│   (LocalStorage + Gemini API)          │
└────────────────────────────────────────┘
```

### 2.2 コンポーネント構成
```
app/
├── page.tsx                    # ホーム画面
├── layout.tsx                  # ルートレイアウト
├── quiz/
│   └── page.tsx                # クイズ画面
└── components/
    ├── Home.tsx                # ホームコンポーネント
    ├── CategorySelector.tsx    # カテゴリー選択
    ├── DifficultySelector.tsx  # 難易度選択
    ├── QuizQuestion.tsx        # クイズ問題表示
    ├── AudioPlayer.tsx         # 音声プレイヤー
    ├── QuizChoices.tsx         # 選択肢
    ├── QuizExplanation.tsx     # 解説表示
    ├── QuizResult.tsx          # 結果表示
    ├── ProgressIndicator.tsx   # 進捗表示
    ├── ScoreDisplay.tsx        # スコア表示
    ├── SoundLibrary.tsx        # 音源ライブラリ（学習モード）
    ├── Statistics.tsx          # 統計表示
    ├── AISoundExplainer.tsx    # AI音声説明
    ├── AIListeningTips.tsx     # AI聞き分けアドバイス
    ├── ApiKeySettings.tsx      # APIキー設定
    └── Header.tsx              # ヘッダー
```

## 3. データモデル設計

### 3.1 SoundData（音源データ）
```typescript
interface SoundData {
  id: string;                    // UUID
  category: string;              // カテゴリー
  name: string;                  // 音の名前
  filename: string;              // ファイル名
  description: string;           // 説明文
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // 難易度
  aiDescription?: string;        // AI生成説明文
  createdAt?: Date;              // 作成日時
}
```

### 3.2 QuizSession（クイズセッション）
```typescript
interface QuizSession {
  id: string;                    // UUID
  category: string;              // カテゴリー
  difficulty: string;            // 難易度
  sounds: SoundData[];           // 音源配列（10問）
  currentIndex: number;          // 現在の問題番号
  answers: (number | null)[];    // 回答配列
  playCount: number[];           // 各問題の再生回数
  startedAt: Date;               // 開始日時
  completedAt?: Date;            // 完了日時
}
```

### 3.3 UserProgress（ユーザー進捗）
```typescript
interface UserProgress {
  totalQuizzes: number;          // 総クイズ数
  totalCorrect: number;          // 総正解数
  totalQuestions: number;        // 総問題数
  categoryStats: Record<string, CategoryStat>; // カテゴリー別統計
  studyDays: number;             // 学習日数
  lastStudyDate: string;         // 最終学習日（YYYY-MM-DD）
  confusedPairs: ConfusedPair[]; // よく間違える音の組み合わせ
}

interface CategoryStat {
  correct: number;               // 正解数
  total: number;                 // 総問題数
}

interface ConfusedPair {
  sound1: string;                // 音1のID
  sound2: string;                // 音2のID
  count: number;                 // 間違えた回数
}
```

### 3.4 AppSettings（アプリ設定）
```typescript
interface AppSettings {
  geminiApiKey?: string;         // Gemini APIキー
  masterVolume: number;          // マスターボリューム（0-1）
  maxPlayCount: number;          // 最大再生回数（デフォルト: 3）
}
```

## 4. ファイル構成

```
app030/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── quiz/
│   │   └── page.tsx
│   └── components/
│       ├── Home.tsx
│       ├── CategorySelector.tsx
│       ├── DifficultySelector.tsx
│       ├── QuizQuestion.tsx
│       ├── AudioPlayer.tsx
│       ├── QuizChoices.tsx
│       ├── QuizExplanation.tsx
│       ├── QuizResult.tsx
│       ├── ProgressIndicator.tsx
│       ├── ScoreDisplay.tsx
│       ├── SoundLibrary.tsx
│       ├── Statistics.tsx
│       ├── AISoundExplainer.tsx
│       ├── AIListeningTips.tsx
│       ├── ApiKeySettings.tsx
│       └── Header.tsx
├── lib/
│   ├── audioEngine.ts          # Web Audio API管理
│   ├── quizEngine.ts           # クイズエンジン
│   ├── soundBank.ts            # 音源バンク管理
│   ├── geminiService.ts        # Gemini API呼び出し
│   └── storage.ts              # LocalStorage管理
├── store/
│   └── useQuizStore.ts         # Zustand Store
├── types/
│   └── index.ts                # 型定義
├── public/
│   └── sounds/                 # 音源ファイル
│       ├── instruments/        # 楽器の音
│       │   ├── piano.mp3
│       │   ├── guitar.mp3
│       │   └── ...
│       ├── animals/            # 動物の鳴き声
│       │   ├── dog.mp3
│       │   ├── cat.mp3
│       │   └── ...
│       ├── daily/              # 日常の音
│       ├── nature/             # 自然の音
│       └── effects/            # 効果音
├── data/
│   └── sounds.json             # 音源メタデータ（50音）
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 5. API・インターフェース設計

### 5.1 Zustand Store
```typescript
interface QuizStore {
  // State
  currentSession: QuizSession | null;
  progress: UserProgress;
  sounds: SoundData[];
  isPlaying: boolean;

  // Quiz Actions
  startQuiz: (category: string, difficulty: string) => void;
  answerQuestion: (answerIndex: number) => void;
  playSound: (soundId: string) => void;
  stopSound: () => void;
  nextQuestion: () => void;
  finishQuiz: () => void;

  // Progress Actions
  recordResult: (correct: number, total: number, category: string) => void;
  recordConfusedPair: (sound1Id: string, sound2Id: string) => void;

  // Sound Management
  loadSounds: () => Promise<void>;

  // Computed
  currentSound: () => SoundData | null;
  score: () => { correct: number; total: number };
  categoryAccuracy: (category: string) => number;
}
```

### 5.2 Audio Engine（Web Audio API）
```typescript
interface AudioEngine {
  // 初期化
  init(): Promise<void>;

  // 音声読み込み
  loadSound(filename: string): Promise<AudioBuffer>;

  // 音声再生
  playSound(buffer: AudioBuffer): void;
  stopSound(): void;

  // ボリューム制御
  setVolume(volume: number): void;  // 0-1

  // 音量正規化
  normalizeVolume(buffer: AudioBuffer): AudioBuffer;

  // 状態
  isPlaying(): boolean;
}
```

### 5.3 Quiz Engine
```typescript
interface QuizEngine {
  // クイズ生成
  generateQuiz(
    category: string,
    difficulty: string,
    count: number
  ): SoundData[];

  // 選択肢生成（4択）
  generateChoices(
    correctSound: SoundData,
    allSounds: SoundData[]
  ): string[];

  // 正答判定
  checkAnswer(correctIndex: number, answerIndex: number): boolean;

  // スコア計算
  calculateScore(answers: (number | null)[], correctAnswers: number[]): {
    correct: number;
    total: number;
    percentage: number;
  };
}
```

### 5.4 Gemini API インターフェース
```typescript
interface GeminiService {
  // 音声説明文の自動生成
  generateSoundDescription(sound: SoundData): Promise<string>;

  // 聞き分けアドバイス
  generateListeningTips(
    sound1: SoundData,
    sound2: SoundData
  ): Promise<{
    differences: string[];
    focusPoints: string[];
    tips: string[];
  }>;

  // 類似音の違いを言語化
  explainDifferences(
    sounds: SoundData[]
  ): Promise<Record<string, string>>;

  // 学習プラン提案
  suggestStudyPlan(progress: UserProgress): Promise<{
    weakCategories: string[];
    recommendedOrder: string[];
    practiceSchedule: string[];
  }>;

  // 問題自動生成
  generateQuizQuestions(
    category: string,
    difficulty: string,
    count: number
  ): Promise<Array<{
    soundId: string;
    choices: string[];
    correctAnswer: number;
  }>>;
}
```

## 6. 主要機能の実装方針

### 6.1 音声処理（Web Audio API）

**音声読み込み**:
```typescript
// lib/audioEngine.ts
class AudioEngine {
  private audioContext: AudioContext;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private gainNode: GainNode;

  async init() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadSound(filename: string): Promise<AudioBuffer> {
    if (this.audioBuffers.has(filename)) {
      return this.audioBuffers.get(filename)!;
    }

    const response = await fetch(`/sounds/${filename}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    // 音量正規化
    const normalized = this.normalizeVolume(audioBuffer);
    this.audioBuffers.set(filename, normalized);

    return normalized;
  }

  playSound(buffer: AudioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    source.start();
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume;
  }
}
```

**音量正規化**:
```typescript
normalizeVolume(buffer: AudioBuffer): AudioBuffer {
  const data = buffer.getChannelData(0);
  let max = 0;

  // 最大振幅を検出
  for (let i = 0; i < data.length; i++) {
    max = Math.max(max, Math.abs(data[i]));
  }

  // 正規化（ピークを0.8に設定）
  const targetPeak = 0.8;
  const gain = targetPeak / max;

  const normalizedBuffer = this.audioContext.createBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const inputData = buffer.getChannelData(channel);
    const outputData = normalizedBuffer.getChannelData(channel);

    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * gain;
    }
  }

  return normalizedBuffer;
}
```

### 6.2 クイズエンジン

**問題選択ロジック**:
```typescript
function generateQuiz(
  category: string,
  difficulty: string,
  count: number
): SoundData[] {
  const filtered = sounds.filter(
    s => s.category === category && s.difficulty === difficulty
  );

  // シャッフル（Fisher-Yates）
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count);
}
```

**選択肢生成（4択）**:
```typescript
function generateChoices(
  correctSound: SoundData,
  allSounds: SoundData[]
): string[] {
  // 同じカテゴリーから3つの誤答を選択
  const wrongChoices = allSounds
    .filter(s => s.id !== correctSound.id && s.category === correctSound.category)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(s => s.name);

  // 正解と誤答を混ぜてシャッフル
  const choices = [correctSound.name, ...wrongChoices];
  return choices.sort(() => Math.random() - 0.5);
}
```

### 6.3 音声プレイヤーUI

```typescript
// components/AudioPlayer.tsx
export function AudioPlayer({ sound, maxPlayCount }: AudioPlayerProps) {
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (playCount >= maxPlayCount) {
      alert(`最大再生回数（${maxPlayCount}回）に達しました`);
      return;
    }

    setIsPlaying(true);
    await audioEngine.playSound(sound.filename);
    setPlayCount(prev => prev + 1);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handlePlay}
        disabled={isPlaying || playCount >= maxPlayCount}
        className="w-24 h-24 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
      >
        🔊
      </button>
      <p className="text-sm text-gray-600">
        残り{maxPlayCount - playCount}回再生できます
      </p>
    </div>
  );
}
```

### 6.4 間違えやすい音の記録

```typescript
function recordConfusedPair(sound1Id: string, sound2Id: string) {
  const pair = progress.confusedPairs.find(
    p => (p.sound1 === sound1Id && p.sound2 === sound2Id) ||
         (p.sound1 === sound2Id && p.sound2 === sound1Id)
  );

  if (pair) {
    pair.count += 1;
  } else {
    progress.confusedPairs.push({
      sound1: sound1Id,
      sound2: sound2Id,
      count: 1
    });
  }

  // 頻度順にソート
  progress.confusedPairs.sort((a, b) => b.count - a.count);
}
```

### 6.5 学習モード（音源ライブラリ）

```typescript
// components/SoundLibrary.tsx
export function SoundLibrary({ category }: SoundLibraryProps) {
  const sounds = useMemo(
    () => allSounds.filter(s => s.category === category),
    [category]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {sounds.map(sound => (
        <div key={sound.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{sound.name}</h3>
          <p className="text-sm text-gray-600">{sound.description}</p>
          <button
            onClick={() => audioEngine.playSound(sound.filename)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            再生
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 6.6 AI機能（Gemini API）

#### 音声説明文の自動生成
```typescript
async function generateSoundDescription(sound: SoundData): Promise<string> {
  const prompt = `音の名前: ${sound.name}
カテゴリー: ${sound.category}

この音の特徴を詳しく言葉で解説してください：
1. 音の特徴（音色、周波数帯域、音の長さ等）
2. 音の由来・背景情報
3. 他の似た音との違い

初心者にも分かりやすく、具体的に説明してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return response.text;
}
```

#### 聞き分けアドバイス
```typescript
async function generateListeningTips(
  sound1: SoundData,
  sound2: SoundData
): Promise<ListeningTips> {
  const prompt = `以下の2つの音の聞き分け方を教えてください：

音1: ${sound1.name} - ${sound1.description}
音2: ${sound2.name} - ${sound2.description}

以下の観点で説明してください：
1. 音の違い（音色、高さ、長さ等）
2. 聞き分けるための注目ポイント
3. 具体的な練習のコツ

初心者でも分かるように、具体的に説明してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return parseListeningTips(response.text);
}
```

#### 類似音の違いを言語化
```typescript
async function explainDifferences(sounds: SoundData[]): Promise<Record<string, string>> {
  const prompt = `以下の音の微妙な違いを言葉で説明してください：

${sounds.map(s => `- ${s.name}: ${s.description}`).join('\n')}

各音の特徴を具体的に表現し、初心者にも分かりやすく説明してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return parseDifferences(response.text);
}
```

#### 学習プラン提案
```typescript
async function suggestStudyPlan(progress: UserProgress): Promise<StudyPlan> {
  const categoryAccuracies = Object.entries(progress.categoryStats).map(
    ([category, stat]) => ({
      category,
      accuracy: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0
    })
  );

  const confusedSounds = progress.confusedPairs.slice(0, 5);

  const prompt = `ユーザーの音当てクイズ学習履歴:

カテゴリー別正答率:
${categoryAccuracies.map(c => `- ${c.category}: ${c.accuracy.toFixed(1)}%`).join('\n')}

よく間違える音の組み合わせ:
${confusedSounds.map(p => `- ${p.sound1} vs ${p.sound2} (${p.count}回)`).join('\n')}

この履歴から以下を分析してください：
1. 苦手なカテゴリー
2. 効果的な学習順序（段階的な難易度調整）
3. 個別最適化された練習プラン（3〜5ステップ）`;

  const response = await geminiAPI.generateContent(prompt);
  return parseStudyPlan(response.text);
}
```

#### 問題自動生成
```typescript
async function generateQuizQuestions(
  category: string,
  difficulty: string,
  count: number
): Promise<QuizQuestion[]> {
  const existingSounds = sounds
    .filter(s => s.category === category && s.difficulty === difficulty)
    .map(s => s.name);

  const prompt = `カテゴリー「${category}」の音当てクイズ問題を${count}問生成してください。

既存の音源:
${existingSounds.join(', ')}

各問題は以下の形式で出力してください：
{
  "soundId": "既存音源ID",
  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correctAnswer": 0
}

紛らわしい選択肢を含めて、難易度を調整してください。
JSON配列形式で出力してください。`;

  const response = await geminiAPI.generateContent(prompt);
  return JSON.parse(response.text);
}
```

## 7. パフォーマンス最適化

### 7.1 音声処理
- 音源プリロード（カテゴリー選択時）
- Web Audio API のバッファリング最適化
- 音量正規化処理（事前処理）

### 7.2 React最適化
- React.memo で選択肢ボタン再レンダリング抑制
- useMemo でフィルタリング結果をキャッシュ
- useTransition で画面遷移を最適化

### 7.3 ファイルサイズ
- 音源ファイルは最大500KB以下
- MP3形式（128kbps）で圧縮
- 総音源サイズ < 25MB

## 8. セキュリティ対策

### 8.1 音源ファイル
- 著作権フリー音源のみ使用
- ファイル名のサニタイズ

### 8.2 APIキー管理
- LocalStorage保存（平文）
- 設定画面でマスク表示

## 9. エラーハンドリング

### 9.1 音声処理
- 音源ロード失敗: 「音源の読み込みに失敗しました」
- Web Audio API未対応: 「お使いのブラウザは対応していません」
- 再生失敗: 「音声の再生に失敗しました」

### 9.2 Gemini API
- APIキー未設定: 「APIキーを設定してください」
- レート制限: 「APIリクエスト制限に達しました」
- 説明文生成失敗: 「AI説明文の生成に失敗しました」

### 9.3 LocalStorage
- 容量不足: 「ストレージ容量が不足しています」
- データ破損: 「進捗データの読み込みに失敗しました」

## 10. テスト戦略

### 10.1 単体テスト
- audioEngine の各関数
- quizEngine（問題生成、選択肢生成）
- 音量正規化処理

### 10.2 統合テスト
- 音声読み込み → 再生
- クイズ開始 → 回答 → 結果表示
- 学習モード全体フロー

### 10.3 E2Eテスト
- ユーザーシナリオ全体
- ブラウザ間互換性
- 音質・音量の確認

## 11. デプロイ・運用

### 11.1 ビルド
- `next build` で静的エクスポート
- 音源ファイルを public/sounds/ に配置

### 11.2 ブラウザ対応
- Chrome 90+（Web Audio API）
- Firefox 90+
- Safari 15+
- Edge 90+

### 11.3 モニタリング
- エラー追跡（Sentry等）
- 音声再生の成功率

## 12. 今後の拡張性

### 12.1 追加機能候補
- 音の波形表示（教育目的）
- 音声アップロード機能（自作問題作成）
- マルチプレイヤー対戦
- ランキング機能

### 12.2 技術的改善
- Service Worker（PWA化、オフライン対応）
- WebAssembly（音声処理高速化）
- IndexedDB（大量音源管理）
