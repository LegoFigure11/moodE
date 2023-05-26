import {Generations} from "@pkmn/data";
import * as dex from "@pkmn/dex";
import type {TypeName} from "@pkmn/types";
import {Formatters, Permissions} from "discord.js";

import {getAlias} from "../../../misc/dex-aliases";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets the weaknesses of a Pok\u{00e9}mon or type.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["weak"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    let [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);
    let types: TypeName[] = [];
    let monName;

    args[0] = getAlias(args[0], ["pokemon", "types"]).id;

    let specie;
    do {
      const tempDex = gens.get(gen);
      const tempSpecie = tempDex.species.get(args[0]);
      if (tempSpecie?.exists) {
        specie = tempSpecie;
        types = [...tempSpecie.types];
        monName = tempSpecie.name;
      }
    } while (!specie?.exists && --gen > 0);

    const bs = specie?.baseStats;
    const defString = `HP: ${bs?.hp} / Def: ${bs?.def} / SpD: ${bs?.spd}`;

    if (!types.length) {
      let index = 0;
      for (const arg of args) {
        if (Dex.types.get(arg)?.name) {
          types[index] = Dex.types.get(arg)!.name;
          index++;
          if (index >= 2) break;
        }
      }
    }
    if (!types.length) {
      return message.reply(
        {
          content: Utilities.failureEmoji(
            message,
            `Unable to identify any provided Pok\u{00e9}mon or Types! (Check your spelling?)`
          ),
          allowedMentions: {repliedUser: false},
        }
      ).catch(e => console.error(e));
    }

    const effectiveness: {[k: string]: string[]} = {
      0: [],
      0.25: [],
      0.5: [],
      1: [],
      2: [],
      4: [],
    };

    for (const t of Dex.types) {
      const eff = Dex.types.totalEffectiveness(t.name, types);
      effectiveness[eff].push(t.name);
    }

    return message.channel.send(Formatters.codeBlock("xl",
      `${hadGenSpec ? `[Gen ${gen}] ` : ""}Weaknesses for: ${
        monName ? `${monName} ` : ""
      }[${types.join("/")}]
Stats: ${defString}
0.00x: ${
  effectiveness[0].length ? effectiveness[0].join(", ") : "(None)"}
0.25x: ${
  effectiveness[0.25].length ? effectiveness[0.25].join(", ") : "(None)"
}
0.50x: ${
  effectiveness[0.5].length ? effectiveness[0.5].join(", ") : "(None)"
}
1.00x: ${
  effectiveness[1].length ? effectiveness[1].join(", ") : "(None)"
}
2.00x: ${
  effectiveness[2].length ? effectiveness[2].join(", ") : "(None)"
}
4.00x: ${
  effectiveness[4].length ? effectiveness[4].join(", ") : "(None)"
}
`)).catch(e => console.error(e));
  },
} as ICommand;
