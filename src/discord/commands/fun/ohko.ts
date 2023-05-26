import {Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

let ACCURACY = 30;

module.exports = {
  desc: "Uses a One-hit KO move.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  command(message) {
    const roll = CSRNG.random(100);
    console.log(roll);
    let m = "The attack missed!";
    if (
      Utilities.toId(message.content).includes("nith") ||
      Utilities.toId(message.content).includes("nitachi") ||
      message.content.includes("371436658878316555")
    ) {
      ACCURACY = 1;
    }
    if ((roll % 100) < ACCURACY) {
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
