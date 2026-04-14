/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "vscode-bg": "#080b12",
        "vscode-sidebar": "#0d1320",
        "vscode-panel": "#0f172a",
        "vscode-border": "#17233a",
        "vscode-accent": "#7c3aed",
        "vscode-text": "#e2e8f0",
        "vscode-muted": "#94a3b8",
        "vscode-success": "#34d399",
        "vscode-warning": "#fbbf24",
        "vscode-error": "#f87171",
      },
      keyframes: {
        float1: {
          "0%": { transform: "translate(0,0) scale(1)", opacity: "0.15" },
          "100%": { transform: "translate(50px,-30px) scale(1.1)", opacity: "0.3" },
        },
        float2: {
          "0%": { transform: "translate(0,0) scale(1)", opacity: "0.1" },
          "100%": { transform: "translate(-40px,40px) scale(1.15)", opacity: "0.25" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 15px rgba(124,58,237,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(124,58,237,0.6)" },
        },
        "bounce-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
      },
      animation: {
        float1: "float1 8s ease-in-out infinite alternate",
        float2: "float2 10s ease-in-out infinite alternate",
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
