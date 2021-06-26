import {Permissions, MessageEmbed} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Gets a random dog picture from http://random.dog",
  commandPermissions: [
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.EMBED_LINKS,
  ],
  aliases: ["dog", "randomdog", "puppy"],
  command(message) {
    Utilities.fetchURL("https://random.dog/woof.json?filter=mp4,webm").then(data => {
      const url = JSON.parse(data as string)["url"];
      const embed = new MessageEmbed()
        .setImage(url)
        .setFooter(url);
      message.channel.send({embed: embed}).catch(e => console.error(e));
    }).catch(e => {
      console.error(e);
      message.channel.send(
        Utilities.failureEmoji(
          message,
          "Oops! Looks like something went wrong. Try again later!"
        )
      ).catch(err => console.error(err));
    });
  },
} as ICommand;