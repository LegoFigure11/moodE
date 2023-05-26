import {Generations} from "@pkmn/data";
import * as dex from "@pkmn/dex";
import {Formatters, MessageEmbed, Permissions} from "discord.js";

import {getAlias} from "../../../misc/dex-aliases";
import type {ICommand} from "../../../types/commands";

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
    args[0] = getAlias(args[0], ["items"]).id;

    let item;
    do {
      const tempDex = gens.get(gen);
      const tempItem = tempDex.items.get(args[0]);
      item = tempItem;
    } while (!hadGenSpec && !item?.exists && --gen > 0);

    if (!item?.exists) {
      return message
        .reply({
          content: Utilities.failureEmoji(
            message,
            `Unable to find any Item matching "${args[0]}" for Generation ${gen}! (Check your spelling?)`
          ),
          allowedMentions: {repliedUser: false},
        })
        .catch((e) => console.error(e));
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
