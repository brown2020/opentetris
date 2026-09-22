import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(here, "../app");

describe("route security (client-only)", () => {
  it("ships no API route handlers or server actions", () => {
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) out.push(...walk(p));
        else out.push(p);
      }
      return out;
    };
    const files = walk(appDir).map((f) => path.relative(appDir, f));
    assert.equal(files.some((f) => f.includes("route.ts")), false);
    assert.equal(files.some((f) => f.includes("route.js")), false);
    const page = fs.readFileSync(path.join(appDir, "page.tsx"), "utf8");
    assert.equal(/["']use server["']/.test(page), false);
  });
});
