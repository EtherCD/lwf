import { defineConfig } from "tsup"

export default defineConfig([
    {
        entry: {
            index: "src/index.ts"
        },
        format: ["esm", "cjs"],
        dts: true,
        sourcemap: true,
        minify: true,
        splitting: false,
        clean: true
    },
    {
        entry: {
            index: "src/index.ts"
        },
        format: ["iife"],
        minify: true,
        sourcemap: true,
        globalName: "lwf",
        dts: false,
        clean: true,
        target: "es2018",
        splitting: false
    }
])
