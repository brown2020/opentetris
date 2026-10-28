export const LEFT_KEYS = new Set(["ArrowLeft", "a", "A"]);
export const RIGHT_KEYS = new Set(["ArrowRight", "d", "D"]);

const INTERACTIVE_TAGS = new Set(["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"]);

export function shouldIgnoreGameKey(event: {
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  target?: EventTarget | null;
}): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  const target = event.target;
  if (!target || typeof target !== "object") return false;
  if ("isContentEditable" in target && Boolean((target as { isContentEditable?: boolean }).isContentEditable)) {
    return true;
  }
  if ("tagName" in target && typeof (target as { tagName?: unknown }).tagName === "string") {
    return INTERACTIVE_TAGS.has((target as { tagName: string }).tagName.toUpperCase());
  }
  return false;
}

export function directionStillHeld(
  heldKeys: Iterable<string>,
  direction: "left" | "right"
): boolean {
  const aliases = direction === "left" ? LEFT_KEYS : RIGHT_KEYS;
  for (const key of heldKeys) {
    if (aliases.has(key)) return true;
  }
  return false;
}
