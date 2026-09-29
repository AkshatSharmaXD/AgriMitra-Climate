import type { Config } from "tailwindcss";

/** Every colour resolves to a CSS variable, so light/dark/increased-contrast
 *  are handled in one place (src/styles/globals.css) rather than per component. */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
          inverted: "var(--surface-inverted)",
        },
        content: {
          DEFAULT: "var(--content)",
          secondary: "var(--content-secondary)",
          tertiary: "var(--content-tertiary)",
          inverted: "var(--content-inverted)",
        },
        hairline: "var(--hairline)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          content: "var(--accent-content)",
        },
        risk: {
          low: "var(--risk-low)",
          "low-fill": "var(--risk-low-fill)",
          "low-wash": "var(--risk-low-wash)",
          medium: "var(--risk-medium)",
          "medium-fill": "var(--risk-medium-fill)",
          "medium-wash": "var(--risk-medium-wash)",
          high: "var(--risk-high)",
          "high-fill": "var(--risk-high-fill)",
          "high-wash": "var(--risk-high-wash)",
          critical: "var(--risk-critical)",
          "critical-fill": "var(--risk-critical-fill)",
          "critical-wash": "var(--risk-critical-wash)",
        },
        ndvi: {
          0: "var(--ndvi-0)",
          1: "var(--ndvi-1)",
          2: "var(--ndvi-2)",
          3: "var(--ndvi-3)",
          4: "var(--ndvi-4)",
        },
        provenance: {
          live: "var(--provenance-live)",
          demo: "var(--provenance-demo)",
          stale: "var(--provenance-stale)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        sheet: "var(--shadow-sheet)",
      },
      transitionTimingFunction: {
        "out-quint": "var(--ease-out-quint)",
        "in-quint": "var(--ease-in-quint)",
      },
      // 44px is the minimum comfortable touch target (`accessibility.md`).
      minHeight: { tap: "44px" },
      minWidth: { tap: "44px" },
    },
  },
  plugins: [],
};

export default config;
