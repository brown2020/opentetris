import assert from "node:assert/strict";
import { describe, it } from "node:test";
import nextConfig from "../../next.config";
import { buildContentSecurityPolicy, securityHeaders } from "./security-headers";

describe("security headers", () => {
  it("sends nosniff and a CSP that cannot be framed", () => {
    const headers = Object.fromEntries(securityHeaders("production").map((header) => [header.key, header.value]));
    assert.equal(headers["X-Content-Type-Options"], "nosniff");
    assert.equal(headers["X-Frame-Options"], "DENY");
    assert.match(headers["Content-Security-Policy"], /default-src 'self'/);
    assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
    assert.match(headers["Content-Security-Policy"], /object-src 'none'/);
    assert.doesNotMatch(headers["Content-Security-Policy"], /unsafe-eval/);
  });

  it("allows the dev server websocket without dropping frame-ancestors", () => {
    const policy = buildContentSecurityPolicy("development");
    assert.match(policy, /frame-ancestors 'none'/);
    assert.match(policy, /connect-src 'self' ws: wss:/);
  });

  it("is attached to every route by the Next config", async () => {
    assert.equal(typeof nextConfig.headers, "function");
    const rules = await nextConfig.headers();
    assert.equal(rules.length, 1);
    assert.equal(rules[0].source, "/:path*");
    const csp = rules[0].headers.find((header) => header.key === "Content-Security-Policy");
    const nosniff = rules[0].headers.find((header) => header.key === "X-Content-Type-Options");
    assert.equal(nosniff?.value, "nosniff");
    assert.match(csp?.value ?? "", /frame-ancestors 'none'/);
  });
});
