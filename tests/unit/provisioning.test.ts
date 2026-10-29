import { spawnSync } from "node:child_process";
import { expect, it } from "vitest";

it("n'affiche pas un secret lorsque le JSON de provisionnement est invalide", () => {
  const sentinel = "private-password-must-not-be-logged";
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/provision-admin.ts"],
    {
      input: `{"password":"${sentinel}`,
      encoding: "utf8",
      timeout: 15000,
    },
  );
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("JSON invalide");
  expect(result.stderr + result.stdout).not.toContain(sentinel);
}, 20000);
