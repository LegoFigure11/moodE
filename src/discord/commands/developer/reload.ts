import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Live reloads modules",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: "d",
  usage: "<utilities, config, storage, commands, messagedeletehandler, all>",
  aliases: ["hotpatch", "rl", "rocketleague"],
  command(message, args) {
    if (__reloadInProgress) {
      return message.channel.send(
        Utilities.failureEmoji(message, "You must wait for the current reload to finish.")
      ).catch(e => console.error(e));
    }

    void __reloadModules(message, args).catch(e => console.error(e.stack));
  },
} as ICommand;
