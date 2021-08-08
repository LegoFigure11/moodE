import {Permissions, MessageEmbed} from "discord.js";
import {UserPermissions} from "../../enums/userPermissions";
import type {ICommand} from "../../../types/commands";

const MAX_EMOJIS_TO_DISPLAY = 18;

module.exports = {
  desc: "Prints information about a server.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS],
  userPermissons: UserPermissions.ELEVATED,
  aliases: ["guild"],
  usage: "<guild id (optional)>",
  noPm: true,
  async command(message, args) {
    let guild = message.guild;
    let msg = "";
    if (args?.[0]) {
      try {
        guild = await message.client.guilds.fetch(args[0]);
      } catch (e) {
        msg = `Could not find any guild with ID \`${
          args[0]
        }\`! Here's the info for the guild you're currently in, instead.`;
      }
    }
    if (!guild || !guild.available) {
      return message.channel.send(
        Utilities.failureEmoji(message, "Unable to fetch any information about this server!")
      );
    }

    const iconURL = guild.icon?.startsWith("a_")
      ? guild.iconURL({dynamic: true})
      : (guild.iconURL() || "https://cdn.discordapp.com/embed/avatars/0.png");

    const guildInfoEmbed = new MessageEmbed()
      .setColor(guild.me!.displayColor)
      .setAuthor(guild.name, iconURL!)
      .setThumbnail(iconURL!)
      .addFields(
        {
          name: "ID",
          value: guild.id,
          inline: true,
        },
        {
          name: "Members",
          value: `${guild.memberCount}${guild.maximumMembers
            ? ` / ${guild.maximumMembers} (${
              (guild.memberCount / guild.maximumMembers * 100).toFixed(2)
            }% capacity)`
            : ""}`,
          inline: true,
        },
        Utilities.blankEmbedField(true),
        {
          name: "Created",
          value: `${Utilities.UTCtimeStamp(
            guild.createdAt
          )} (${
            Utilities.timeSince(guild.createdAt)
          })`,
          inline: true,
        },
        Utilities.blankEmbedField(true),
        {
          name: "Owner",
          value: `<@${guild.ownerId}> (${guild.ownerId})`,
          inline: true,
        },
        Utilities.blankEmbedField(true),
        {
          name: guild.emojis.cache.size <= MAX_EMOJIS_TO_DISPLAY
            ? `Emojis (${guild.emojis.cache.size})`
            : `Sample Emojis (+${guild.emojis.cache.size - MAX_EMOJIS_TO_DISPLAY} more not shown)`,
          value: guild.emojis.cache.size <= MAX_EMOJIS_TO_DISPLAY
            ? guild.emojis.cache.map(emoji => `<:${emoji.identifier}>`).join(" ") || "(None)"
            : Utilities.sampleMany(guild.emojis.cache.map(emoji =>
              `<:${emoji.identifier}>`.replace(":a:", "a:")), MAX_EMOJIS_TO_DISPLAY).join(" "),
          inline: false,
        },
      );

    message.channel.send({content: msg, embeds: [guildInfoEmbed]}).catch(e => console.error(e));
  },
} as ICommand;
