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

  getseed(): number {
    return this.seed;
  }

  reseed(seed: number): void {
    this.seed = seed;
    this.hi = this.high();
    this.lo = this.low();
  }

  unsign(int: number): number {
    return (int >>> 1) * 2 + (int & 1);
  }

  high(int = this.seed): number {
    return this.unsign(int & 0xFFFF0000);
  }

  low(int = this.seed): number {
    return this.unsign(int & 0xFFFF);
  }

  next(): number {
    let seed = this.unsign(Math.imul(this.seed, this.mult));
    seed = this.unsign(seed + this.add);
    seed = this.unsign(seed & 0xFFFFFFFF);
    this.seed = seed;
    this.hi = this.high();
    this.lo = this.low();
    return seed;
  }

  advance(states = 1): number {
    for (let i = 0; i < states; i++) {
      this.next();
    }
    return this.seed;
  }

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
