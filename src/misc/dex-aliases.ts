import type {typoCheckerListType} from "../types/typo-checker";
import {TypoChecker} from "./typo-checker";

export const Aliases: KeyedDict<string, string> = {
  // Cool people
  "adam": "slakoth",
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
  "rat": "rattata",

  // Dex Numbers
  "360": "wynaut",

  // Foreign Names
  "boober": "magmar",

  // Megas
  "venusaur-m": "venusaur-mega",
  "charizard-x": "charizard-mega-x",
  "charizard-y": "charizard-mega-y",
  "blastoise-m": "blastoise-mega",
  "alakazam-m": "alaazam-mega",
  "gengar-m": "gengar-mega",
  "kangaskhan-m": "kangaskhan-mega",
  "pinsir-m": "pinsir-mega",
  "gyarados-m": "gyarados-mega",
  "aerodactyl-m": "aerodactyl-mega",
  "mewtwo-x": "mewtwo-mega-x",
  "mewtwo-y": "mewtwo-mega-y",
  "ampharos-m": "ampharos-mega",
  "scizor-m": "scizor-mega",
  "heracross-m": "heracross-mega",
  "houndoom-m": "houndoom-mega",
  "tyranitar-m": "tyranitar-mega",
  "blaziken-m": "blaziken-mega",
  "gardevoir-m": "gardevoir-mega",
  "mawile-m": "mawile-mega",
  "aggron-m": "aggron-mega",
  "medicham-m": "medicham-mega",
  "manectric-m": "manectric-mega",
  "banette-m": "banette-mega",
  "latias-m": "latias-mega",
  "latios-m": "latios-mega",
  "garchomp-m": "garchomp-mega",
  "lucario-m": "lucario-mega",
  "beedrill-m": "beedrill-mega",
  "pidgeot-m": "pidgeot-mega",
  "slowbro-m": "slowbro-mega",
  "steelix-m": "steelix-mega",
  "sceptile-m": "sceptile-mega",
  "swampert-m": "swampert-mega",
  "sableye-m": "sableye-mega",
  "sharpedo-m": "sharpedo-mega",
  "camerupt-m": "camerupt-mega",
  "altaria-m": "altaria-mega",
  "glalie-m": "glalie-mega",
  "salamence-m": "salamence-mega",
  "metagross-m": "metagross-mega",
  "lopunny-m": "lopunny-mega",
  "gallade-m": "gallade-mega",
  "audino-m": "audino-mega",
  "diancie-m": "diancie-mega",

  // Other
  "gibbu": "gible",
  "valentina": "lopunny",
  "toothless": "charizard",
};

export const Options: KeyedDict<string, {shiny?: boolean; female?: boolean}> = {
  "juanjo": {shiny: true},
  "onion": {shiny: true},
  "toothless": {shiny: true, female: true},
  "tora": {female: true},
  "valentina": {shiny: true, female: true},
};

export function getAlias(args?: string, lists: Partial<typoCheckerListType>[] = ["all"]):
{id: string; gmax: boolean; emax: boolean; shiny: boolean; female: boolean} {
  let arg = Utilities.toId(args);
  const gmax = arg.includes("-gmax") || arg.includes("-gigantamax");
  const emax = arg.includes("-emax") || arg.includes("-eternamax");
  arg = arg.replace(/-gmax|-gigantamax|-emax|-eternamax/, "");
  const old = arg;
  arg = new TypoChecker().getClosestMatch(arg, ...lists);
  const shiny = !!Options[arg]?.shiny;
  const female = !!Options[arg]?.female;
  if (Aliases[arg]) return {id: Aliases[arg], gmax: gmax, emax: emax, shiny: shiny, female: female};
  return {id: arg || old, gmax: gmax, emax: emax, shiny: shiny, female: female};
}
