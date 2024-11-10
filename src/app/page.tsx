// src/app/page.tsx
"use client";

import TetrisGame from "@/components/tetris/TetrisGame";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-white mb-8">OpenTetris</h1>
        <TetrisGame />
      </div>
    </main>
  );
}
