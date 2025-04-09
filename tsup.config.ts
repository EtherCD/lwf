import { defineConfig } from "tsup"

export default defineConfig([
    {
        entry: ["src/index.ts"],
        format: ["esm", "cjs"],
        dts: true,
        sourcemap: true,
        clean: true,
        minify: true
    },
    {
        entry: ["src/index.ts"],
        format: ["iife"],
        minify: true,
        sourcemap: true,
        globalName: "lwf",
        dts: false,
        clean: true,
        target: "es2018"
    }
])
