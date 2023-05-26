import {Permissions, TextChannel} from "discord.js";

import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Sets up starboard.",
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
  ],
  aliases: ["sb"],
  usage: ":emoji:, <@channel|channel id>, <number of reactions (default 3)>",
  noPm: true,
  async command(message, args) {
    if (
      !message.member?.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
      !DiscordConfig.developers?.includes(message.author.id)
    ) {
      return message.reply(
        {
          content:
            Utilities.failureEmoji(
              message, `This command can only be used by server or bot admins.`
            ),
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

    const channel = Utilities.parseChannelId(message, args[1]) as TextChannel;
    if (!channel) {
      return message.reply(
        {
          content:
          Utilities.failureEmoji(
            message,
            `No channel "${args[1]}" could not be found!`
          ),
          allowedMentions: {repliedUser: false},
        }
      );
    }
    if (channel.type as string !== "GUILD_TEXT") {
      return message.reply(
        {
          content:
          Utilities.failureEmoji(
            message,
            `Please ensure that "${
              args[1]
            }" is a regular text channel, not a Thread or News channel.`
          ),
          allowedMentions: {repliedUser: false},
        }
      );
    }

    let number = 3;
    if (!isNaN(+args[2])) number = +args[2];

    const db = Databases.getDatabase(message.guild!.id);
    if (!db.starboard) db.starboard = {};
    if (!db.starboard[`${emoji}`]) {
      db.starboard[`${emoji}`] = {};
    }
    db.starboard[`${emoji}`] = {channel: channel.id, count: number, posts: {}};
    Databases.exportDatabase(message.guild!.id);
    return message.reply(
      {
        content:
        Utilities.successEmoji(
          message,
          "Setup complete!\n" +
          `Starboard configuration for ${emoji}:\n` +
          `Channel: ${channel}\nNumber of reactions required: ${number}`
        ),
        allowedMentions: {repliedUser: false},
      }
    );
  },
} as ICommand;
