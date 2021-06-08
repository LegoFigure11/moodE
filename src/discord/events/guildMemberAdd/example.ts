import type {GuildMember} from "discord.js";
import type {IGuildMemberAddEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(member): Promise<GuildMember> {
    console.log(member.user);
    await member.deleteDM();
    return member;
  },
} as IGuildMemberAddEvent;
