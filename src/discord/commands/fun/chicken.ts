import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

const chickens = [
  "\u{1F414}", // :chicken:
  "\u{1F424}", // :baby_chick:
  "\u{1F423}", // :hatching_chick:
  "\u{1F425}", // :hatched_chick:
  "\u{1F413}", // :rooster:
  "\u{1F357}", // :poultry_leg:
  "\u{1F95A}", // :egg:
  "\u{1F373}", // :cooking:
];

module.exports = {
  desc: "Cluck cluck. Cluck cluck?",
  commandPermissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
  command(message) {
    const nick = message.member!.nickname || message.author.username;
    const chook = Utilities.sampleOne(chickens);
    message.member!.setNickname(nick + chook).catch(console.error);
    return message.reply(
      {
        content: `Did somebody say... CHICKEN!?!? ${chook}`,
        allowedMentions: {repliedUser: false},
      }
    ).catch(console.error);
  },
} as ICommand;
