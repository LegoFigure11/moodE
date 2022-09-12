import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Sets up reaction roles.",
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.ADD_REACTIONS,
    Permissions.FLAGS.MANAGE_ROLES,
  ],
  aliases: ["rr", "reactrole", "rolereact", "rolereaction"],
  usage: ":emoji:, <@role|user id>, <post id>",
  noPm: true,
  async command(message, args) {
    if (
      !message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
      !DiscordConfig.developers?.includes(message.author.id)
    ) {
      return message.reply(
        {
          content:
            Utilities.failureEmoji(message, `This command can only be used by server admins.`),
          allowedMentions: {repliedUser: false},
        }
      );
    }

    const emoji = Utilities.parseEmoji(message, Utilities.normalizeEmoji(args[0]));
    if (!emoji) {
      return message.reply(
        {
          content:
          Utilities.failureEmoji(
            message,
            `Emoji "${args[0]}" could not be found! If it is a custom emoji, please ensure it is` +
            "from a server that this bot has access to."
          ),
          allowedMentions: {repliedUser: false},
        }
      );
    }

    const role = Utilities.parseRoleId(message, args[1]);
    if (!role) {
      return message.reply(
        {
          content:
          Utilities.failureEmoji(
            message,
            `No role "${args[1]}" could not be found!`
          ),
          allowedMentions: {repliedUser: false},
        }
      );
    }

    const m = await message.channel.messages.fetch(args[2]).catch(console.error);
    if (!m) {
      return message.reply(
        {
          content:
          Utilities.failureEmoji(
            message,
            `No message matching the ID ${args[2]} could be found in this channel!`
          ),
          allowedMentions: {repliedUser: false},
        }
      );
    }

    await m.react(`${emoji}`).catch(console.error);
    const db = Storage.getDatabase(message.guild!.id);
    if (!db.reactionRoles) db.reactionRoles = {};
    if (!db.reactionRoles[`${emoji}-${m.id}`]) {
      db.reactionRoles[`${emoji}-${m.id}`] = {};
    }
    db.reactionRoles[`${emoji}-${m.id}`] = role.id;
    Storage.exportDatabase(message.guild!.id);
    return message.reply(
      {
        content:
        Utilities.successEmoji(
          message,
          `Setup complete! ${role.name} will now be given to people who react with ${emoji}.`
        ),
        allowedMentions: {repliedUser: false},
      }
    );
  },
} as ICommand;
