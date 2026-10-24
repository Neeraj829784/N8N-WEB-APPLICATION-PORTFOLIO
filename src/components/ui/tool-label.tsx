import Image from "next/image";

/** Official connected-circle symbol selected by the user; unmodified artwork. */
export function ToolLabel({ name }: { name: string }) {
  if (name !== "n8n") return <>{name}</>;
  return <span className="official-tool-label"><Image src="/brand/n8n-connected-nodes.svg" alt="n8n" width={46} height={24} unoptimized /></span>;
}
