import * as fs from "fs";
import * as path from "path";

import {Message, MessageEmbed, TextChannel} from "discord.js";

import type {IMessageUpdateEvent} from "../../../types/events";

const MAX_FIELD_LENGTH = 1024;

module.exports = {
  priority: 1,
  async process(oldMessage, newMessage): Promise<Message> {
    if (!newMessage.guild) return newMessage;
    if (oldMessage.content === newMessage.content) return newMessage;
    const db = Databases.getDatabase(Utilities.toDatabaseId(newMessage));
    const log = db.events?.logger?.logEdits;
    const channel = Utilities.parseChannelId(newMessage, db.events?.logger?.channel) as TextChannel;
    if (!log || !channel) return newMessage;
    if (!channel) return newMessage;
    if (
      db.events?.logger?.ignoreChannels?.includes(channel.id) ||
      db.events?.logger?.ignoreAuthors?.includes(newMessage.author.id) ||
      db.events?.logger?.ignoreMessagesStartingWith?.includes(newMessage.content.charAt(0))
    ) return newMessage;

    const embed = new MessageEmbed()
      .setTimestamp(new Date())
      .setFooter(newMessage.client.user!.username, newMessage.client.user!.avatarURL()!)
      .setColor(newMessage.guild.members.cache.get(newMessage.client.user!.id)!.displayColor)
      .addField("Author", newMessage.author.toString(), true)
      .addField("Channel", newMessage.channel.toString(), true)
      .addField("Link", `[Click me!](${oldMessage.url})`, true);

    let deleteOldMessageFile = false;
    let deleteNewMessageFile = false;
    const files = [];
    if (oldMessage.content.length > MAX_FIELD_LENGTH) {
      fs.writeFileSync(
        path.join(__dirname, `${oldMessage.id} - Old Message.txt`), oldMessage.content
      );
      files.push(path.join(__dirname, `${oldMessage.id} - Old Message.txt`));
      deleteOldMessageFile = true;
    } else {
      embed.addField("Old Message:", oldMessage.content || "(None)", true);
    }

    if (newMessage.content.length > MAX_FIELD_LENGTH) {
      fs.writeFileSync(
        path.join(__dirname, `${newMessage.id} - New Message.txt`), newMessage.content
      );
      files.push(path.join(__dirname, `${newMessage.id} - New Message.txt`));
      deleteNewMessageFile = true;
    } else {
      embed.addField("New Message:", newMessage.content || "(None)", true);
    }

    await channel.send(
      {
        content: `A message was edited:`,
        embeds: [embed],
        files: files,
      }
    ).catch(console.error);

    if (deleteOldMessageFile) {
      fs.unlinkSync(path.join(__dirname, `${oldMessage.id} - Old Message.txt`));
    }
    if (deleteNewMessageFile) {
      fs.unlinkSync(path.join(__dirname, `${newMessage.id} - New Message.txt`));
    }

    return newMessage;
  },
} as IMessageUpdateEvent;
