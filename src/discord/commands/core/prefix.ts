import {Permissions} from "discord.js";
import {UserPermissions} from "../../enums/userPermissions";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Sets the bot prefix.",
  longDesc: "Changes the character that the bot uses to recognise commands in this server.\n" +
    "It's recommended to keep this at one or two ch" +
    "aracters (e.g. `!` or `m!`) though more will work.\n" +
    "Leading/Trailing spaces are ignored.\n" +
    "e.g. `prefix !` would make the bot only accept messages that start with `!` as commands.\n" +
    "e.g. `prefix pwetty pwease uwu` would make the bot only accept" +
    "messages that start with `pwetty pwease uwu` as commands.",

  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: UserPermissions.MANAGER,
  usage: "<character or string (optional)>",
  async command(message, args) {
    const id = Utilities.toDatabaseId(message);
    const db = Storage.getDatabase(id);
    if (args?.[0]) {
      db.prefix = args[0];
      Storage.exportDatabase(id!);
      try {
        return await message.channel.send(
          Utilities.successEmoji(
            message,
            `Updated command prefix to \`${args[0]}\``
          )
        );
      } catch (e) {
        return console.error(e);
      }
    } else {
      try {
        return await message.channel.send(
          `Current prefix: \`${db?.prefix || DiscordConfig.prefix || message.client.user}\``
        );
      } catch (e_1) {
        return console.log(e_1);
      }
    }
  },
} as ICommand;
