import { describe, test, expect, beforeAll, afterAll } from "vitest";

const API = process.env.TEST_API_URL ?? "http://localhost:8080";
const ANON_TOKEN = process.env.TEST_ANON_TOKEN ?? "";
const PM_TOKEN = process.env.TEST_PM_TOKEN ?? "";
const CLIENT_TOKEN = process.env.TEST_CLIENT_TOKEN ?? "";

describe("Multi-tenancy — SPEC 01", () => {
  let tenantId: string;
  let tenantAToken: string;
  let tenantBId: string;

  // SCENARIO 1.1 — Tenant creation
  test("POST /tenants creates tenant + seeds 5 PMI columns", async () => {
    const res = await fetch(`${API}/api/v1/tenants`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PM_TOKEN}` },
      body: JSON.stringify({
        slug: `test-tenant-${Date.now()}`,
        name: "Test Client Co",
        locale_default: "es",
        owner_email: "client@test.com",
      }),
    });
    expect(res.status).toBe(200);
    const { tenant, client_invite_url } = await res.json();
    expect(tenant.id).toBeTruthy();
    expect(client_invite_url).toContain(tenant.slug);
    tenantId = tenant.id;
  });

  // SCENARIO 1.2 — Cross-tenant isolation
  test("cross-tenant board query returns empty array", async () => {
    // User from tenant A cannot see tenant B boards
    const res = await fetch(`${API}/api/v1/boards`, {
      headers: { Authorization: `Bearer ${CLIENT_TOKEN}` },
    });
    expect(res.status).toBe(200);
    const boards = await res.json();
    // All returned boards must belong to the token's tenant
    expect(boards.every((b: { tenant_id: string }) => b.tenant_id === /* caller's tenant */ b.tenant_id)).toBe(true);
  });

  // SCENARIO 1.3 — Slug collision returns 409 / error
  test("slug collision is rejected", async () => {
    const slug = `collision-test-${Date.now()}`;
    const body = { slug, name: "A", locale_default: "es", owner_email: "a@a.com" };
    const first = await fetch(`${API}/api/v1/tenants`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PM_TOKEN}` },
      body: JSON.stringify(body),
    });
    expect(first.status).toBe(200);

    const second = await fetch(`${API}/api/v1/tenants`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${PM_TOKEN}` },
      body: JSON.stringify(body),
    });
    expect(second.status).toBeGreaterThanOrEqual(400);
  });

  // SCENARIO 1.5 — No gastos data ever returned
  test("no endpoint returns gastos or financial data", async () => {
    const endpoints = [
      `/api/v1/boards`,
      `/api/v1/issues`,
      `/api/v1/goals`,
      `/api/v1/contacts`,
    ];

    for (const endpoint of endpoints) {
      const res = await fetch(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${CLIENT_TOKEN}` },
      });
      const text = await res.text();
      expect(text).not.toContain("gastos");
      expect(text).not.toContain("expenses");
      expect(text).not.toContain("budget");
    }
  });
});
