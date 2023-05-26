import {MessageEmbed, MessageReaction, TextChannel} from "discord.js";

import type {IMessageReactionEvent} from "../../../types/events";

module.exports = {
  priority: 50,
  async process(reaction: MessageReaction) {
    const db = Databases.getDatabase(reaction.message.guild!.id);
    const emoji = `${reaction.emoji}`;
    if (!db.starboard) return reaction;
    const sb = db.starboard[emoji];
    if (sb) {
      const channel = Utilities.parseChannelId(
        reaction.message.guild!, sb.channel
      ) as TextChannel;
      if (channel) {
        if (reaction.count >= sb.count) {
          const info = `${emoji} **${reaction.count}** - ${reaction.message.channel}`;
          if (sb.posts[reaction.message.id]) {
            // Post has already been starboarded, update count
            channel.messages.fetch(sb.posts[reaction.message.id]).then(m => {
              const e = m.embeds;
              m.edit(
                {
                  content: `${info} (${reaction.message.author})`,
                  embeds: [...e],
                }
              ).catch(console.error);
            }).catch(console.error);
          } else {
            // Create new starboard post
            const e = new MessageEmbed()
              .setTimestamp(new Date())
              .setAuthor({
                name: reaction.message.author!.username,
                iconURL: reaction.message.author!.avatarURL()!,
              })
              .setFooter({
                text: await Utilities.getFullVersionString(),
                iconURL: reaction.message.client.user!.avatarURL()!,
              })
              .addField("Link", `[Click me!](${reaction.message.url})`, true);
            if (reaction.message.content) {
              e.setTitle("Message:");
              e.setDescription(reaction.message.content);
            }
            if (reaction.message.attachments.first()) {
              e.setImage(reaction.message.attachments.first()!.url);
            } else if (reaction.message.embeds[0]?.image?.url) {
              e.setImage(reaction.message.embeds[0].image?.url);
            }

            channel.send({content: info, embeds: [e]}).then(m => {
              m.edit(
                {
                  content: `${info} (${reaction.message.author})`,
                  embeds: [e],
                }
              ).catch(console.error);
              sb.posts[reaction.message.id] = m.id;
              Databases.exportDatabase(reaction.message.guild!.id);
            }).catch(console.error);
          }
        }
      }
    }
    return reaction;
  },
} as IMessageReactionEvent;
