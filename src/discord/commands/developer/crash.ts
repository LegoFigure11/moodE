import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Forcibly crash the bot.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: "d",
  usage: "<text>",
  command() {
    throw new Error("Crash Command was used");
  },
} as ICommand;
