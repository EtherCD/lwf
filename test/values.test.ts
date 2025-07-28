import { ReadContext, WriteContext } from "../src/internal/context"
import { Schema } from "../src/internal/schema"
import { Float, Value } from "../src/internal/vars"
import assert from "assert"

const writeContext = () => {
    return new WriteContext(new Schema({ a: {} }), {})
}

const readContext = (context: WriteContext | Buffer) => {
    return new ReadContext(
        context instanceof WriteContext ? context.buffer : context,
        new Schema({ a: {} })
    )
}

const writeAndRead = (value: unknown): unknown => {
    let ctx: WriteContext | ReadContext = writeContext()
    Value.encode.call(ctx, value)

    ctx = readContext(ctx)
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
    const int = BigInt(128 ** 2)
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode NInt128", () => {
    const int = BigInt(-(128 ** 2))
    assert.equal(writeAndRead(int), int)
})

test("Decode Float", () => {
    const ctx = readContext(Buffer.from([3, 66, 240, 10, 193]))
    assert.equal(Value.decode.call(ctx), 120.02100372314453)
})

test("Encode/Decode Double", () => {
    const int = 120.0000000000021
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode Float Fraction Encoding", () => {
    const int = 12321.23233
    assert.equal(writeAndRead(int), int)
})

test("Encode/Decode Booleans", () => {
    assert.equal(writeAndRead(true), true)
    assert.equal(writeAndRead(false), false)
})
