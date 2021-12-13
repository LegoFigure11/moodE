import {Permissions, Message} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {UserPermissions} from "../../enums/userPermissions";

const TIMEOUT = 30 * 1000;

module.exports = {
  desc: "Notifies then kicks a member from the server.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.KICK_MEMBERS],
  aliases: ["punt", "begone", "yeet"],
  usage: "<@user|user id>, <reason (optional)>",
  userPermissions: UserPermissions.MANAGER,
  async command(message, args) {
    if (!args[0]) return message.channel.send("Please provide a user to kick!");

    if (!Utilities.checkBotPermissions(message, Permissions.FLAGS.KICK_MEMBERS)) {
      return message.channel.send("Missing permission: `KICK_MEMBERS`");
    }

    const user = await Utilities.parseUserId(message, args[0]);
    if (!user) {
      return message.channel.send(
        Utilities.failureEmoji(message, `Unable to find a user matching: "${args[0]}"`)
      );
    }

    if (user.id === message.author.id) {
      return message.channel.send(
        Utilities.failureEmoji(message, `You cannot kick yourself!`)
      );
    }

    const member = message.guild!.members.cache.get(user.id);
    if (!member!.bannable) {
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `Unable to kick ${user.username}#${user.discriminator} due to insufficient permissions!` +
          " Do they have a role higher than mine?"
        )
      );
    }

    args.shift();
    const reason = args.join(", ");

    const filter = (response: Message) =>
      response.author.id === message.author.id &&
      response.channel.id === message.channel.id &&
      (Utilities.toId(response.content) === "y" || Utilities.toId(response.content) === "n");

    try {
      await message.channel.send(
        `${message.author} Are you sure you want to kick ${
          user.username}#${user.discriminator
        }? (Y/n):`
      ).then(() => {
        void message.channel.awaitMessages({
          filter, max: 1, time: TIMEOUT, errors: ["time"],
        }).then(async (c) => {
          if (Utilities.toId(c.first()!.content) === "y") {
            try {
              await user.send(
                `You have been kicked from ${message.guild!.name} ${reason.length > 0
                  ? `(${reason})` : `(No reason was provided)`}`
              );
            } catch {
              await message.channel.send("Unable to DM user.");
            }
            await message.guild!.members.kick(user, reason);
            return message.channel.send(Utilities.successEmoji(
              message, `${user} was kicked${reason.length > 0 ? ` (${reason})` : ""}!`
            ));
          } else {
            return message.channel.send(
              `${user.username}#${user.discriminator} will not be kicked!`
            );
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  },
} as ICommand;
