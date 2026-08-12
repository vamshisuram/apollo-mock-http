# apollo-mock-http example

A small Vite + React app that queries a real public GraphQL API and lets you
swap individual operations for mock data at runtime.

The API is [countries.trevorblades.com](https://countries.trevorblades.com/) —
free, public, no key or signup.

## Run it

```bash
cd example
yarn install
yarn dev
```

Then use the mode buttons at the top:

| Mode | What it shows |
| --- | --- |
| **Live** | No mock link at all. Every operation hits the network. |
| **Mock data** | `GetContinents` is served from `mockData`. |
| **Mock error** | `GetContinents` returns a GraphQL error, so you can build error states without breaking the server. |
| **Mock via localStorage** | No `mockData` is passed; the library falls back to the `AMH_mockdata` localStorage key. |

## What it demonstrates

**Mocking is per operation, not per client.** Only `GetContinents` is listed in
`targetOperations`. `GetCountries` keeps hitting the real API in every mode —
that is the whole point of the library, and the app makes it visible: pick a
mocked continent and the countries panel reports that the real API has never
heard of it.

**The operation name is the key.** `apollo-mock-http` matches on the GraphQL
operation name (`query GetContinents { … }`), not on the field or the query
text. A name mismatch means a silent fall-through to the network, which is the
most common reason mocking appears not to work.

**Mock payloads are whole results.** Each entry is `{ data, errors }`, the same
shape Apollo receives from a server — not just the `data` half. Every object
carries `__typename`, because `InMemoryCache` normalizes on it.

**Switching modes rebuilds the client.** The link chain is fixed when the client
is constructed, so there is no runtime toggle; `createClient(mode)` in
`src/client.js` builds a fresh one.

## Files

| File | Role |
| --- | --- |
| `src/client.js` | Where `injectMock` is wired in. The part worth copying. |
| `src/queries.js` | The two queries, one mocked and one deliberately not. |
| `src/App.jsx` | Mode switching and rendering. |
| `smoke.mjs` | Offline checks that the mock paths actually work. |

## Smoke test

```bash
yarn smoke
```

Verifies that mock data is served, that mocked errors surface as GraphQL errors,
that the localStorage fallback works, and that constructing a client without
`localStorage` does not throw. It runs entirely offline — mocked operations
short-circuit before the HTTP link — so it does not depend on the public API
being reachable. CI runs it on every pull request so this example cannot rot.

It runs through `vite-node` rather than plain `node` because `@apollo/client` v3
ships no `exports` map: Node resolves its CommonJS entry and cannot see the
named exports, while bundlers use the ESM one. Running it through Vite exercises
the same resolution the app itself uses.
