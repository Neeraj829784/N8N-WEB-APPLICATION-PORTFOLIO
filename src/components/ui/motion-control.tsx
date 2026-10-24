"use client";

import { useEffect, useState } from "react";

export function MotionControl() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? "paused" : "running";
    return () => { delete document.documentElement.dataset.motion; };
  }, [paused]);
  return <button type="button" className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)} aria-label={paused ? "Resume ambient motion" : "Pause ambient motion"}><span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>{paused ? "Resume motion" : "Pause motion"}</button>;
}
