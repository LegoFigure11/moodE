import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

const ACCURACY = 30;

module.exports = {
  desc: "Uses a One-hit KO move.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  command(message) {
    RNG.advance(2);
    const roll = RNG.next16bit();
    let m = "The attack missed!";
    if (roll % 100 < ACCURACY) {
      m = "It's a one-hit KO!";
    }
    return message.reply(
      {
        content: m,
        allowedMentions: {repliedUser: false},
      }
    );
  },
} as ICommand;
