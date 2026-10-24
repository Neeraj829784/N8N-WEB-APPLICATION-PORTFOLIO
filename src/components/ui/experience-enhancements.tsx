"use client";
import { useEffect } from "react";

export function ExperienceEnhancements() {
  useEffect(() => {
    const cards = [...document.querySelectorAll(".project-card,.service-card,.toolkit-card,.process-grid > li")];
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const reveals = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        reveals.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    const atlas = document.querySelector(".connection-atlas");
    const ambient = new IntersectionObserver(entries => {
      for (const entry of entries) entry.target.classList.toggle("motion-visible", entry.isIntersecting);
    });
    if (atlas) ambient.observe(atlas);

    function prepareReveals() {
      for (const element of cards) {
        element.classList.remove("reveal-item", "in-view");
        reveals.unobserve(element);
        if (!media.matches) {
          element.classList.add("reveal-item");
          reveals.observe(element);
        }
      }
    }
    function visibility() {
      document.documentElement.classList.toggle("tab-hidden", document.hidden);
    }
    prepareReveals(); visibility();
    media.addEventListener("change", prepareReveals);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reveals.disconnect(); ambient.disconnect();
      media.removeEventListener("change", prepareReveals);
      document.removeEventListener("visibilitychange", visibility);
      for (const element of cards) element.classList.remove("reveal-item", "in-view");
      atlas?.classList.remove("motion-visible");
      document.documentElement.classList.remove("tab-hidden");
    };
  }, []);
  return null;
}

