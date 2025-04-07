import lwf from "../src"

test("Test sizes of serialized data", () => {
    const table = [{ LWFB: 0, JSON: 0, LWFBP: 0, JSONP: 0 }]

    var time1 = Date.now()
    const binaryData = lwf.serialize(object, schema)
    table[0]["LWFB"] = Date.now() - time1
    time1 = Date.now()
    const jsonData = JSON.stringify(object)
    table[0]["JSON"] = Date.now() - time1

    time1 = Date.now()
    lwf.deserialize(binaryData, schema)
    table[0]["LWFBP"] = Date.now() - time1
    time1 = Date.now()
    JSON.parse(jsonData)
    table[0]["JSONP"] = Date.now() - time1

    console.table(table)

    console.log("Size in json: " + Math.round(jsonData.length / 10.24) / 100)
    console.log("Size in lwfb: " + Math.round(binaryData.length / 10.24) / 100)
})

const schema = new lwf.Schema({
    a: {
        fields: ["a", "b"],
        isArray: true,
        nested: ["b"]
    },
    b: {
        key: "c",
        fields: ["str", "large"]
    }
})

const count = 200 ** 2

const object: Array<{
    a: number
    c: { str: string; large: string }
}> = []

for (let x = 0; x < count; x++) {
    object.push({
        a: Math.pow(2, 53) - 1,
        c: {
            str: "TEST123",
            large: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sodales dolor quis nisi tincidunt, id gravida neque ornare. Donec sodales tempus metus, et iaculis libero interdum eu. Suspendisse ac neque quis lectus porttitor gravida sit amet blandit neque. Nunc iaculis mollis ex, nec gravida nunc imperdiet et. Praesent non pretium. "
        }
    })
}
