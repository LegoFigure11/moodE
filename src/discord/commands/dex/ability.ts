import {Generations} from "@pkmn/data";
import * as dex from "@pkmn/dex";
import {Formatters, MessageEmbed, Permissions} from "discord.js";

import {getAlias} from "../../../misc/dex-aliases";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Ability.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["abil", "pokeability"],
  usage: "<Pok\u{00e9}mon Ability Name>",
  async command(message, args) {
    let [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    args[0] = getAlias(args[0], ["abilities"]).id;

    let ability;
    do {
      const tempDex = gens.get(gen);
      const tempAbility = tempDex.abilities.get(args[0]);
      ability = tempAbility;
    } while (!hadGenSpec && !ability?.exists && --gen > 0);

    if (!ability?.exists) {
      return message
        .reply({
          content: Utilities.failureEmoji(
            message,
            `Unable to find any Abilities matching "${args[0]}" for Generation ${gen}! (Check your spelling?)`
          ),
          allowedMentions: {repliedUser: false},
        })
        .catch((e) => console.error(e));
    }

    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
        .setTitle(`[Gen ${gen}] ${ability.name}`)
        .setDescription(`${ability.desc || ability.shortDesc}\n\nIntroduced in Gen ${ability.gen}`)
        .setFooter({text: await Utilities.getFullVersionString()});

      message.reply({embeds: [embed], allowedMentions: {repliedUser: false}}).catch(console.error);
    } else {
      // Can't send embed, fall back to text only
      return message.reply(
        {
          content: Formatters.codeBlock("xl", `${
            Utilities.generateDashes(`[Gen ${gen}] ${ability.name}`)
          }\n\n${ability.desc || ability.shortDesc}\n\nIntroduced in Gen ${ability.gen}`),
          allowedMentions: {repliedUser: false},
        }
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
