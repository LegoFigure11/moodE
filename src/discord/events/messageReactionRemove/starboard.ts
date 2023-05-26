import type {MessageReaction, TextChannel} from "discord.js";

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
        if (sb.posts[reaction.message.id]) {
          if (reaction.count >= sb.count) {
            const info = `${emoji} **${reaction.count}** - ${reaction.message.channel}`;
            // Update count
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
            // Remove post
            await channel.messages.fetch(sb.posts[reaction.message.id]).then(m => {
              m.delete().catch(console.error);
              delete sb.posts[reaction.message.id];
              Databases.exportDatabase(reaction.message.id);
            }).catch(console.error);
          }
        }
      }
    }
    return reaction;
  },
} as IMessageReactionEvent;
