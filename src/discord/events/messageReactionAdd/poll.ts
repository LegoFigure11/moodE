import type {MessageReaction, User} from "discord.js";
import type {IMessageReactionEvent} from "../../../types/events";

module.exports = {
  async process(reaction: MessageReaction, user: User) {
    if (!reaction?.message?.guild?.id) return reaction;

    if (user.bot) return reaction;

    const db = Storage.getDatabase(reaction.message.guild.id);

    if (!db.polls) return reaction;

    if (!db.polls[reaction.message.id]) return reaction;

    if (reaction.emoji.name === getEmote(1) || reaction.emoji.name === getEmote(2) || reaction.emoji.name === getEmote(3) || reaction.emoji.name === getEmote(4) || reaction.emoji.name === getEmote(5) || reaction.emoji.name === getEmote(6) || reaction.emoji.name === getEmote(7) || reaction.emoji.name === getEmote(8) || reaction.emoji.name === getEmote(9)) {
      reaction.users.remove(user); // Remove reactions only if it is one of the vote reactions

      if (db.polls[reaction.message.id].users.includes(user.id)) return reaction; // If the user has voted before disallow vote

      db.polls[reaction.message.id].users.push(user.id); // Push the user into the db to stop multiple votes
      addVote(db, getNum(reaction.emoji.name), reaction); // add user's vote to the database array
    }

    const m = await reaction.message.channel.messages.fetch(db.polls[reaction.message.id].resultID); // Fetch the Poll Results message from the database
    let resultsString = "Poll Results: \n"; // Intiliaze the string for editing the results message
    const str = m.content.substring(m.content.search(":") + 1); // Create a string that begins after "Poll Results:" to ignore the first colon
    const arr = parseMessage(str); // Create an array of all the character positions of ":"s for formatting the poll results message
    for (let i = 0; i < arr.length; i++) { // For every instace of a colon, add a line of poll results
      resultsString = `${resultsString + getEmote(i + 1)}: ${db.polls[reaction.message.id].votes[i]}\n`;
    }
    m.edit(resultsString, {code: "XL"});


    Storage.exportDatabase(reaction.message.guild.id);
    return reaction;
  },
};

function addVote(db: any, num: any, reaction: any) { // Add votes into the database array -- num: user's vote number; db: database; reaction: reaction passed into the event
  db.polls[reaction.message.id].votes[num - 1]++; // Increment the vote count at the inputted number
  // num-1 because the vote numbers start at one while array starts at 0
}

function getEmote(num: any) { // Retrieve number emote from inputted number character
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
}

function getNum(emoji: any) { // Retrieve character number from inputted emote number
  switch (emoji) {
  case "1️⃣":
    return 1;
  case "2️⃣":
    return 2;
  case "3️⃣":
    return 3;
  case "4️⃣":
    return;
  case "5️⃣":
    return 5;
  case "6️⃣":
    return 6;
  case "7️⃣":
    return 7;
  case "8️⃣":
    return;
  case "9️⃣":
    return 9;
  }
}

function parseMessage(str: any) { // Retrieve indexes of all instances of ":" in inputted string
  const returnArr: number[] = [];
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === ":") {
      returnArr.push(i + 2); // Add 2 for formatting
    }
  }
  return returnArr;
}
