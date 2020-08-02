"use strict";

const converter = require("hex2dec");

const natures = [
	"Hardy", "Lonely", "Brave", "Adamant", "Naughty",
	"Bold", "Docile", "Relaxed", "Impish", "Lax",
	"Timid", "Hasty", "Serious", "Jolly", "Naive",
	"Modest", "Mild", "Quiet", "Bashful", "Rash",
	"Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

class LCRNG {
	constructor(seed, add, mult) {
		this.seed = seed;
		this.add = add;
		this.mult = mult;
		this.natures = natures;
		this.right = 0;
		this.val = 0;
		this.flags = [];
		this.low8 = [];
		for (let i = 0; i < 256; i++) {
			this.right = converter.decToHex(`${this.unsign(0x41c64e6d * i + 0x6073)}`);
			this.val = this.right >>> 16;
			this.flags[this.val] = true;
			this.low8[this.val] = i;
			this.val--;
			this.flags[this.val] = true;
			this.low8[this.val] = i;
		}
	}

	getNext32BitNumber(seed = this.seed, times = 1) {
		for (let i = 0; i < times; i++) {
			seed = this.unsign(Math.imul(seed, this.mult));
			seed = this.unsign(seed + this.add);
			seed = this.unsign(seed & 0xFFFFFFFF);
			this.seed = seed;
		}
		return converter.decToHex(`${seed}`);
	}

	getNext16BitNumber(seed = this.seed) {
		return converter.decToHex(`${this.getNext32BitNumber(seed) >>> 16}`);
	}

	calcMethod124SeedIVs(pid) {
		const ret = [];
		const pidl = this.unsign((pid & 0xFFFF) << 16);
		const pidh = pid & 0xFFFF0000;

		let k1 = this.unsign(pidh - pidl * 0x41c64e6d);
		for (let cnt = 0; cnt < 256; ++cnt, k1 = this.unsign(k1 - 0xc64e6d00)) {
			const test = k1 >>> 16;
			if (this.flags[test]) {
				const fullFirst = this.unsign(pidl | (cnt << 8) | this.low8[test]);
			  const fullSecond = this.getNext32BitNumber(fullFirst);
			  if ((fullSecond & 0xFFFF0000) === pidh) {
					ret.push([`${converter.decToHex(`${this.reverse(fullFirst)}`)}`, `${this.getNext32BitNumber(fullSecond)}`]);
				}
		  }
		}
		return ret;
	}

	calcMethodXDSeedIVs(pid) {
		const ret = [];
		const first = pid & 0xFFFF0000;
		const second = (pid & 0xFFFF) << 16;
		let fullFirst;

		let t = ((second - 0x343fd * first) - 0x259ec4) & 0xFFFFFFFF;
		const kmax = (0x343fabc02 - t) / 0x100000000;

		for (let k = 0; k <= kmax; k++, t += 0x100000000) {
			if ((t % 0x343fd) < 0x10000) {
				fullFirst = this.unsign(first | (t / 0x343fd));
				const iv2 = this.reverseXD(this.reverseXD(fullFirst));
				const iv1 = this.reverseXD(iv2);
				ret.push([`${converter.decToHex(`${this.reverseXD(iv1)}`)}`, iv1, iv2, 0]);
			}
		}
		return ret;
	}

	reverse(seed) {
		seed = this.unsign(Math.imul(seed, 0xeeb9eb65));
		seed = this.unsign(seed + 0xa3561a1);
		seed = this.unsign(seed & 0xFFFFFFFF);
		return seed;
	}

	reverseXD(seed) {
		seed = this.unsign(Math.imul(seed, 0xB9B33155));
		seed = this.unsign(seed + 0xA170F641);
		seed = this.unsign(seed & 0xFFFFFFFF);
		return seed;
	}

	concat16(args) {
		let ret = "0x";
		for (let i = 0; i < args.length; i++) {
			ret += args[i].replace("0x", "").padStart(4, "0");
		}
		return ret;
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
