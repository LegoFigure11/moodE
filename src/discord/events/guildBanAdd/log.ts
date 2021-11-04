import {Permissions, TextChannel, GuildBan} from "discord.js";
import type {IGuildBanEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(ban): Promise<GuildBan> {
    if (!ban.guild) return ban;
    const db = Storage.getDatabase(ban.guild.id);
    const log = db.events?.guildBanAdd?.logBans;
    const channel = Utilities.parseChannelId(
      ban.guild, db.events?.guildBanAdd?.channel
    ) as TextChannel;
    if (!log || !channel) return ban;

    let by;
    if (Utilities.checkBotPermissionsFromGuild(
      ban.guild, Permissions.FLAGS.VIEW_AUDIT_LOG, channel
    )) {
      const entry = await ban.guild.fetchAuditLogs(
        {type: "MEMBER_BAN_ADD"}
      ).then(audit => audit.entries.first());
      if (entry && entry.createdTimestamp > (Date.now() - 5000)) by = entry.executor;
    }


    channel.send(
      Utilities.warningEmoji(
        channel,
        `${ban.user} (${ban.user.username}#${ban.user.discriminator} - ${ban.user.id}) was ` +
        `banned from the server${by ? ` by ${by}` : ""} (Reason: ${ban.reason || "None provided"}).`
      )
    ).catch(console.error);

    return ban;
  },
} as IGuildBanEvent;
