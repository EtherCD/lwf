export interface LexerToken {
	type: LexerTokenType;
	value: string | number | null | boolean;
}

export enum LexerTokenType {
	LBRACKET,
	RBRACKET,
	COMMA,
	NOTHING,
	NUMBER,
	STRING,
	BOOLEAN,
	MINUS,
}

export interface ParsedBlock {
	index: string;
	args: Array<ParsedArgs>;
}

export interface ParsedArgs {
	type: string | number;
	value: string | number | null | boolean;
}

export type LWFSchema = {
	[key: string]: {
		key: string;
		in?: string;
		array?: boolean;
		args: Array<string>;
		includes?: Array<string>;
	};
};

export type LWFBlock = {
	key: string;
	in?: string;
	array?: boolean;
	args: Array<string>;
	includes?: Array<string>;
};
