import { ApolloClient, HttpLink, InMemoryCache, ApolloLink } from "@apollo/client";
import { injectMock } from "apollo-mock-http";

/**
 * A free, public GraphQL API — no key, no signup.
 * https://countries.trevorblades.com/
 */
export const ENDPOINT = "https://countries.trevorblades.com/graphql";

/**
 * The operations this example is willing to mock. Anything not named here goes
 * to the network even while mocking is on, which is the point of the library:
 * you mock the one endpoint you are working against, not the whole client.
 */
export const MOCKED_OPERATIONS = ["GetContinents"];

/**
 * Mock payloads are whole Apollo results — `{ data, errors }` — not just the
 * data half. Include `__typename` on every object: InMemoryCache normalizes on
 * it, and omitting it produces confusing cache misses rather than a clear error.
 */
export const MOCK_DATA = {
  GetContinents: {
    data: {
      continents: [
        { code: "MK", name: "Mockland", __typename: "Continent" },
        { code: "ST", name: "Stubbovia", __typename: "Continent" },
        { code: "FX", name: "Fixtureland", __typename: "Continent" },
      ],
    },
    errors: null,
  },
};

/**
 * An error response, to show that failures are mockable too. Apollo surfaces
 * this through the `error` field of useQuery exactly as a real server error.
 */
export const MOCK_ERROR = {
  GetContinents: {
    data: null,
    errors: [{ message: "Mocked failure: the continents service is down" }],
  },
};

/**
 * apollo-mock-http injects into an existing array of links rather than
 * replacing your client, so the real chain stays intact. Rebuilding the client
 * is what applies a change of mode — the link chain is fixed once constructed.
 *
 * `mode` is one of "off" | "data" | "error" | "localStorage".
 */
export function createClient(mode) {
  const links = [new HttpLink({ uri: ENDPOINT })];

  if (mode !== "off") {
    injectMock({
      links,
      enableMock: true,
      targetOperations: MOCKED_OPERATIONS,

      // Omitting mockData entirely makes the library fall back to the
      // AMH_mockdata key in localStorage. That is the "localStorage" mode here.
      mockData:
        mode === "localStorage"
          ? undefined
          : mode === "error"
            ? MOCK_ERROR
            : MOCK_DATA,

      // Simulated latency, so loading states are actually visible.
      defaultAPICallDuration: 600,
    });
  }

  return new ApolloClient({
    link: ApolloLink.from(links),
    cache: new InMemoryCache(),
  });
}
