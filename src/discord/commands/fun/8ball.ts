import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

const phrases = [
  "As I see it, yes.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "It is certain.",
  "It is decidedly so.",
  "Most likely.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Outlook good.",
  "Reply hazy, try again.",
  "Signs point to yes.",
  "Very doubtful.",
  "Without a doubt.",
  "Yes.",
  "Yes – definitely.",
  "You may rely on it.",
];

module.exports = {
  desc: "Asks the magic 8 ball a question.",
  usage: "<question or statement>",
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
  ],
  command(message) {
    return message.channel.send(`:8ball: ${Utilities.sampleOne(phrases)}`);
  },
} as ICommand;
