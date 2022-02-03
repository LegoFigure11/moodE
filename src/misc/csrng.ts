import {randomBytes} from "crypto";

// Adapted from https://github.com/joepie91/node-random-number-csprng/blob/master/src/index.js
// Licensed under WTFPL

export class CSRNG {
  private calculateParameters(range: number): {bytesNeeded: number; mask: number} {
    let bitsNeeded = 0;
    let bytesNeeded = 0;
    let mask = 1;

    while (range > 0) {
      if (bitsNeeded % 8 === 0) {
        bytesNeeded += 1;
      }

      bitsNeeded += 1;
      mask = mask << 1 | 1; /* 0x00001111 -> 0x00011111 */
      range = range >>> 1; /* 0x01000000 -> 0x00100000 */
    }

    return {bytesNeeded, mask};
  }

  random(max: number): number {
    const {bytesNeeded, mask} = this.calculateParameters(max);
    const b = randomBytes(bytesNeeded);
    let val = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      val |= (b[i] << (8 * i));
    }
    val = val & mask;
    if (val < max) {
      return val;
    } else {
      return this.random(max);
    }
  }

  randomRange(min: number, max: number): number {
    const diff = max - min;
    return (this.random(diff) + min);
  }
}

export const instantiate = (): void => {
  global.CSRNG = new CSRNG();
};
