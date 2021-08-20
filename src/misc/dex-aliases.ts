import type {typoCheckerListType} from "../types/typo-checker";
import {TypoChecker} from "./typo-checker";

export const Aliases: KeyedDict<string, {id: string; shiny?: boolean; female?: boolean}> = {
  // Cool people
  "adam": {id: "slakoth"},
  "anubis": {id: "corviknight"},
  "archie": {id: "jirachi"},
  "bluecake": {id: "scorbunny"},
  "juanjo": {id: "falinks", shiny: true},
  "lego": {id: "eldegoss"},
  "mica": {id: "shaymin"},
  "onion": {id: "eldegoss", shiny: true},
  "psychicj": {id: "gardevoir"},
  "saiph": {id: "gengar", shiny: true},
  "taylor": {id: "nidoking", shiny: true},
  "thexreturns": {id: "garchomp"},
  "tora": {id: "luxray", female: true},
  "xen": {id: "qwilfish"},
  "x": {id: "gible"},

  // Memes
  "boob": {id: "rowlet"},
  "god": {id: "bidoof"},
  "rat": {id: "rattata"},

  // Dex Numbers
  "360": {id: "wynaut"},

  // Foreign Names
  "boober": {id: "magmar"},

  // Megas
  "venusaur-m": {id: "venusaur-mega"},
  "charizard-x": {id: "charizard-mega-x"},
  "charizard-y": {id: "charizard-mega-y"},
  "blastoise-m": {id: "blastoise-mega"},
  "alakazam-m": {id: "alaazam-mega"},
  "gengar-m": {id: "gengar-mega"},
  "kangaskhan-m": {id: "kangaskhan-mega"},
  "pinsir-m": {id: "pinsir-mega"},
  "gyarados-m": {id: "gyarados-mega"},
  "aerodactyl-m": {id: "aerodactyl-mega"},
  "mewtwo-x": {id: "mewtwo-mega-x"},
  "mewtwo-y": {id: "mewtwo-mega-y"},
  "ampharos-m": {id: "ampharos-mega"},
  "scizor-m": {id: "scizor-mega"},
  "heracross-m": {id: "heracross-mega"},
  "houndoom-m": {id: "houndoom-mega"},
  "tyranitar-m": {id: "tyranitar-mega"},
  "blaziken-m": {id: "blaziken-mega"},
  "gardevoir-m": {id: "gardevoir-mega"},
  "mawile-m": {id: "mawile-mega"},
  "aggron-m": {id: "aggron-mega"},
  "medicham-m": {id: "medicham-mega"},
  "manectric-m": {id: "manectric-mega"},
  "banette-m": {id: "banette-mega"},
  "latias-m": {id: "latias-mega"},
  "latios-m": {id: "latios-mega"},
  "garchomp-m": {id: "garchomp-mega"},
  "lucario-m": {id: "lucario-mega"},
  "beedrill-m": {id: "beedrill-mega"},
  "pidgeot-m": {id: "pidgeot-mega"},
  "slowbro-m": {id: "slowbro-mega"},
  "steelix-m": {id: "steelix-mega"},
  "sceptile-m": {id: "sceptile-mega"},
  "swampert-m": {id: "swampert-mega"},
  "sableye-m": {id: "sableye-mega"},
  "sharpedo-m": {id: "sharpedo-mega"},
  "camerupt-m": {id: "camerupt-mega"},
  "altaria-m": {id: "altaria-mega"},
  "glalie-m": {id: "glalie-mega"},
  "salamence-m": {id: "salamence-mega"},
  "metagross-m": {id: "metagross-mega"},
  "lopunny-m": {id: "lopunny-mega"},
  "gallade-m": {id: "gallade-mega"},
  "audino-m": {id: "audino-mega"},
  "diancie-m": {id: "diancie-mega"},

  // Other
  "gibbu": {id: "gible"},
  "toothless": {id: "charizard", shiny: true},
  "valentina": {id: "lopunny", shiny: true, female: true},
};

export function getAlias(args?: string, lists: Partial<typoCheckerListType>[] = ["all"]):
{id: string; gmax: boolean; emax: boolean; shiny: boolean; female: boolean} {
  let arg = Utilities.toId(args);
  const gmax = arg.includes("-gmax") || arg.includes("-gigantamax");
  const emax = arg.includes("-emax") || arg.includes("-eternamax");
  arg = arg.replace(/-gmax|-gigantamax|-emax|-eternamax/, "");
  const old = arg;
  arg = new TypoChecker().getClosestMatch(arg, ...lists);
  const match = Aliases[arg];
  return {
    id: match?.id || old, gmax: gmax, emax: emax, shiny: !!match?.shiny, female: !!match?.female,
  };
}
