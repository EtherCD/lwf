export class LexerError extends Error {
	pos: number;
	constructor(message: string, pos: number) {
		super(message);
		this.pos = pos;
	}
}

export class ParsingError extends Error {
	index: string;
	constructor(message: string, index: string) {
		super(message);
		this.index = index;
	}
}
