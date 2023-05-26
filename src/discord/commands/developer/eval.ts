import * as data from "@pkmn/data";
import * as dex from "@pkmn/dex";
import * as mods from "@pkmn/mods";
import * as Discord from "discord.js";
import {Formatters} from "discord.js";
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars

import type {ICommand} from "../../../types/commands";
import {UserPermissions} from "../../enums/userPermissions";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const gens = new data.Generations(dex.Dex);

module.exports = {
  desc: "Executes arbitrary javascript.",
  commandPermissions: [Discord.Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: UserPermissions.DEVELOPER,
  usage: "<expression>",
  aliases: ["js", "code"],
  command(message, args) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, no-eval
      const output = Utilities.clean(require("util").inspect(eval(args.join(", "))));
      let first = true;
      for (const chunk of Discord.Util.splitMessage(Formatters.codeBlock("xl", output))) {
        if (first) {
          message.reply(
            {content: chunk, allowedMentions: {repliedUser: false}}
          ).catch(console.error);
          first = false;
        } else {
          message.channel.send(chunk).catch(console.error);
        }
      }
    } catch (e) {
      message.channel.send(
        `\`ERROR\`\n ${Formatters.codeBlock("xl", Utilities.clean((e as any).stack))}`
      ).catch(console.error);
    }
  },
} as ICommand;
