/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "vscode-bg": "#0f0f1a",
        "vscode-sidebar": "#1e1e2e",
        "vscode-panel": "#252540",
        "vscode-border": "#3e3e5e",
        "vscode-accent": "#7c3aed",
        "vscode-text": "#d4d4d4",
        "vscode-muted": "#858585",
        "vscode-success": "#4ec9b0",
        "vscode-warning": "#dcdcaa",
        "vscode-error": "#f44747",
      },
    },
  },
  plugins: [],
};
