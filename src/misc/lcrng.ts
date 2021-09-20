export class LCRNG {
  protected seed = 0;
  protected add = 0;
  protected mult = 0;
  protected hi = 0;
  protected lo = 0;

  constructor(seed = 0) {
    this.seed = seed;
    this.hi = this.high();
    this.lo = this.low();
  }

  /**
  * Gets the value of the current LCRNG state
  * @returns unsigned 32-bit integer
  */
  getseed(): number {
    return this.seed;
  }

  /**
  * Sets the current value of the LCRNG
  * @param seed the value to set the LCRNG to
  */
  reseed(seed: number): void {
    this.seed = seed;
    this.hi = this.high();
    this.lo = this.low();
  }

  /**
  * Converts an integer to a uint32
  * @param int the number to convert
  * @returns the number as uint32
  */
  unsign(int: number): number {
    return (int >>> 1) * 2 + (int & 1);
  }

  /**
  * Gets the highest 16 bits of a 32-bit integer
  * @param int
  * @returns the high 16-bits of int
  */
  high(int = this.seed): number {
    return this.unsign(int & 0xFFFF0000);
  }

  /**
  * Gets the lowest 16 bits of a 32-bit integer
  * @param int
  * @returns the low 16-bits of int
  */
  low(int = this.seed): number {
    return this.unsign(int & 0xFFFF);
  }

  /**
  * Gets the value of the next 32-bit LCRNG state
  * @returns 32-bit RNG state
  */
  next(): number {
    let seed = this.unsign(Math.imul(this.seed, this.mult));
    seed = this.unsign(seed + this.add);
    seed = this.unsign(seed & 0xFFFFFFFF);
    this.seed = seed;
    this.hi = this.high();
    this.lo = this.low();
    return seed;
  }

  /**
  * Advances the LCRNG
  * @param states the number of states to advance
  * @returns the 32-bit RNG state after the advancements
  */
  advance(states = 1): number {
    for (let i = 0; i < states; i++) {
      this.next();
    }
    return this.seed;
  }

  /**
  * Gets the highest 16 bits of the next 32-bit RNG state
  */
  next16bit(): number {
    return this.next() >>> 16;
  }

  PokeRNG(): void {
    this.add = 0x6073;
    this.mult = 0x41C64E6D;
  }

  PokeRNGR(): void {
    this.add = 0xa3561a1;
    this.mult = 0xeeb9eb65;
  }

  XDRNG(): void {
    this.add = 0x269EC3;
    this.mult = 0x343FD;
  }

  XDRNGR(): void {
    this.add = 0xA170F641;
    this.mult = 0xB9B33155;
  }

  ARNG(): void {
    this.add = 0x1;
    this.mult = 0x6c078965;
  }

  ARNGR(): void {
    this.add = 0x69c77f93;
    this.mult = 0x9638806d;
  }

  onReload(previous: Partial<LCRNG>): void {
    for (const i in previous) {
      // @ts-expect-error
      delete previous[i];
    }
  }
}

export class PokeRNG extends LCRNG {
  constructor() {
    super();
    this.add = 0x6073;
    this.mult = 0x41C64E6D;
  }
}

export class PokeRNGR extends LCRNG {
  constructor() {
    super();
    this.add = 0xa3561a1;
    this.mult = 0xeeb9eb65;
  }
}

export class XDRNG extends LCRNG {
  constructor() {
    super();
    this.add = 0x269EC3;
    this.mult = 0x343FD;
  }
}

export class XDRNGR extends LCRNG {
  constructor() {
    super();
    this.add = 0xA170F641;
    this.mult = 0xB9B33155;
  }
}

export class ARNG extends LCRNG {
  constructor() {
    super();
    this.add = 0x1;
    this.mult = 0x6c078965;
  }
}

export class ARNGR extends LCRNG {
  constructor() {
    super();
    this.add = 0x69c77f93;
    this.mult = 0x9638806d;
  }
}

export const instantiate = (): void => {
  const oldLCRNG = global.LCRNG as LCRNG | undefined;

  global.LCRNG = new LCRNG();

  if (oldLCRNG) {
    global.LCRNG.onReload(oldLCRNG);
  }
};
