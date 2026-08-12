import { useState } from "react";
import { ApolloProvider, useQuery } from "@apollo/client";
import { createClient, ENDPOINT, MOCK_DATA } from "./client";
import { GET_CONTINENTS, GET_COUNTRIES } from "./queries";

const MODES = [
  { id: "off", label: "Live", hint: "Every operation hits the real API." },
  { id: "data", label: "Mock data", hint: "GetContinents is served from mockData." },
  { id: "error", label: "Mock error", hint: "GetContinents returns a GraphQL error." },
  {
    id: "localStorage",
    label: "Mock via localStorage",
    hint: "No mockData passed — the library reads the AMH_mockdata key.",
  },
];

function Continents({ selected, onSelect }) {
  const { data, loading, error } = useQuery(GET_CONTINENTS);

  if (loading) return <p className="muted">Loading continents…</p>;
  if (error) return <p className="error">{error.message}</p>;

  return (
    <div className="chips">
      {data.continents.map((c) => (
        <button
          key={c.code}
          className={c.code === selected ? "chip chip-on" : "chip"}
          onClick={() => onSelect(c.code)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

function Countries({ code }) {
  const { data, loading, error } = useQuery(GET_COUNTRIES, {
    variables: { code },
    skip: !code,
  });

  if (!code) return <p className="muted">Pick a continent above.</p>;
  if (loading) return <p className="muted">Loading countries…</p>;
  if (error) return <p className="error">{error.message}</p>;

  // Mocked continent codes do not exist upstream, so the real API returns null.
  // That is the intended lesson, not a bug: only GetContinents is mocked.
  if (!data.continent) {
    return (
      <p className="muted">
        The real API has no continent <code>{code}</code>. GetCountries was never
        mocked, so it still went to the network — which is exactly the point.
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Country</th>
          <th>Capital</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        {data.continent.countries.map((c) => (
          <tr key={c.code}>
            <td>
              <span className="flag">{c.emoji}</span> {c.name}
            </td>
            <td>{c.capital || "—"}</td>
            <td><code>{c.code}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const [mode, setMode] = useState("off");
  const [selected, setSelected] = useState(null);

  // A new client per mode. The link chain is built once at construction, so
  // switching modes means rebuilding it — there is no runtime toggle.
  const [client, setClient] = useState(() => createClient("off"));

  function switchMode(next) {
    if (next === "localStorage") {
      window.localStorage.setItem("AMH_mockdata", JSON.stringify(MOCK_DATA));
    }
    setMode(next);
    setSelected(null);
    setClient(createClient(next));
  }

  const active = MODES.find((m) => m.id === mode);

  return (
    <ApolloProvider client={client}>
      <main>
        <h1>apollo-mock-http</h1>
        <p className="muted">
          Querying <code>{ENDPOINT}</code>
        </p>

        <div className="modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={m.id === mode ? "mode mode-on" : "mode"}
              onClick={() => switchMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="hint">{active.hint}</p>

        <section>
          <h2>Continents <span className="tag">mockable</span></h2>
          <Continents selected={selected} onSelect={setSelected} />
        </section>

        <section>
          <h2>Countries <span className="tag tag-live">always live</span></h2>
          <Countries code={selected} />
        </section>
      </main>
    </ApolloProvider>
  );
}
