import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

test("GET /api/health returns service status", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, "ok");
});

test("GET unknown API route returns 404", async () => {
  const res = await request(app).get("/api/does-not-exist");
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Route not found");
});

test("POST /api/health is not allowed and returns 404", async () => {
  const res = await request(app).post("/api/health");
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Route not found");
});
