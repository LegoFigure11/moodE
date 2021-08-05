import type {TextChannel, GuildMember} from "discord.js";
import type {IGuildMemberAddRemoveEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(member): Promise<GuildMember> {
    if (!member.guild) return member;
    const db = Storage.getDatabase(member.guild.id);
    const log = db.events?.logger.logLeaves;
    const channel = Utilities.parseChannelId(
      member.guild, db.events?.logger?.channel
    ) as TextChannel;
    if (!log || !channel) return member;
    if (!channel) return member;

    await channel.send(
      `${member} (${member.user.username}#${member.user.discriminator} - ${member.id}) has left ` +
      `the server.`
    ).catch(console.error);

    return member;
  },
} as IGuildMemberAddRemoveEvent;
