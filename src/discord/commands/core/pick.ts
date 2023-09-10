import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Chooses between a list of options",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["choose"],
  usage: "<list>, <of>, <options>",
  async command(message, args) {
    if (args.length < 2) {
      return message
        .reply({
          content: Utilities.failureEmoji(
            message,
            "Please proide at least two options separated by commas."
          ),
          allowedMentions: { repliedUser: false },
        })
        .catch(console.error);
    }
    return message
      .reply({
        content: `:game_die: I randomly selected... ${Utilities.sampleOne(args)}`,
        allowedMentions: { repliedUser: false },
      })
      .catch(console.error);
  },
} as ICommand;
