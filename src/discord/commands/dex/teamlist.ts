import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Updates the default generation",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["tl", "teamlist"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message) {
    const db = Storage.getDatabase("myTeam");

    if (!db.myTeam) {
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `No pokemon found on team, please add some with !teamadd`
        )
      ).catch(e => console.error(e));
    }

    return message.channel.send(
      `Team list:
1: ${
  db.myTeam[0] ? `${db.myTeam[0].name}` : ""}
2: ${
  db.myTeam[1] ? `${db.myTeam[1].name}` : ""}
3: ${
  db.myTeam[2] ? `${db.myTeam[2].name}` : ""}
4: ${
  db.myTeam[3] ? `${db.myTeam[3].name}` : ""}
5: ${
  db.myTeam[4] ? `${db.myTeam[4].name}` : ""}
6: ${
  db.myTeam[5] ? `${db.myTeam[5].name}` : ""}
`, {code: "XL"}
    ).catch(e => console.error(e));
  },
} as ICommand;
