import {Permissions, MessageEmbed, Formatters} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Item. Items without competitive" +
    " relevance may not be included.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["pokeitem"],
  usage: "<Pok\u{00e9}mon Item Name>",
  async command(message, args) {
    let [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    args[0] = getAlias(args[0], ["items"])[0];
    let item = Dex.items.get(args[0]);

    if (!item?.exists) {
      const Gen7Dex = gens.get(7);
      item = Gen7Dex.items.get(args[0]);
      if (item?.exists && !hadGenSpec) {
        if (gen === 8) gen = 7;
      } else {
        return message.channel.send(
          Utilities.failureEmoji(
            message,
            `Unable to find any Item matching "${
              args[0]
            }" for Generation ${gen}! (Check your spelling?)`
          )
        ).catch(e => console.error(e));
      }
    }

    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
        .setTitle(`[Gen ${gen}] ${item.name}`)
        .setDescription(`${item.desc || item.shortDesc}\n\nIntroduced in Gen ${item.gen}`)
        .setFooter(await Utilities.getFullVersionString());

      message.reply({embeds: [embed], allowedMentions: {repliedUser: false}}).catch(console.error);
    } else {
      // Can't send embed, fall back to text only
      return message.reply(
        {
          content: Formatters.codeBlock("xl", `${
            Utilities.generateDashes(`[Gen ${gen}] ${item.name}`)
          }\n\n${item.desc || item.shortDesc}\n\nIntroduced in Gen ${item.gen}`),
          allowedMentions: {repliedUser: false},
        }
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
