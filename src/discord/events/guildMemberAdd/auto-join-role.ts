import type {Role, GuildMember} from "discord.js";
import type {IGuildMemberAddRemoveEvent} from "../../../types/events";

module.exports = {
  priority: 50,
  async process(member): Promise<GuildMember> {
    if (!member.guild) return member;
    const db = Storage.getDatabase(member.guild.id);
    const roles = [...db.events?.guildMemberAdd.joinRoles as any];
    console.log(roles);
    for (const roleId of roles) {
      const role = Utilities.parseRoleId(
        member.guild, roleId
      ) as Role;
      if (!role) continue;
      await member.roles.add(role).catch(console.error);
    }

    return member;
  },
} as IGuildMemberAddRemoveEvent;
