import { createContext, type Context } from "react";

/**
 * A React context that keeps the same identity when its module hot-reloads.
 * Without this, a reload creates a new context while the mounted provider still
 * holds the old one, so consumers lose their provider (blank screen in preview).
 */
const registry = ((globalThis as { __natalContexts?: Map<string, Context<unknown>> })
  .__natalContexts ??= new Map());

export function stableContext<T>(name: string, fallback: T): Context<T> {
  const existing = registry.get(name);
  if (existing) return existing as Context<T>;
  const created = createContext<T>(fallback);
  created.displayName = name;
  registry.set(name, created as Context<unknown>);
  return created;
}
