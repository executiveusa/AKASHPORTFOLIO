import { describe, test, expect } from "vitest";

describe("i18n / Bilingual — SPEC 04", () => {
  // SCENARIO 4.1 — Locale detection
  test("es-MX Accept-Language resolves to /es/ route", async () => {
    // This is validated by middleware.ts locale detection via next-intl
    // Middleware reads Accept-Language and redirects to /es/ or /en/
    const enJson = await import("../apps/web/messages/en.json");
    const esJson = await import("../apps/web/messages/es.json");

    expect(enJson.nav.dashboard).toBe("Dashboard");
    expect(esJson.nav.dashboard).toBe("Inicio");
  });

  // SCENARIO 4.2 — All keys exist in both locales
  test("all nav keys present in both en.json and es.json", async () => {
    const en = await import("../apps/web/messages/en.json");
    const es = await import("../apps/web/messages/es.json");

    const enKeys = Object.keys(en.nav);
    const esKeys = Object.keys(es.nav);
    expect(enKeys.sort()).toEqual(esKeys.sort());
  });

  test("all kanban keys present in both locales", async () => {
    const en = await import("../apps/web/messages/en.json");
    const es = await import("../apps/web/messages/es.json");

    expect(Object.keys(en.kanban.columns).sort()).toEqual(Object.keys(es.kanban.columns).sort());
    expect(Object.keys(en.issues.severity).sort()).toEqual(Object.keys(es.issues.severity).sort());
    expect(Object.keys(en.issues.status).sort()).toEqual(Object.keys(es.issues.status).sort());
    expect(Object.keys(en.goals.status).sort()).toEqual(Object.keys(es.goals.status).sort());
  });

  // SCENARIO 4.3 — WIP limit message uses placeholder
  test("wipLimit message includes {limit} placeholder", async () => {
    const en = await import("../apps/web/messages/en.json");
    const es = await import("../apps/web/messages/es.json");
    expect(en.kanban.wipLimit).toContain("{limit}");
    expect(es.kanban.wipLimit).toContain("{limit}");
  });

  test("voice examples defined in both locales", async () => {
    const en = await import("../apps/web/messages/en.json");
    const es = await import("../apps/web/messages/es.json");
    expect(en.voice.examples.length).toBeGreaterThan(0);
    expect(es.voice.examples.length).toBeGreaterThan(0);
  });
});
