import {Formatters, Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Calculates the TRV (Trainer Residual Value) of a given G7ID and TSV.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["tssv"],
  usage: "<G7ID>, <TSV>",
  command(message, args) {
    const g7id = parseInt(args[0]);
    const tsv = parseInt(args[1]);

    if (isNaN(g7id) || g7id < 0 || g7id > 999999) {
      return message.reply(
        {
          content: Utilities.failureEmoji(
            message,
            `Unable to coerce "${
              args[0]
            }" as a valid G7ID! Your G7ID is the 6-digit long number on your trainer card.`
          ),
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    }
    if (isNaN(tsv) || tsv < 0 || tsv > 0xfff) {
      return message.reply(
        {
          content: Utilities.failureEmoji(
            message,
            `Unable to coerce "${
              args[1]
            }" as a valid TSV! Your TSV is a 4-digit number less than 4096. ` +
          "Get someone with CFW to check it, or calculate it using the tsv command if you know " +
          "5-digit TID and SID."
          ),
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    }
    // Thanks to @wwwwwwzx (https://www.jdoodle.com/a/1U1o) for this calculation!
    const results = [];
    for (let fullId = g7id, max = Math.pow(2, 32) - 1; fullId < max; fullId += 1000000) {
      const xor = (fullId >>> 16) ^ (fullId & 0xffff);
      if (xor >>> 4 === tsv) {
        results.push(
          `TRV: ${(xor & 0xf).toString(16)}\n` +
          `TID: ${(fullId & 0xffff).toString().padStart(5, "0")}\n` +
          `SID: ${(fullId >>> 16).toString().padStart(5, "0")}`
        );
      }
    }
    if (results.length === 0) {
      message.reply(
        {
          content: Utilities.failureEmoji(
            message, `No TRV found for G7ID: \`${g7id}\` and TSV: \`${tsv}\`!`
          ),
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    } else if (results.length === 1) {
      message.reply({
        content: Formatters.codeBlock("xl", results[0]), allowedMentions: {repliedUser: false},
      }).catch(console.error);
    } else {
      message.reply(
        {
          content:
        `${"Looks like you've got multiple results! Math can't narrow them down any further, so " +
        "you'll just have to try them out until you find the right one." +
        "```xl\n"}${
          results.join("\n\n")
        }\`\`\``,
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    }
  },
} as ICommand;
