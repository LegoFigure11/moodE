import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets a users profile picture.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["bigpfp", "avatar", "avi"],
  usage: "<user id>",
  async command(message, args) {
    if (!args[0]) {
      return message.reply(
        {
          content:
           Utilities.failureEmoji(message, "Please mention a user or provide a valid User ID!"),
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    }
    const user = await Utilities.parseUserId(message, args[0]);
    if (!user) {
      return message.reply(
        {
          content:
            Utilities.failureEmoji(message, `Unable to find a user matching "${args[0]}"!`),
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    }
    const url = user.avatarURL({format: "png"});
    if (!url) {
      return message.reply(
        {
          content:
           Utilities.failureEmoji(message, `Unable to a find Profile Picture for this user!`),
          allowedMentions: {repliedUser: false},
        }
      ).catch(console.error);
    }
    return message.reply(
      {
        content: `${url}?size=1024`, allowedMentions: {repliedUser: false},
      }
    ).catch(console.error);
  },
} as ICommand;
