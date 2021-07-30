import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Updates the default generation",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["tc", "teamclear"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message) {
    const db = Storage.getDatabase("myTeam");

    delete db.myTeam;

    Storage.exportDatabase("myTeam");

    return message.channel.send(
      `Team successfully cleared`
    ).catch(e => console.error(e));
  },
} as ICommand;
