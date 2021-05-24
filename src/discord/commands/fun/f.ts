import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Pays respects.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  command(message) {
    const db = Storage.getDatabase("f");
    if (!db.global) db.global = 0;
    db.global += 1;
    Storage.exportDatabase("f");
    return message.channel.send(
      `${message.author.username} paid their respects.\nTotal respects paid: ${db.global}`
    );
  },
} as ICommand;
