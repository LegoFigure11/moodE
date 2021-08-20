import {Permissions, TextChannel, Message, MessageAttachment} from "discord.js";
import type {IEvent} from "../../../types/events";

const MAX_SIZE = 8388608;

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

          const attachments: MessageAttachment[] = [];
          let size = 0;
          let large = 0;
          for (const attachment of msg.attachments) {
            const s = attachment[1].size;
            console.log(s);
            if (size + s < MAX_SIZE) {
              size += s;
              attachments.push(new MessageAttachment(attachment[1].attachment));
            } else {
              large++;
            }
          }

          const attachmentText = attachments.length > 0 || large > 0 ? ` (with ${
            attachments.length + large
          } attachment(s)${
            large > 0 ? `, ${large} too big to attach` : ""})` : "";

          const cont = Utilities.clean(
            `Message from ${author} at ${date} in ${chan}${attachmentText}:\n >>> ${
              content.join("\n").length ? content.join("\n") : "(No content)"
            }`
          );

          message.channel.send({content: cont, files: attachments}).then(m => {
            m.edit(cont.replace(
              new RegExp(String.fromCharCode(8203), "g"), ""
            )).catch(console.error);
          }).catch(console.error);

          // TODO: Edit out all mentions and replace them with the @ text between ``

          return message;
        }).catch(console.error);
      }
    }
    return message;
  },
} as IEvent;
