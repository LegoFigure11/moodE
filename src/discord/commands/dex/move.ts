import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Move.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["pokemove"],
  usage: "<Pok\u{00e9}mon Move Name>",
  async command(message, args) {
    const [gen, newArgs] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    const move = Dex.moves.get(args[0]);

    console.log(move);

    if (!move?.exists) {
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `Unable to find any Move matching "${
            args[0]
          }" for Generation ${gen}! (Check your spelling?)`
        )
      ).catch(e => console.error(e));
    }

    const isMaxOrZ = move.maxMove || move.zMove;
    const isMaxAndZ = move.maxMove && move.zMove;
    return message.channel.send(
      `\`\`\`${
        Utilities.generateDashes(`[Gen ${gen}] ${move.name}`)
      }\nBase Power: ${move.basePower} ${isMaxOrZ ? "(" : ""}${
        move.maxMove ? `Max Move: ${move.maxMove?.basePower}` : ""
      }${isMaxAndZ ? " | " : ""}${
        move.zMove ? `Z-Move: ${move.zMove?.basePower ||
        move.zMove.boost
          ? Utilities.processZmoveBoost(move.zMove.boost!) : move.zMove.effect}` : ""
      }${isMaxOrZ ? ")" : ""}\nType: ${
        move.type
      } | Acc: ${
        `${move.accuracy}` === "true" ? "--" : move.accuracy
      } | Category: ${move.category} | PP: ${move.pp}/${Math.floor(move.pp * 1.6)}\n${
        move.desc || move.shortDesc
      }\n\n${
        Utilities.getMoveFlagDescriptions(move)
          ? `${Utilities.getMoveFlagDescriptions(move)}\n\n` : ""
      }Introduced in Gen ${move.gen}\`\`\``
    ).catch(e => console.error(e));
  },
} as ICommand;
