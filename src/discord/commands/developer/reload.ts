import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";
import {UserPermissions} from "../../enums/userPermissions";

module.exports = {
  desc: "Live reloads modules",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: UserPermissions.DEVELOPER,
  usage: "<utilities, config, Databases, commands, messagedeletehandler, all>",
  aliases: ["hotpatch", "rl", "rocketleague"],
  command(message, args) {
    if (__reloadInProgress) {
      return message.reply(
        {
          content: Utilities.failureEmoji(
            message, "You must wait for the current reload to finish."
          ),
          allowedMentions: {repliedUser: false},
        }
      ).catch(e => console.error(e));
    }

    void __reloadModules(message, args).catch(e => console.error(e.stack));
  },
} as ICommand;
