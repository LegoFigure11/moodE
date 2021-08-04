import {MessageEmbed, Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import {getAlias} from "../../../misc/dex-aliases";

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Move.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["pokemove"],
  usage: "<Pok\u{00e9}mon Move Name>",
  async command(message, args) {
    let [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    args[0] = getAlias(args[0], ["moves"])[0];
    let move = Dex.moves.get(args[0]);

    if (!move?.exists) {
      const Gen7Dex = gens.get(7);
      move = Gen7Dex.moves.get(args[0]);
      if (move?.exists && !hadGenSpec) {
        if (gen === 8) gen = 7;
      } else {
        return message.channel.send(
          Utilities.failureEmoji(
            message,
            `Unable to find any Move matching "${
              args[0]
            }" for Generation ${gen}! (Check your spelling?)`
          )
        ).catch(e => console.error(e));
      }
    }

    const isMaxOrZ = (gen >= 8 && move.maxMove) || (gen >= 7 && move.zMove);
    const isMaxAndZ = (gen >= 8 && move.maxMove) && (gen >= 7 && move.zMove);
    const zMoveText = move.zMove
      ? move.zMove?.basePower ? move.zMove.basePower : move.zMove.boost
        ? Utilities.processZmoveBoost(move.zMove.boost) : move.zMove.effect || ""
      : "";
    const maxZmoveText = `${isMaxOrZ ? "(" : ""}${
      (move.maxMove && gen >= 8) ? `Max Move: ${move.maxMove?.basePower}` : ""
    }${isMaxAndZ ? " | " : ""}${
      (move.zMove && gen >= 7) ? `Z-Move: ${zMoveText}${isMaxOrZ ? ")" : ""}` : ""
    }`;
    const bp = `${move.basePower} ${maxZmoveText}`;
    const acc = `${move.accuracy}` === "true" ? "--" : move.accuracy;
    const pp = `${move.pp}/${Math.floor(move.pp * 1.6)}`;
    const moveFlagDescriptions = Utilities.getMoveFlagDescriptions(move);

    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
        .setTitle(`[Gen ${gen}] ${move.name}`)
        .setDescription(`Base Power: ${bp}
Type: ${move.type} | Acc: ${acc} | Category: ${move.category} | PP: ${pp}

${move.desc || move.shortDesc}

${moveFlagDescriptions ? `${moveFlagDescriptions}\n` : ""}
Introduced in Gen ${move.gen}`)
        .setFooter(await Utilities.getFullVersionString());
      message.channel.send({embed: embed}).catch(console.error);
    } else {
      // Can't send embed, fall back to text only
      return message.channel.send(
        `${
          Utilities.generateDashes(`[Gen ${gen}] ${move.name}`)
        }\nBase Power: ${bp}\nType: ${move.type} | Acc: ${
          acc
        } | Category: ${move.category} | PP: ${pp}\n${
          move.desc || move.shortDesc
        }\n\n${
          moveFlagDescriptions
            ? `${moveFlagDescriptions}\n\n` : ""
        }Introduced in Gen ${move.gen}`,
        {code: "XL"}
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
