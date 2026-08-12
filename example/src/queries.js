import { gql } from "@apollo/client";

/**
 * The operation NAME is what apollo-mock-http matches on — not the query text,
 * not the field. `GetContinents` here must equal the entry in
 * targetOperations, or the request falls through to the network.
 */
export const GET_CONTINENTS = gql`
  query GetContinents {
    continents {
      code
      name
    }
  }
`;

/**
 * Deliberately left out of targetOperations. It keeps hitting the real API even
 * while continents are mocked, which demonstrates per-operation granularity.
 */
export const GET_COUNTRIES = gql`
  query GetCountries($code: ID!) {
    continent(code: $code) {
      code
      name
      countries {
        code
        name
        emoji
        capital
      }
    }
  }
`;
