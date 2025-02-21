import { LexerTokenType, LWFBlock, LWFSchema, ParsedArgs } from "./types";

export const auto = (elements: Array<ParsedArgs>, list: Array<string | null>) => {
	let out: Record<string, any> = {};
	for (let i = 0; i < elements.length; i++) {
		const e = elements[i];
		if (list[i] === null) continue;
		if (e.type != LexerTokenType.NOTHING) out[list[i]!] = elements[i].value;
	}
	return out;
};

export const toLazyFormat = (input: Record<string, any>, schema: LWFBlock) => {
	const keys = Object.keys(input);
	const elements: Array<any> = schema.args.map((key) => (keys.indexOf(key) !== -1 ? input[key] : null));

	let output = "[";
	for (const i in elements) {
		output += elements[i] === null ? ",," : elements[i] + ",";
	}
	output += "]";
	output = output.replace(/,+\]/g, "]");

	return output;
};
