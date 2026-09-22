import Link from "next/link";
import TetrisGame from "@/components/tetris/TetrisGame";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
        <header className="flex w-full items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-white">OpenTetris</h1>
          <nav aria-label="Primary">
            <Link
              href="/about"
              className="text-sm text-gray-300 underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              About
            </Link>
          </nav>
        </header>
        <TetrisGame />
      </div>
    </main>
  );
}
