import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Pays respects.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  command(message) {
    const db = Databases.getDatabase("f");
    if (!db.global) db.global = 0;
    db.global += 1;
    Databases.exportDatabase("f");
    return message.reply(
      {
        content:
          `${message.author.username} paid their respects.\nTotal respects paid: ${db.global}`,
        allowedMentions: {repliedUser: false},
      }
    );
  },
} as ICommand;
