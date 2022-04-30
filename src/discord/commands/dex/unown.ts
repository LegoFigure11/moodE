import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

const alphabet = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
  "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "!", "?"
];

module.exports = {
  desc: "Translates an Unown form into its corresponding letter.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  usage: "<Unown Number>",
  async command(message, args) {
    let num = parseInt(args?.[0]);
    if (num && !isNaN(num)) {
      message.channel.send(alphabet[num % alphabet.length]);
    }
  },
} as ICommand;
