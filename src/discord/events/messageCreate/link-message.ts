import {Permissions, TextChannel, Message} from "discord.js";
import type {IEvent} from "../../../types/events";

module.exports = {
  priority: 1,
  async process(message: Message): Promise<Message> {
    if (message.author.bot) return message;
    if (!Utilities.checkBotPermissions(message, Permissions.FLAGS.SEND_MESSAGES)) return message;
    const regex = /https:\/\/discord(|app)\.com\/channels\/[0-9]*\/[0-9]*\/[0-9]*/g;
    const matches: string[] = [...new Set(message.content.match(regex))]; // Remove duplicates
    for (const match of matches) {
      const parts = match.split("/");
      /*
        [0] "https:",
        [1] "",
        [2] "discordapp.com",
        [3] "channels",
        [4] "guild id",
        [5] "channel id",
        [6] "message id"
      */
      const channel = message.client.channels.cache.get(parts[5]);
      if (channel?.isText) {
        await (channel as TextChannel).messages.fetch(parts[6]).then(msg => {
          const author = msg.author.toString();
          const chan = msg.channel.toString();
          const date = Utilities.date(msg.createdTimestamp);

          const content: string[] = [];
          for (let line of msg.content.split("\n")) {
            if (line.startsWith(">>> ")) line = line.replace(">>> ", "");
            if (line.startsWith("> ")) line = line.replace("> ", "");
            content.push(line);
          }

          const cont = Utilities.clean(
            `Message from ${author} at ${date} in ${chan}:\n>>> ${content.join("\n")}`
          );

          message.channel.send(cont).then(m => {
            m.edit(cont.replace(
              new RegExp(String.fromCharCode(8203), "g"), ""
            )).catch(console.error);
          }).catch(console.error);

          return message;
        }).catch(console.error);
      }
    }
    return message;
  },
} as IEvent;
