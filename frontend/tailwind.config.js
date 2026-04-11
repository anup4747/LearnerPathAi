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
    },
  },
  plugins: [],
};
