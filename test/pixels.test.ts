import lwf from "../src"

test("Test sizes of serialized data", () => {
    const table = [{ LWFB: 0, JSON: 0, LWFBP: 0, JSONP: 0 }]

    var time1 = Date.now()
    const binaryData = lwf.encode(object, schema)
    table[0]["LWFB"] = Date.now() - time1
    time1 = Date.now()
    const jsonData = JSON.stringify(object)
    table[0]["JSON"] = Date.now() - time1

    time1 = Date.now()
    lwf.decode(binaryData, schema)
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
        fields: ["x", "y", "color"],
        isArray: true
    }
})

const count = 200

const object: Array<{
    x: number
    y: number
    color: string
}> = []

for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
        object.push({
            x,
            y,
            color: "#ffffff"
        })
    }
}
