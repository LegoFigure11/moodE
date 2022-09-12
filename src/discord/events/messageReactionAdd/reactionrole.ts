import type {MessageReaction, User} from "discord.js";
import type {IMessageReactionEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(reaction: MessageReaction, user: User) {
    const db = Storage.getDatabase(reaction.message.guild!.id);
    const emoji = `${reaction.emoji}`;
    if (!db.reactionRoles) db.reactionRoles = {};
    if (db.reactionRoles[`${emoji}-${reaction.message.id}`]) {
      await reaction.message.guild!.members.cache.get(
        user.id
      )!.roles.add(db.reactionRoles[`${emoji}-${reaction.message.id}`]).catch(console.error);
    }
    return reaction;
  },
} as IMessageReactionEvent;
