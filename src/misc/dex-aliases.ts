import type {typoCheckerListType} from "../types/typo-checker";
import {TypoChecker} from "./typo-checker";

export const Aliases: KeyedDict<string, string> = {
  // Cool people
  "anubis": "corviknight",
  "archie": "jirachi",
  "bluecake": "scorbunny",
  "juanjo": "falinks",
  "lego": "eldegoss",
  "mica": "shaymin",
  "onion": "eldegoss",
  "psychicj": "gardevoir",
  "saiph": "gengar",
  "taylor": "nidoking",
  "thexreturns": "garchomp",
  "tora": "luxray",
  "xen": "qwilfish",
  "x": "gible",

  // Memes
  "boob": "rowlet",
  "god": "bidoof",

  // Dex Numbers
  "360": "wynaut",

  // Foreign Names
  "boober": "magmar",

  // Other
  "gibbu": "gible",
};

export function getAlias(args?: string, lists: Partial<typoCheckerListType>[] = ["all"]):
[id: string, gmax: boolean, emax: boolean] {
  let arg = Utilities.toId(args);
  const gmax = arg.includes("-gmax") || arg.includes("-gigantamax");
  const emax = arg.includes("-emax") || arg.includes("-eternamax");
  arg = arg.replace(/-gmax|-gigantamax|-emax|-eternamax/, "");
  const old = arg;
  arg = new TypoChecker().getClosestMatch(arg, ...lists);
  console.log(arg);
  if (Aliases[arg]) return [Aliases[arg], gmax, emax];
  return [arg || old, gmax, emax];
}
