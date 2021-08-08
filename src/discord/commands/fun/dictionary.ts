import {Permissions, MessageEmbed} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets a definition from https://dictionaryapi.dev/",
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.EMBED_LINKS,
  ],
  aliases: ["define", "definition"],
  usage: "<word>",
  command(message, args) {
    if (!args[0]) return message.channel.send(this.usage as string).catch(console.error);
    const word = encodeURIComponent(args[0].toLowerCase());
    Utilities.fetchURL(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`).then(data => {
      const response = JSON.parse(data as string)[0];
      if (!response?.word) {
        return message.channel.send(
          "No definition found... :("
        ).catch(console.error);
      }
      const definitions = [];
      const titleCaseWord = Utilities.toTitleCase(response.word);
      for (const d of Object.keys(response.meanings)) {
        for (const entry of response.meanings[d].definitions) {
          definitions.push(
            `${titleCaseWord} (${response.meanings[d].partOfSpeech}): ${entry.definition}\n`
          );
        }
      }
      const embed = new MessageEmbed()
        .setTitle(titleCaseWord)
        .setDescription(
          definitions.join("\n")
        );
      message.reply(
        {embeds: [embed], allowedMentions: {repliedUser: false}}
      ).catch(e => console.error(e));
    }).catch(e => {
      console.error(e);
      message.reply(
        {
          content: Utilities.failureEmoji(
            message,
            "Oops! Looks like something went wrong. Try again later!"
          ),
          allowedMentions: {repliedUser: false},
        }
      ).catch(err => console.error(err));
    });
  },
} as ICommand;
