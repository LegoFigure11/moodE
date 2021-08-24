import {Formatters, Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";

enum LEVEL_MODIFIERS {
  FIFTEEN = 0.51739395,
  TWENTY = 0.59740001,
  TWENTYFIVE = 0.667934,
  FORTY = 0.79030001,
  FORTYONE = 0.79530001,
  FIFTY = 0.84029999,
  FIFTYONE = 0.84529999,
}

module.exports = {
  desc: "Calculates the CP of a Pok\u{00e9}mon.",
  usage: "<species name>",
  aliases: ["combatpower", "hundo"],
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
  ],
  command(message, args) {
    let [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    args[0] = getAlias(args[0], ["pokemon"]).id;
    let specie = Dex.species.get(args[0]);

    if (!specie?.exists) {
      const Gen7Dex = gens.get(7);
      specie = Gen7Dex.species.get(args[0]);
      if (specie?.exists && !hadGenSpec) {
        if (gen === 8) gen = 7;
      } else {
        return message.reply(
          {
            content:
            Utilities.failureEmoji(
              message,
              `Unable to find any Pok\u{00e9}mon matching "${
                args[0]
              }" for Generation ${gen}! (Check your spelling?)`
            ),
            allowedMentions: {repliedUser: false},
          }
        ).catch(e => console.error(e));
      }
    }

    const [batk, bdef, bhp] = calcPogoBaseStats(specie.baseStats);
    let [atk, def, hp] = [batk, bdef, bhp];
    const cp = maxCP(atk, def, hp, LEVEL_MODIFIERS.FORTY);
    if (cp > 4000) {
      [atk, def, hp] = calcPogoBaseStats(specie.baseStats, true);
    }
    return message.reply(
      {
        content: Formatters.codeBlock(
          "XL",
          `${Utilities.generateDashes(`${specie.name} - ATK: ${atk} | DEF: ${def} | STA: ${hp}`)}
Lv. 15: ${
  maxCP(atk, 10, def, 10, hp, 10, LEVEL_MODIFIERS.FIFTEEN)
} - ${
  maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.FIFTEEN)
}
Lv. 20: ${
  maxCP(atk, 10, def, 10, hp, 10, LEVEL_MODIFIERS.TWENTY)
} - ${maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.TWENTY)
}
Lv. 25: ${
  maxCP(atk, 10, def, 10, hp, 10, LEVEL_MODIFIERS.TWENTYFIVE)
} - ${
  maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.TWENTYFIVE)
}
Lv. 40: ${maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.FORTY)}
Lv. 41: ${maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.FORTYONE)}
Lv. 50: ${maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.FIFTY)}
Lv. 51: ${maxCP(atk, 15, def, 15, hp, 15, LEVEL_MODIFIERS.FIFTYONE)}`
        ),
        allowedMentions: {repliedUser: false},
      }
    );
  },
} as ICommand;

function calcPogoBaseStats(stats: dex.StatsTable, nerf?: boolean):
[atk: number, def: number, hp: number] {
  const atk = Math.round(atkFormula(stats.atk, stats.spa, stats.spe) * (nerf ? 0.91 : 1));
  const def = Math.round(defFormula(stats.def, stats.spd, stats.spe) * (nerf ? 0.91 : 1));
  const hp = Math.round(Math.floor(stats.hp * 1.75 + 50) * (nerf ? 0.91 : 1));
  return [atk, def, hp];
}

function atkFormula(a: number, b: number, speed: number): number {
  return Math.round(
    Math.round(2 * (7 / 8 * Math.max(a, b) + 1 / 8 * Math.min(a, b))) * (1 + (speed - 75) / 500)
  );
}

function defFormula(a: number, b: number, speed: number): number {
  return Math.round(
    Math.round(2 * (5 / 8 * Math.max(a, b) + 3 / 8 * Math.min(a, b))) * (1 + (speed - 75) / 500)
  );
}

function maxCP(
  atk: number, ativ: number, def: number, dfiv: number, hp: number, hpiv: number, mult: number
): number {
  return Math.max(
    10,
    Math.floor(
      (
        (atk + ativ) * Math.sqrt(def + dfiv) * Math.sqrt(hp + hpiv) * Math.pow(mult, 2)
      ) / 10
    )
  );
}
