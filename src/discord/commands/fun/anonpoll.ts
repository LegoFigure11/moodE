import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
const {MessageEmbed} = require("discord.js");


module.exports = {
  desc: "Start a poll",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["poll", "strawpoll", "sp"],
  usage: "!poll <title>, <option1>, <option2>, ... ,<option9",
  async command(message, args) {
    const db = Storage.getDatabase(message.guild!.id);
    if (!args[2]) {
      return message.channel.send("Could not detect a title and at least 2 poll options -- usage: !poll <title>, <option1>, <option2>, ... ,<option9");
    } else if (args[10]) {
      return message.channel.send("Too many options! You can only have 2-9 options on the poll");
    }

    let descriptionString = ""; // Initialize string to hold all the options of the poll
    let resultsString = "Poll Results: " + "\n"; // Initialize poll results string
    for (var i = 1; i < args.length; i++) { // Add all the poll options to the descriptionString. Start at 1 because args[0] holds the poll title
      if (args[i]) {
        descriptionString = `${descriptionString + getEmote(i)}: ${args[i][0].toUpperCase()}${args[i].substring(1, args[i].length)}\n\n`;// Add the Numbered emote and capitalize the first letter of the option
        resultsString = `${resultsString + getEmote(i)}: 0` + `\n`; // Every vote count starts at 0
      }
    }

    const embed = new MessageEmbed();
    embed.setAuthor(`Poll called by: ${message.author.username}`);
    embed.setTitle(`Poll Question: ${args[0][0].toUpperCase()}${args[0].substring(1, args[0].length)}`); // Capitalize the first letter of the Poll title
    embed.setDescription(descriptionString);


    const m = await message.reply({embed}); // store poll message object to push to database
    for (var i = 1; i < args.length; i++) {
      m.react(getEmote(i)); // Add emote number reactions based on number of poll options
    }
    const resultsMsg = await message.channel.send(resultsString, {code: "XL"}); // Store results message object to push to database
    if (!db.polls) db.polls = {};
    db.polls[m.id] = { // Initialize object to store in database
      "votes": {},
      "users": [],
      "resultID": resultsMsg.id,
    };
    for (var i = 0; i < args.length - 1; i++) {
      db.polls[m.id].votes[i] = 0; // Initialize all vote counts to 0
    }

    Storage.exportDatabase(message.guild!.id);
  },
} as ICommand;

function getEmote(num: any) { // Retrieve numbered emote from inputted number character
  switch (num) {
  case 1:
    return "1️⃣";
  case 2:
    return "2️⃣";
  case 3:
    return "3️⃣";
  case 4:
    return "4️⃣";
  case 5:
    return "5️⃣";
  case 6:
    return "6️⃣";
  case 7:
    return "7️⃣";
  case 8:
    return "8️⃣";
  case 9:
    return "9️⃣";
  }
  return "❌";
}
