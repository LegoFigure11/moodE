import {Permissions, MessageEmbed} from "discord.js";
import type {ICommand} from "../../../types/commands";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Ability.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["abil", "pokeability"],
  usage: "<Pok\u{00e9}mon Ability Name>",
  async command(message, args) {
    const [gen, newArgs] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    const ability = Dex.abilities.get(args[0]);

    if (!ability?.exists) {
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `Unable to find any Ability matching "${
            args[0]
          }" for Generation ${gen}! (Check your spelling?)`
        )
      ).catch(e => console.error(e));
    }

    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
        .setTitle(`[Gen ${gen}] ${ability.name}`)
        .setDescription(`${ability.desc || ability.shortDesc}\n\nIntroduced in Gen ${ability.gen}`)
        .setFooter(await Utilities.getFullVersionString());


      message.channel.send({embed: embed}).catch(console.error);
    } else {
      // Can't send embed, fall back to text only
      return message.channel.send(
        `\`\`\`${
          Utilities.generateDashes(`[Gen ${gen}] ${ability.name}`)
        }\n\n${ability.desc || ability.shortDesc}\n\nIntroduced in Gen ${ability.gen}\`\`\``
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
