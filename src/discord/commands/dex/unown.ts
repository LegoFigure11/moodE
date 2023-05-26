import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

const alphabet = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
  "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "!", "?",
];

module.exports = {
  desc: "Translates an Unown form into its corresponding letter.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  usage: "<Unown Number>",
  command(message, args) {
    const num = parseInt(args?.[0]);
    if (num && !isNaN(num)) {
      return message.reply(
        {
          content:
            alphabet[num % alphabet.length],
          allowedMentions: {repliedUser: false},
        }
      );
    }
  },
} as ICommand;
