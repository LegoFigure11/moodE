import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets a users profile picture.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["bigpfp", "avatar", "avi"],
  usage: "<user id>",
  command(message, args) {
    if (!args[0]) {
      return message.channel.send(
        Utilities.failureEmoji(message, "Please mention a user or provide a valid User ID!")
      ).catch(console.error);
    }
    const user = Utilities.parseUserId(message, args[0]);
    if (!user) {
      return message.channel.send(
        Utilities.failureEmoji(message, `Unable to find a user matching "${args[0]}"!`)
      ).catch(console.error);
    }
    const url = user.avatarURL({format: "png"});
    if (!url) {
      return message.channel.send(
        Utilities.failureEmoji(message, `Unable to a find Profile Picture for this user!`)
      ).catch(console.error);
    }
    return message.channel.send(`${url}?size=1024`).catch(console.error);
  },
} as ICommand;
