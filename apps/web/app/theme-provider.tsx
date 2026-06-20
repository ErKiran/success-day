"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("success-day-theme");
    const nextTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function chooseTheme(value: Theme) {
    setTheme(value);
    document.documentElement.dataset.theme = value;
    window.localStorage.setItem("success-day-theme", value);
  }

  return (
    <>
      <div className="theme-toggle" aria-label="Color theme">
        <button aria-pressed={theme === "light"} type="button" onClick={() => chooseTheme("light")}>
          Light
        </button>
        <button aria-pressed={theme === "dark"} type="button" onClick={() => chooseTheme("dark")}>
          Dark
        </button>
      </div>
      {children}
    </>
  );
}
