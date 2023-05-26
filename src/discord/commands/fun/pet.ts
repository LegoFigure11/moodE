import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "/me pet",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  command(message, args) {
    return message.reply(
      {
        content:
          `_/me pet ${args[0] ? args[0] : ""}_`,
        allowedMentions: {repliedUser: false},
      }
    );
  },
} as ICommand;
