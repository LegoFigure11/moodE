import {Permissions, MessageEmbed, Formatters} from "discord.js";
import type {ICommand} from "../../../types/commands";
import type {ShortStatName} from "../../../types/dex";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";

const stats: {[k: string]: string[]} = {
  "a": ["a", "atk", "attack"],
  "b": ["b", "def", "defence", "defense"],
  "c": ["c", "spa", "spatk", "specialatk", "specialattack"],
  "d": ["d", "spd", "spdef", "specialdef", "specialdefence", "specialdefense"],
  "s": ["s", "spe", "speed"],
};

const natures: {[k: string]: string[]} = {
  "a": ["Hardy", "Lonely", "Adamant", "Naughty", "Brave"],
  "b": ["Bold", "Docile", "Impish", "Lax", "Relaxed"],
  "c": ["Modest", "Mild", "Bashful", "Rash", "Quiet"],
  "d": ["Calm", "Gentle", "Careful", "Quirky", "Sassy"],
  "s": ["Timid", "Hasty", "Jolly", "Naive", "Serious"],
};

const naturesNoNeutral: {[k: string]: string[]} = {
  "a": ["Lonely", "Adamant", "Naughty", "Brave"],
  "b": ["Bold", "Impish", "Lax", "Relaxed"],
  "c": ["Modest", "Mild", "Rash", "Quiet"],
  "d": ["Calm", "Gentle", "Careful", "Sassy"],
  "s": ["Timid", "Hasty", "Jolly", "Naive"],
};

const statToNum = (stat: ShortStatName) => {
  if (stat === "b") return 1;
  if (stat === "c") return 2;
  if (stat === "d") return 3;
  if (stat === "s") return 4;
  return 0;
};

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Nature.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["pokenature"],
  usage: "<Pok\u{00e9}mon Nature Name> | <Boosted Stat>, <Reduced Stat>",
  async command(message, args) {
    const gens = new Generations(dex.Dex);
    const Dex = gens.get(8);

    args[0] = getAlias(args[0], ["natures"])[0];
    let nature = Dex.natures.get(args[0]);

    if (!nature?.exists) {
      // Check for stats
      const searchStats = ["", ""];
      let idx = 0;
      for (const arg of args.map(a => Utilities.toId(a))) {
        if (idx >= 2) break;
        for (const k of Object.keys(stats)) {
          if (stats[k].includes(arg)) {
            searchStats[idx] = k;
            idx++;
          }
        }
      }
      if (searchStats[0]) {
        if (!searchStats[1]) {
          // Get all natures matching searchStats[0];
          return message.reply(
            {
              content: `All Natures that boost **${
                Utilities.toStatName(searchStats[0])
              }**: ${naturesNoNeutral[searchStats[0]].join(", ")}`,
              allowedMentions: {repliedUser: false},
            }
          ).catch(console.error);
        }
        nature = Dex.natures.get(
          natures[searchStats[0]][statToNum(searchStats[1] as ShortStatName)]
        );
      }
      if (!nature?.exists) {
        return message.reply(
          {
            content: Utilities.failureEmoji(
              message,
              `Unable to find any Nature matching "${
                args[0]
              }"! (Check your spelling?)`
            ),
            allowedMentions: {repliedUser: false},
          }
        ).catch(e => console.error(e));
      }
    }

    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
        .setTitle(`${nature.name} Nature`)
        .setDescription(
          `Boosts: ${Utilities.toStatName(nature.plus || "None")} (x1.1), Reduces: ${
            Utilities.toStatName(nature.minus || "None")
          } (x0.9)`
        )
        .setFooter(await Utilities.getFullVersionString());

      message.reply({embeds: [embed], allowedMentions: {repliedUser: false}}).catch(console.error);
    } else {
      // Can't send embed, fall back to text only
      return message.reply(
        {
          content: Formatters.codeBlock("xl",
            `${
              Utilities.generateDashes(`${nature.name} Nature`)
            }\n\nBoosts: ${Utilities.toStatName(nature.plus || "None")} (x1.1), Reduces: ${
              Utilities.toStatName(nature.minus || "None")
            } (x0.9)`),
          allowedMentions: {repliedUser: false},
        }
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
