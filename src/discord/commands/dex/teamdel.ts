import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";

module.exports = {
  desc: "Updates the default generation",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["td", "teamdel"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    const db = Storage.getDatabase("myTeam"); // open the myTeam database

    if (!db.myTeam || !db.myTeam[0]) { // if myTeam doesn't exist or there isn't a mon in your team, command fails
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `No pokemon found on team, please add some with !teamadd`
        )
      ).catch(e => console.error(e));
    }

    const nukeString = `Write a number to nuke a team member:
1: ${
  db.myTeam[0] ? `${db.myTeam[0].name}` : ""}
2: ${
  db.myTeam[1] ? `${db.myTeam[1].name}` : ""}
3: ${
  db.myTeam[2] ? `${db.myTeam[2].name}` : ""}
4: ${
  db.myTeam[3] ? `${db.myTeam[3].name}` : ""}
5: ${
  db.myTeam[4] ? `${db.myTeam[4].name}` : ""}
6: ${
  db.myTeam[5] ? `${db.myTeam[5].name}` : ""}`; // nukeString assignment


    if (args[0]) { // if the user specified a pokemon in the command
      for (let i = 0; i < 6; i++) { // for loop to run through the whole team
        if (db.myTeam[i] && db.myTeam[i].name.toUpperCase() == args[0].toUpperCase()) { // checks if there is a mon in slot i and checks if the name of the mon in slot i matches the argument
          db.myTeam.splice(i, 1); // deletes the specific element
          sendMsg(db.myTeam, message); // helper function to keep code clean. Just sends the list of mons in the team
          return 0; // return 0 to exit the code.
        }
        if (i === 5) { // if it goes through the whole list and doesn't find a mon then it fails.
          return message.channel.send(
            Utilities.failureEmoji(
              message,
              `${args[0]} could not be found on your team. Please check your spelling and try again.`
            )
          ).catch(e => console.error(e));
        }
      }
    } else { // if a mon wasn't specified in the command
      let input; // helper variable used if a mon is not specified in command
      const filter = (msg: any) => msg.author.id === message.author.id; // creates a filter that will be used later when getting secondary input. This makes it so only the user that uses the command can give secondary input
      message.channel.send( // sends the list of pokemon so the user can choose which to nuke
        nukeString, {code: "XL"}
      ).then(() => {
        message.channel.awaitMessages(filter, { // starts listening for secondary command, should be a number. If it's not a number the command fails and must be re-entered
          max: 1,
          time: 30000,
          errors: ["time"],
        })
          .then(msg => {
            input = Number(`${msg.first()}`); // converts the input into an integer
            if (input) { // if the input successfully converted to an integer
              db.myTeam = nukeMon(db.myTeam, input); // function that removes the pokemon at the specified input
              sendMsg(db.myTeam, message); // sends the message of the team list now that a pokemon has been removed
              return 0; // return 0 to exit code.
            } else { // if the user did not input a number, command fails
              message.channel.send("Failed, try again with !td");
              return 0;
            }
          })
          .catch(collected => {
            console.log(collected);
            message.channel.send("Timeout");
          });
      });
    }
    Storage.exportDatabase("myTeam"); // export the myTeam array back into the database for saving
  },
} as ICommand;

function nukeMon(array: any, num: any) {
  num--;
  array.splice(num, 1);
  return array;
}

function sendMsg(array: any, message: any) {
  message.channel.send(
    `New Team list:
1: ${
  array[0] ? `${array[0].name}` : ""}
2: ${
  array[1] ? `${array[1].name}` : ""}
3: ${
  array[2] ? `${array[2].name}` : ""}
4: ${
  array[3] ? `${array[3].name}` : ""}
5: ${
  array[4] ? `${array[4].name}` : ""}
6: ${
  array[5] ? `${array[5].name}` : ""}`, {code: "XL"}
  ).catch((e: any) => console.error(e));
}
