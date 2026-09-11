import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agents } from "./agents.js";
import type { AgentType } from "../types.js";

describe("agents registry", () => {
  const expectedNewAgents: AgentType[] = [
    "antigravity",
    "codebuddy",
    "codebuddy-cn",
    "workbuddy",
    "workbuddy-ai",
    "trae-cn",
    "pi",
    "mercury",
  ];

  it("should have all 8 new agents registered", () => {
    for (const agentName of expectedNewAgents) {
      assert.ok(
        agents[agentName],
        `Agent "${agentName}" should be present in agents registry`
      );
      assert.equal(
        agents[agentName].name,
        agentName,
        `Agent "${agentName}" name property must match key`
      );
      assert.ok(
        agents[agentName].displayName.length > 0,
        `Agent "${agentName}" must have a non-empty displayName`
      );
      assert.ok(
        agents[agentName].skillsDir.length > 0,
        `Agent "${agentName}" must have a non-empty skillsDir`
      );
      assert.ok(
        agents[agentName].globalSkillsDir.length > 0,
        `Agent "${agentName}" must have a non-empty globalSkillsDir`
      );
      assert.equal(
        typeof agents[agentName].detectInstalled,
        "function",
        `Agent "${agentName}" must have a detectInstalled function`
      );
    }
  });

  it("should register 28 total coding agents", () => {
    const keys = Object.keys(agents);
    assert.equal(keys.length, 28, `Expected 28 agents registered, found ${keys.length}`);
  });

  it("should safely evaluate detectInstalled without crashing", async () => {
    for (const agentName of expectedNewAgents) {
      const isInstalled = await agents[agentName].detectInstalled();
      assert.equal(typeof isInstalled, "boolean");
    }
  });
});
