import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <article className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-bold">About OpenTetris</h1>
        <p>
          OpenTetris is a client-only Tetris clone built with Next.js, React, and
          TypeScript. Gameplay state lives in the browser; high scores persist in
          localStorage. There is no account system and no server mutation API.
        </p>
        <p>
          Use keyboard controls on desktop or on-screen buttons on mobile. Pause
          with P, reset with R, and change classic/modern settings when the game
          is paused or over.
        </p>
        <p>
          <Link
            href="/"
            className="underline underline-offset-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            Back to game
          </Link>
        </p>
      </article>
    </main>
  );
}
