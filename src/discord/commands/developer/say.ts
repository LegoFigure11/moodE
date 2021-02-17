import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

const compliments = [
  "You're doing a great job, and your hair looks amazing!",
  "If you were a vegetable, you'd be a sweet potato n_n",
];

module.exports = {
  desc: "Makes the bot send a message",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissions: "d",
  usage: "<text>",
  aliases: ["send"],
  command(message, args) {
    if (!args?.[0].length) {
      args = [];
      args[0] = Utilities.sampleOne(compliments);
    }

    if (message.channel.type !== "dm") message.delete().catch(e => console.error(e));
    message.channel.send(args.join(", ")).catch(e => console.error(e));
  },
} as ICommand;
