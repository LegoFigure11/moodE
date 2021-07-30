import type {Message} from "discord.js";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import {Aliases} from "./dex-aliases";

// Maximum number of substitutions allowed in the fuzzy searching
// Lower numbers mean stricter searching
// [4, 3, 2] is recommended for looser searching
const MAX_SUBS = [3, 2, 1];

const gens = new Generations(dex.Dex);
const Dex = gens.get(8);
const Gen7Dex = gens.get(7);

export class TypoChecker {
  message: Message;
  arg: string;
  list: string[] = this.generateList();

  constructor(message: Message, args: string[]) {
    this.message = message;
    this.arg = args[0];
  }

  getClosestMatch(): string {
    return this.getSimilarResults()[0];
  }

  // This function uses the levenshtein function and creates an array of all items that are
  // similar to the input
  getSimilarResults(): string[] {
    const results: any[] = [];
    // The more substitutions, the more results are allowed.
    let maxSubs = MAX_SUBS[0];
    // Shorter names should have less subs as it's easier to match them
    if (this.arg.length < 6) {
      maxSubs = MAX_SUBS[1];
    } else if (this.arg.length < 4) {
      maxSubs = MAX_SUBS[2];
    }

    // TODO: Abstract lists
    for (const mon of this.list) {
      const lVal = this.getLevenshteinValue(Utilities.toId(this.arg), mon);
      if (lVal <= maxSubs) {
        results.push([mon, lVal]);
      }
    }
    // Sort the results in order of closest match
    results.sort((a, b) => a[1] - b[1]);
    const ret: string[] = [];
    for (const result of results) {
      ret.push(result[0]);
    }
    return ret;
  }

  // Shamelessly taken from smogon/pokemon-showdown
  // https://git.io/JB2SR
  getLevenshteinValue(s: string, t: string): number {
    // Original levenshtein distance function by James Westgate, turned out to be the fastest
    const d: number[][] = [];

    // Step 1
    const n = s.length;
    const m = t.length;

    if (n === 0) return m;
    if (m === 0) return n;

    // Create an array of arrays in javascript (a descending loop is quicker)
    for (let i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (let i = n; i >= 0; i--) d[i][0] = i;
    for (let j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (let i = 1; i <= n; i++) {
      const si = s.charAt(i - 1);

      // Step 4
      for (let j = 1; j <= m; j++) {
        // Check the jagged ld total so far
        if (i === j && d[i][j] > 4) return n;

        const tj = t.charAt(j - 1);
        const cost = (si === tj) ? 0 : 1; // Step 5

        // Calculate the minimum
        let mi = d[i - 1][j] + 1;
        const b = d[i][j - 1] + 1;
        const c = d[i - 1][j - 1] + cost;

        if (b < mi) mi = b;
        if (c < mi) mi = c;

        d[i][j] = mi; // Step 6
      }
    }
    return d[n][m];
  }

  generateList(): string[] {
    const pokemon: Set<string> = new Set();
    for (const mon of Dex.species) {
      pokemon.add(mon.id);
    }
    for (const mon of Gen7Dex.species) {
      pokemon.add(mon.id);
    }
    return [...pokemon, ...Object.keys(Aliases)].sort();
  }
}
