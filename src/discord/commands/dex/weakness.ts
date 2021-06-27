import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import type {TypeName} from "@pkmn/types";
import {getAlias} from "../../../misc/dex-aliases";

module.exports = {
  desc: "Gets the weaknesses of a Pok\u{00e9}mon or type.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["weak"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    const [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);
    let types: TypeName[] = [];
    let monName;

    args[0] = getAlias(args[0]);
    const specie = Dex.species.get(args[0]);
    if (specie?.exists) {
      types = [...specie.types];
      monName = specie.name;
    } else if (gen === 8) {
      const Dex7 = gens.get(7);
      const specie7 = Dex7.species.get(args[0]);
      if (specie7?.exists) {
        types = [...specie7.types];
        monName = specie7.name;
      }
    }
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
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `Unable to identify any provided Pok\u{00e9}mon or Types! (Check your spelling?)`
        )
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

    return message.channel.send(
      `${hadGenSpec ? `[Gen ${gen}] ` : ""}Weaknesses for: ${
        monName ? `${monName} ` : ""
      }[${types.join("/")}]\`\`\`xl
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
\`\`\``
    ).catch(e => console.error(e));
  },
} as ICommand;
