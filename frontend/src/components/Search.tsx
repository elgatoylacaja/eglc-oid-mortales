import { useMemo, useState } from "react";
import { Node } from "../types";

type Props = {
  nodes: Node[];
  handleSearchSelect: (name: string) => void;
}

export default function Search({ nodes, handleSearchSelect }: Props) {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return nodes.filter(n => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, nodes]);

  return <div className="absolute top-4 left-4 w-56">
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyDown={e => e.key === 'Escape' && setQuery('')}
      placeholder="Search artist…"
      className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
    />
    {searchResults.length > 0 && (
      <ul className="mt-1 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden shadow-xl">
        {searchResults.map(n => (
          <li key={n.name}>
            <button
              className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 flex items-center gap-2"
              onClick={() => {
                handleSearchSelect(n.name)
                setQuery('')
              }}
            >
              <img src={n.image} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
              <span className="truncate">{n.name}</span>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
}