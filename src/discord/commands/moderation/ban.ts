import {Permissions, Message} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {UserPermissions} from "../../enums/userPermissions";

const TIMEOUT = 30 * 1000;

module.exports = {
  desc: "Notifies then bans a member from the server.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.BAN_MEMBERS],
  aliases: ["bean"],
  usage: "<@user|user id>, <reason (optional)>",
  userPermissions: UserPermissions.MANAGER,
  async command(message, args) {
    if (!args[0]) return message.channel.send("Please provide a user to ban!");

    if (!Utilities.checkBotPermissions(message, Permissions.FLAGS.BAN_MEMBERS)) {
      return message.channel.send("Missing permission: `BAN_MEMBERS`");
    }

    const user = args[0].includes("<")
      ? await client.users.fetch((/^<@!?(\d+)>$/.exec(args[0]))![1])
      : await client.users.fetch(args[0]);

    if (!user) {
      return message.channel.send(
        Utilities.failureEmoji(message, `Unable to find a user matching: "${args[0]}"`)
      );
    }

    if (user.id === message.author.id) {
      return message.channel.send(
        Utilities.failureEmoji(message, `You cannot ban yourself!`)
      );
    }

    args.shift();
    const reason = args.join(", ");

    const filter = (response: Message) =>
      response.author.id === message.author.id &&
      response.channel.id === message.channel.id &&
      (Utilities.toId(response.content) === "y" || Utilities.toId(response.content) === "n");

    let isInServer = true;
    try {
      const member = message.guild!.members.cache.get(user.id);
      let banMessage = `${
        message.author
      } Are you sure you want to ban ${user.username}#${user.discriminator}? (Y/n):`;
      if (!member) {
        isInServer = false;
        banMessage = `${message.author} It doesn't look like ${
          user.username}#${user.discriminator
        } is in this server. Would you like to ban them anyway? (Y/n):`;
      } else if (!member?.bannable) {
        return await message.channel.send(
          Utilities.failureEmoji(
            message,
            `Unable to ban ${user.username}#${user.discriminator} due to insufficient permissions` +
            "! Do they have a role higher than mine?"
          )
        );
      }
      await message.channel.send(banMessage).then(async () => {
        await message.channel.awaitMessages({
          filter, max: 1, time: TIMEOUT, errors: ["time"],
        }).then(async (c) => {
          if (Utilities.toId(c.first()!.content) === "y") {
            if (isInServer) {
              try {
                await user.send(
                  `You have been banned from ${message.guild!.name} ${reason.length > 0
                    ? `(${reason})` : `(No reason was provided)`}`
                );
              } catch {
                await message.channel.send("Unable to DM user.");
              }
            }
            await message.guild!.members.ban(user, {days: 7, reason: reason});
            return message.channel.send(Utilities.successEmoji(
              message, `${user} was banned${reason.length > 0 ? ` (${reason})` : ""}!`
            ));
          } else {
            return message.channel.send(
              `${user.username}#${user.discriminator} will not be banned!`
            );
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  },
} as ICommand;
