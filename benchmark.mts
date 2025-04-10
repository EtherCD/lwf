import { Value } from "./src/internal/vars"
import { createWriteCtx } from "./test/utils"
import { Bench } from "tinybench"
import lwf from "./src"

const ctx = createWriteCtx({}, {})
const table: Record<string, { name: string; value: any; ops: number }> = {}

const intVal = -Math.floor(Number.MAX_SAFE_INTEGER / 2) + 1
const uintVal = Math.floor(Number.MAX_SAFE_INTEGER) - 1
const int128Val = BigInt(2 ** 128) - 1n
const floatFeVal = 56294995.3421312
const doubleVal = 5629499.5342131210001
const stringVal =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sodales dolor quis nisi tincidunt, id gravida neque ornare. Donec sodales tempus metus, et iaculis libero interdum eu. Suspendisse ac neque quis lectus porttitor gravida sit amet blandit neque. Nunc iaculis mollis ex, nec gravida nunc imperdiet et. Praesent non pretium. "

const object = Array.from({ length: 200 ** 2 }, () => ({
    int: intVal,
    uint: uintVal,
    floatFe: floatFeVal,
    double: doubleVal,
    string: stringVal
}))

const objectSchema = new lwf.Schema({
    a: {
        isArray: true,
        fields: ["int", "uint", "floatFe", "double", "string"]
    }
})

function makeTest(name: string, value: any, fn: () => void) {
    const bench = new Bench({ time: 500 })
    bench.add(name, fn)
    return bench.run().then(() => {
        const result = bench.tasks[0]
        table[name] = {
            name,
            value,
            ops: Math.round(result.result?.hz ?? 0)
        }
    })
}

async function run() {
    await makeTest("E Int", intVal, () => {
        Value.encode.call(ctx, intVal)
        ctx.offset = 0
    })
    await makeTest("D Int", intVal, () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    await makeTest("E Uint", uintVal, () => {
        Value.encode.call(ctx, uintVal)
        ctx.offset = 0
    })
    await makeTest("D Uint", uintVal, () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    await makeTest("E Int128", int128Val, () => {
        Value.encode.call(ctx, int128Val)
        ctx.offset = 0
    })
    await makeTest("D Int128", int128Val, () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    await makeTest("E Bool", true, () => {
        Value.encode.call(ctx, true)
        ctx.offset = 0
    })
    await makeTest("D Bool", true, () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    await makeTest("E FloatFE", floatFeVal, () => {
        Value.encode.call(ctx, floatFeVal)
        ctx.offset = 0
    })
    await makeTest("D FloatFE", floatFeVal, () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    await makeTest("E Double", doubleVal, () => {
        Value.encode.call(ctx, doubleVal)
        ctx.offset = 0
    })
    await makeTest("D Double", doubleVal, () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    await makeTest("E String", "Lorem 331", () => {
        Value.encode.call(ctx, stringVal)
        ctx.offset = 0
    })
    await makeTest("D String", "Lorem 331", () => {
        Value.decode.call(ctx)
        ctx.offset = 0
    })

    console.table(table)

    const tableTwo: Array<{
        format: string
        process: string
        millisecond: number
    }> = []

    let i = Date.now()
    const json = JSON.stringify(object)
    i = Date.now() - i
    tableTwo.push({
        format: "JSON",
        process: "stringify",
        millisecond: i
    })

    i = Date.now()
    JSON.parse(json)
    i = Date.now() - i
    tableTwo.push({
        format: "JSON",
        process: "parse",
        millisecond: i
    })

    i = Date.now()
    const buffer = lwf.encode(object, objectSchema)
    i = Date.now() - i
    tableTwo.push({
        format: "LWF",
        process: "encode",
        millisecond: i
    })

    i = Date.now()
    lwf.decode(buffer, objectSchema)
    i = Date.now() - i
    tableTwo.push({
        format: "LWF",
        process: "decode",
        millisecond: i
    })

    console.table(tableTwo)
}

run()
