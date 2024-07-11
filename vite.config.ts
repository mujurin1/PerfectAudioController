import { crx, defineManifest } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://crxjs.dev/vite-plugin/concepts/manifest
const manifest = defineManifest({
  manifest_version: 3,
  name: "Perfect Audio Controller",
  version: "1.0.0",
  permissions: ["tabs", "tabCapture", "scripting", "offscreen", "windows", "activeTab", "commands"],
  action: {
    default_popup: "popup.html",
  },
  commands: {
    "Volume Up": {
      "suggested_key": {
        "default": "Alt+Up",
      },
      "description": "Volume Up",
    },
    "Volume Down": {
      "suggested_key": {
        "default": "Alt+Down",
      },
      "description": "Volume Down",
    },
  },
  background: {
    service_worker: "src/background/background.ts",
  },
  // host_permissions: [
  //   "<all_urls>"
  // ],
  // content_scripts: [
  //   {
  //     // matches: ["<all_urls>"],
  //     matches: ["https://www.youtube.com/watch?v=UYIEE_DDBuk"],
  //     js: ["src/content.ts"]
  //   },
  // ],
});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "popup.html"),
        offscreen: resolve(__dirname, "offscreen.html"),
      }
    }
  },

  plugins: [
    svelte(),
    crx({ manifest }),
  ],

  // 拡張機能でホットリロードを使うにはポートの指定が必要
  server: {
    // hmr: { port: 5174 }, 
    port: 5173
  }
});
