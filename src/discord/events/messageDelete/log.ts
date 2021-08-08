import {Permissions, MessageEmbed, TextChannel, Message} from "discord.js";
import type {IEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(message): Promise<Message> {
    if (!message.guild) return message;
    const db = Storage.getDatabase(Utilities.toDatabaseId(message));
    const log = db.events?.logger.logDeletes;
    const channel = Utilities.parseChannelId(message, db.events?.logger?.channel) as TextChannel;
    if (!log || !channel) return message;
    if (!channel) return message;
    if (
      db.events?.logger?.ignoreChannels?.includes(channel.id) ||
      db.events?.logger?.ignoreAuthors?.includes(message.author.id) ||
      db.events?.logger?.ignoreMessagesStartingWith?.includes(message.content.charAt(0))
    ) return message;

    let by;
    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.VIEW_AUDIT_LOG)) {
      const entry = await message.guild.fetchAuditLogs(
        {type: "MESSAGE_DELETE"}
      ).then(audit => audit.entries.first());
      if (entry && entry.createdTimestamp > (Date.now() - 5000)) by = entry.executor;
    }

    const embed = new MessageEmbed()
      .setTimestamp(new Date())
      .setFooter(message.client.user!.username, message.client.user!.avatarURL()!)
      .setColor(message.guild.members.cache.get(message.client.user!.id)!.displayColor)
      .addField("Author", message.author.toString(), true)
      .addField("Channel", message.channel.toString(), true)
      .setTitle("Message:")
      .setDescription(message.content || "(None)");

    if (message?.attachments.size > 0) {
      embed.addField("Attachents", message.attachments.size.toString(), true);
    }

    channel.send(
      {
        content: `A message was deleted${by ? ` by ${by.tag}` : ""}:`,
        embeds: [embed],
        files: message.attachments.map(m => m.url),
      }
    ).catch(console.error);

    if (message.embeds?.[0]) {
      const newEmbed = new MessageEmbed(message.embeds[0]);
      channel.send(
        {
          content: `The above message contained ${message.embeds.length} embed${
            message.embeds.length === 1 ? "" : "s"
          }:`, embeds: [newEmbed],
        }
      ).catch(console.error);
    }

    return message;
  },
} as IEvent;
