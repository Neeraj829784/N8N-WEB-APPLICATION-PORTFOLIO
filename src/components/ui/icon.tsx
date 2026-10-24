import type { CSSProperties } from "react";

const paths: Record<string, string> = {
  arrow: "M7 17 17 7M7 7h10v10",
  nodes: "M7 12h5a4 4 0 0 0 4-4V6M12 12a4 4 0 0 1 4 4v2M7 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  inbox: "M4 4h16v16H4zM4 14h5l2 3h2l2-3h5M8 8h8",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v3",
  chart: "M4 3v17h17M8 15v-4M13 15V7M18 15V4",
  database: "M20 6c0 2-4 3-8 3s-8-1-8-3 4-3 8-3 8 1 8 3ZM4 6v12c0 2 4 3 8 3s8-1 8-3V6M4 12c0 2 4 3 8 3s8-1 8-3",
  settings: "m10 3-1 3-3 1-3 3 2 2-1 4 3 3 3-1 2 3 4-1 1-3 3-1 1-4-3-2-1-4-4-1ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  code: "m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3ZM8 12l3 3 5-6",
  check: "m5 12 4 4L19 6",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM15 15l6 6",
  mail: "M3 5h18v14H3zM3 5l9 8 9-8",
  play: "m9 5 10 7-10 7V5Z",
};
export function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name] ?? paths.nodes} /></svg>;
}

