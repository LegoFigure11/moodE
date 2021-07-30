import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Updates the default generation",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["u", "update", "changegen"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    const db = Storage.getDatabase("currentGen");
    if (!db.currentGen) db.currentGen = 8; // If the database loses the variable, reset it to 8!

    if (args[0]) {
      db.currentGen = args[0];
    } else {
      return message.channel.send(
        Utilities.failureEmoji(
          message, `No argument specified. Please include which generation you'd like to update to.`
        )
      ).catch(e => console.error(e));
    }


    Storage.exportDatabase("currentGen");

    return message.channel.send(`Successfully updated the default generation to${args[0]}!`).catch(e => console.error(e));
  },
} as ICommand;
