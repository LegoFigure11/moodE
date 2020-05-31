"use strict";

const converter = require("hex2dec");

class LCRNG {
	constructor(seed, add, mult) {
		this.seed = seed;
		this.add = add;
		this.mult = mult;
	}

	getNext32BitNumber(seed = this.seed, times = 1) {
		for (let i = 0; i < times; i++) {
			seed = this.unsign(Math.imul(seed, this.mult));
			seed = this.unsign(seed + this.add);
			seed = this.unsign(seed & 0xFFFFFFFF);
			this.seed = seed;
		}
		return converter.decToHex(seed + "");
	}

	getNext16BitNumber(seed = this.seed) {
		return converter.decToHex((this.getNext32BitNumber(seed) >>> 16) + "");
	}

	// From X-Act IVs to PID applet
	unsign(int) {
		return (int >>> 1) * 2 + (int & 1);
	}
}

// https://github.com/Admiral-Fish/RNGReporter/blob/master/RNGReporter/Objects/LCRNG.cs#L80

class PokeRNG extends LCRNG {
	constructor(add, mult) {
		super(add, mult);
		this.add = 0x6073;
		this.mult = 0x41C64E6D;
	}
}

class PokeRNGR extends LCRNG {
	constructor(add, mult) {
		super(add, mult);
		this.add = 0xa3561a1;
		this.mult = 0xeeb9eb65;
	}
}

class XDRNG extends LCRNG {
	constructor(add, mult) {
		super(add, mult);
		this.add = 0x269EC3;
		this.mult = 0x343FD;
	}
}

class XDRNGR extends LCRNG {
	constructor(add, mult) {
		super(add, mult);
		this.add = 0xA170F641;
		this.mult = 0xB9B33155;
	}
}

class ARNG extends LCRNG {
	constructor(add, mult) {
		super(add, mult);
		this.add = 0x01;
		this.mult = 0x6c078965;
	}
}

class ARNGR extends LCRNG {
	constructor(add, mult) {
		super(add, mult);
		this.add = 0x69c77f93;
		this.mult = 0x9638806d;
	}
}

module.exports.LCRNG = LCRNG;
module.exports.PokeRNG = PokeRNG;
module.exports.PokeRNGR = PokeRNGR;
module.exports.XDRNG = XDRNG;
module.exports.XDRNGR = XDRNGR;
module.exports.ARNG = ARNG;
module.exports.ARNGR = ARNGR;
