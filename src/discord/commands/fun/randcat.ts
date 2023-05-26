import {MessageEmbed, Permissions} from "discord.js";

import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets a random cat picture from http://random.cat",
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.EMBED_LINKS,
  ],
  aliases: ["cat", "randomcat", "kitty"],
  command(message) {
    Utilities.fetchURL("https://aws.random.cat/meow").then(data => {
      const url = JSON.parse(data as string)["file"];
      const embed = new MessageEmbed()
        .setImage(url)
        .setFooter(url);
      message.reply({embeds: [embed], allowedMentions: {repliedUser: false}}).catch(console.error);
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
