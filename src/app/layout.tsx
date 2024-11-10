// src/app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "OpenTetris Game",
  description:
    "A modern Open Source Tetris clone built with Next.js and TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
