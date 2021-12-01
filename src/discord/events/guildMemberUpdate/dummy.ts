import type {IGuildMemberUpdateEvent} from "../../../types/events";

module.exports = {
  priority: 99,
  async process(oldMember, newMember) {
    await oldMember.fetch();
    return newMember;
  },
} as IGuildMemberUpdateEvent;
