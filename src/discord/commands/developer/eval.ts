import * as Discord from "discord.js";
import * as dex from "@pkmn/dex";
import * as data from "@pkmn/data";
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import * as mods from "@pkmn/mods";
import type {ICommand} from "../../../types/commands";

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const gens = new data.Generations(dex.Dex);

module.exports = {
  desc: "Executes arbitrary javascript.",
  commandPermissions: [Discord.Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: "d",
  usage: "<expression>",
  aliases: ["js", "code"],
  command(message, args) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, no-eval
      const output = Utilities.clean(require("util").inspect(eval(args.join(", "))));
      message.channel.send(output, {code: "xl", split: true}).catch(err => console.error(err));
    } catch (e) {
      message.channel.send(
        `\`ERROR\` \`\`\`xl\n${Utilities.clean(e.stack.replace("/Archie/g", "*"))}\n\`\`\``
      ).catch(err => console.error(err));
    }
  },
} as ICommand;
