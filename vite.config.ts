import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { yandexMetrikaHead } from "./src/analytics/yandexMetrika";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/aoswarscrollcreator/",
  plugins: [
    react(),
    {
      name: "inject-yandex-metrika",
      transformIndexHtml(html) {
        return html.replace("</head>", `${yandexMetrikaHead}</head>`);
      },
    },
  ],
});
