import { ParsingError } from "./errors";
import LWFLexer from "./lexer";
import { LWFParser } from "./parse";
import { auto, toLazyFormat } from "./schema";
import { LWFBlock, LWFSchema, ParsedBlock } from "./types";

export class LWF {
	private static parseSchema: LWFSchema;
	private static index: number = 0;
	private static blocks: ParsedBlock[] = [];
	private static stringifySchema: LWFSchema;

	static parse(input: string, schema: LWFSchema) {
		const lexer = new LWFLexer(input);
		const parser = new LWFParser(lexer.tokenize());
		this.blocks = parser.parse();
		this.parseSchema = schema;
		this.index = 0;

		let result: Record<string, any> = {};

		while (this.index < this.blocks.length) {
			this.parseBlock(this.blocks[this.index], result);
		}

		return result;
	}

	private static parseBlock(block: ParsedBlock, result: Record<string, any>) {
		const scheme = this.parseSchema[block.index];

		if (!scheme) {
			throw new ParsingError("Index of data block is not exists in scheme: " + block.index, block.index);
		}

		let included = scheme.args.length === 0 ? block.args.map((e) => e.value) : auto(block.args, scheme.args);

		if (scheme.in) included = { [scheme.in]: included };

		this.index++;

		while (this.index < this.blocks.length) {
			const nextBlock = this.blocks[this.index];

			if (scheme.includes?.includes(nextBlock.index)) {
				this.parseBlock(nextBlock, included);
			} else {
				break;
			}
		}

		if (!scheme.array) {
			result[scheme.key] = included;
		} else {
			if (!Array.isArray(result[scheme.key])) {
				result[scheme.key] = [];
			}
			if (Array.isArray(included)) included.map((e) => result[scheme.key].push(e));
			else result[scheme.key].push(included);
		}
	}

	private static translateSchema(schema: LWFSchema): LWFSchema {
		let out: LWFSchema = {};

		for (const s in schema) {
			const scheme = schema[s];
			out[scheme.key] = { ...scheme, key: s };
		}

		return out;
	}

	static stringify(input: Record<string, any>, schema: LWFSchema): string {
		const result: string[] = [];

		this.stringifySchema = this.translateSchema(schema);

		Object.keys(input).forEach((key) => {
			const block = this.stringifySchema[key];

			if (!block) {
				throw new Error(`Unknown schema key: ${key}`);
			}

			this.stringifyBlock(input[key], block, result);
		});

		return result.join("");
	}

	private static stringifyBlock(data: Record<string, any> | Array<Record<string, any>>, scheme: LWFBlock, result: string[]) {
		if (scheme.array && Array.isArray(data)) {
			if (scheme.args.length !== 0) data.forEach((item) => this.stringifyBlock(item, scheme, result));
			else result.push(scheme.key + `[${data.join(",")}]`);
		} else {
			data = data as Record<string, any>;

			result.push(scheme.key + toLazyFormat(scheme.in ? data[scheme.in] : data, scheme));
			for (const i in data) {
				if (typeof data[i] === "object") {
					if (scheme.in !== i) {
						if (!this.stringifySchema[i]) {
							throw new Error(`Unknown schema key: ${i}`);
						}
						this.stringifyBlock(data[i], this.stringifySchema[i], result);
					}
				}
			}
		}
	}
}

export { LWFSchema, LWFBlock } from "./types";
