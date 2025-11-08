import { SoundLibrary } from "@/app/components/SoundLibrary";

export default function LibraryPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.4em] text-indigo-200/80">LEARNING MODE</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight">
          音源ライブラリで
          <br />
          音の特徴をじっくり学ぶ
        </h1>
        <p className="mt-4 text-slate-200">
          カテゴリー別に整理された音源を自由に再生し、音色の違いや特徴をメモしながら理解を深めましょう。
        </p>
      </header>

      <SoundLibrary />
    </div>
  );
}
