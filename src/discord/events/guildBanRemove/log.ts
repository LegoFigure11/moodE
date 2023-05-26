import {GuildBan, Permissions, TextChannel} from "discord.js";

import type {IGuildBanEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(ban): Promise<GuildBan> {
    if (!ban.guild) return ban;
    const db = Databases.getDatabase(ban.guild.id);
    const log = db.events?.guildBanRemove?.logUnbans;
    const channel = Utilities.parseChannelId(
      ban.guild, db.events?.guildBanRemove?.channel
    ) as TextChannel;
    if (!log || !channel) return ban;

    let by;
    if (Utilities.checkBotPermissionsFromGuild(
      ban.guild, Permissions.FLAGS.VIEW_AUDIT_LOG, channel
    )) {
      const entry = await ban.guild.fetchAuditLogs(
        {type: "MEMBER_BAN_REMOVE"}
      ).then(audit => audit.entries.first());
      if (entry && entry.createdTimestamp > (Date.now() - 5000)) by = entry.executor;
    }

    channel.send(
      Utilities.warningEmoji(
        channel,
        `${ban.user} (${ban.user.username}#${ban.user.discriminator} - ${ban.user.id}) was ` +
        `unbanned from the server${by ? ` by ${by}` : ""}.`
      )
    ).catch(console.error);

    return ban;
  },
} as IGuildBanEvent;
