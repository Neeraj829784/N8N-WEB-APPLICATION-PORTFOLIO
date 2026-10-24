import { ImageResponse } from "next/og";
import { portfolio } from "@/data/portfolio";

export const alt = `${portfolio.name} — n8n automation specialist`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 72px", background: "#0c0e12", color: "#f5f5f7", fontFamily: "sans-serif", borderLeft: "12px solid #ff9b6a" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #78523f", borderRadius: 14, width: 62, height: 62, fontSize: 24 }}>{portfolio.shortName}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ fontSize: 30 }}>{portfolio.name}</span><span style={{ fontSize: 19, color: "#b0acb8" }}>Independent n8n specialist</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.15, letterSpacing: -4 }}><span>I connect apps.</span><span style={{ color: "#ff9b6a" }}>You get your time back.</span></div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #34343a", paddingTop: 24, fontSize: 21, color: "#c2bdb8" }}><span>Lead routing · Onboarding · Reporting</span><span>n8n automations ↗</span></div>
    </div>,
    size,
  );
}
