import { ReadContext, WriteContext } from "../src/internal/context"
import { Schema } from "../src/internal/schema"
import { Float, Value } from "../src/internal/vars"
import assert from "assert"
import { createReadCtx, createWriteCtx } from "./utils"

const writeAndRead = (value: unknown): unknown => {
    let ctx: WriteContext | ReadContext = createWriteCtx({ a: {} }, {})
    Value.encode.call(ctx, value)

    ctx = createReadCtx(ctx, { a: {} })
    // console.log(ctx.buffer)
    return Value.decode.call(ctx)
}

test("Encode/Decode Int", () => {
    const int = -Math.floor(Number.MAX_SAFE_INTEGER / 2)
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode Uint", () => {
    const int = Number.MAX_SAFE_INTEGER
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode Int128", () => {
    const int = BigInt(2 ** 128)
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode NInt128", () => {
    const int = BigInt(-(2 ** 128))
    assert.equal(writeAndRead(int), int)
})

test("Decode Float", () => {
    const ctx = createReadCtx(new Uint8Array([3, 66, 240, 10, 193]), { a: {} })
    assert.equal(Value.decode.call(ctx), 120.02100372314453)
})

test("Encode/Decode Double", () => {
    const int = 120.0000000000021
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode Float Fraction Encoding", () => {
    const int = 56294995.3421312
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode Booleans", () => {
    assert.equal(writeAndRead(true), true)
    assert.equal(writeAndRead(false), false)
})

test("Encode/Decode Strings", () => {
    assert.equal(writeAndRead("Lorem ipsum 😶"), "Lorem ipsum 😶")
})
