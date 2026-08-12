/**
 * Smoke test for the example.
 *
 * apollo-mock-http's MockLink extends ApolloLink from the legacy `apollo-link`
 * package, while consumers compose it into @apollo/client's chain. That the two
 * interoperate is the load-bearing assumption of this example, and a type-check
 * or a successful bundle does not prove it — only executing a query does.
 *
 * Runs entirely offline: mocked operations short-circuit before the HTTP link,
 * so this is safe to run in CI without depending on the public API being up.
 */
import assert from "node:assert/strict";
import { createClient, MOCK_DATA } from "./src/client.js";
import { GET_CONTINENTS } from "./src/queries.js";

const checks = [];
function check(name, fn) {
  checks.push({ name, fn });
}

check("mockData is served in place of the network response", async () => {
  const client = createClient("data");
  const { data } = await client.query({ query: GET_CONTINENTS });

  assert.equal(data.continents.length, 3);
  assert.equal(data.continents[0].name, "Mockland");
});

check("mocked errors surface as GraphQL errors", async () => {
  const client = createClient("error");
  await assert.rejects(
    () => client.query({ query: GET_CONTINENTS }),
    /continents service is down/
  );
});

check("localStorage supplies mock data when mockData is omitted", async () => {
  // The library reads AMH_mockdata from localStorage. Node has no localStorage,
  // which is precisely the environment the library's guard exists for, so the
  // example provides the minimum surface it uses.
  const store = new Map([["AMH_mockdata", JSON.stringify(MOCK_DATA)]]);
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null };

  try {
    const client = createClient("localStorage");
    const { data } = await client.query({ query: GET_CONTINENTS });
    assert.equal(data.continents[0].name, "Mockland");
  } finally {
    delete globalThis.localStorage;
  }
});

check("constructing a client does not throw without localStorage", () => {
  assert.equal(typeof globalThis.localStorage, "undefined");
  assert.ok(createClient("data"));
});

let failed = 0;
for (const { name, fn } of checks) {
  try {
    await fn();
    process.stdout.write(`  ok   ${name}\n`);
  } catch (err) {
    failed += 1;
    process.stdout.write(`  FAIL ${name}\n       ${err.message}\n`);
  }
}

process.stdout.write(
  `\n${checks.length - failed}/${checks.length} checks passed\n`
);
process.exit(failed === 0 ? 0 : 1);
