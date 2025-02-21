import { LWFSchema } from "../src/types";
import { LWF } from "../src/index";

const schema: LWFSchema = {
	p: {
		key: "data",
		args: ["name"],
		includes: ["c"],
	},
	c: {
		key: "colors",
		args: ["leaderBoard", "chat", "fill", "stroke"],
	},
	a: {
		key: "areas",
		in: "properties",
		array: true,
		args: ["x", "y", "name", "maxLevel", "deathTimer", "friction"],
		includes: ["z"],
	},
	z: {
		key: "zones",
		array: true,
		args: ["type", "x", "y", "w", "h", "minSpeed", "pelletCount", "pelletMultiplier"],
		includes: ["s", "t"],
	},
	s: {
		key: "spawners",
		array: true,
		args: ["speed", "radius", "amount", "aura", "x", "y"],
		includes: ["e"],
	},
	t: {
		key: "translate",
		args: ["x", "y"],
	},
	e: {
		key: "types",
		array: true,
		args: [],
	},
};

const map = {
	data: {
		name: "Test",
		colors: {
			leaderBoard: "#fff",
		},
	},
	areas: [
		{
			properties: {
				x: 0,
				y: 0,
			},
			zones: [
				{
					type: "some",
					x: 0,
					y: 0,
					w: 0,
					h: 0,
					spawners: [{ speed: 1, amount: 1, radius: 1, types: ["homing", "some"] }],
					translate: { x: 20, y: 20 },
				},
			],
		},
	],
};

const result = "p[Test]c[#fff]a[0,0]z[some,0,0,0,0]s[1,1,1]e[homing,some]t[20,20]";

test("General stringify", () => {
	expect(LWF.stringify(map, schema)).toBe(result);
});

test("General parse", () => {
	expect(LWF.parse(result, schema)).toStrictEqual(map);
});
