import { portfolio } from "@/data/portfolio";

/** Personal identity; deliberately distinct from the n8n product symbol. */
export function BrandMark({ className = "" }: { className?: string }) {
  return <span className={"brand-mark " + className} aria-hidden="true"><span className="personal-initials">{portfolio.shortName}</span></span>;
}
