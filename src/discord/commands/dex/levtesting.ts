import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import type {TypeName} from "@pkmn/types";
import {getAlias} from "../../../misc/dex-aliases";
import {TypoChecker} from "./typoChecker";


module.exports = {
  desc: "Gets the weaknesses of a Pok\u{00e9}mon or type.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["lt"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    // this command serves no purpose other than testing so I'm not documenting it and I don't believe it includes anything that weaknesstesting does not.

    if (!args) {
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `No pokemon specified. Please try again with a pokemon specified.`
        )
      ).catch(e => console.error(e));
    }

    const db = Storage.getDatabase("currentGen");
    if (!db.currentGen) db.currentGen = "8"; // If the database loses the variable, reset it to 8
    Storage.exportDatabase("currentGen");

    if (!args[1]) {
      args.push(db.currentGen);
    }

    const [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);
    let types: TypeName[] = [];
    let monName;

    args[0] = getAlias(args[0]);

    const specie = Dex.species.get(args[0]);

    if (specie?.exists) {
      types = [...specie.types];
      monName = specie.name;
    } else if (gen === 8) {
      const Dex7 = gens.get(7);
      const specie7 = Dex7.species.get(args[0]);
      if (specie7?.exists) {
        types = [...specie7.types];
        monName = specie7.name;
      }
    }


    if (!specie?.exists) {
      let msgString = `No pokemon found with the name \'${args[0]}\'. Did you mean:`;

      const test = new TypoChecker(message, args);
      const temp = test.getSimilarMons();

      for (let i = 0; i < temp.length; i++) {
        console.log(temp[i]);
        msgString = `${msgString}${`\n${i + 1}` + `: `}${temp[i]}`;
      }

      let input; // helper variable used if a mon is not specified in command
      const filter = (msg: any) => msg.author.id === message.author.id; // creates a filter that will be used later when getting secondary input. This makes it so only the user that uses the command can give secondary input
      message.channel.send( // sends the list of pokemon so the user can choose which to nuke
        msgString, {code: "XL"}
      ).then(() => {
        message.channel.awaitMessages(filter, { // starts listening for secondary command, should be a number. If it's not a number the command fails and must be re-entered
          max: 1,
          time: 30000,
          errors: ["time"],
        })
          .then(msg => {
            input = Number(`${msg.first()}`); // converts the input into an integer
            if (input) { // if the input successfully converted to an integer
              console.log("Success"); // function that removes the pokemon at the specified input
            } else { // if the user did not input a number, command fails
              console.log("Failure");
              return 0;
            }

            input--;
            const specie = Dex.species.get(temp[input]);

            if (specie?.exists) {
              types = [...specie.types];
              monName = specie.name;
            } else if (gen === 8) {
              const Dex7 = gens.get(7);
              const specie7 = Dex7.species.get(args[0]);
              if (specie7?.exists) {
                types = [...specie7.types];
                monName = specie7.name;
              }
            }

            message.channel.send(`The pokemon's name is ${specie!.name}`);
            return 0;
          })
          .catch(collected => {
            console.log(collected);
            message.channel.send("Timeout");
            return 0;
          });
      });


      /* let input: any;
      let filter = (msg: any) => msg.author.id === message.author.id // creates a filter that will be used later when getting secondary input. This makes it so only the user that uses the command can give secondary input
      message.channel.send( // sends the list of pokemon so the user can choose which to nuke
        `hello`, {code: "XL"}
      ).then(() => {
        message.channel.awaitMessages(filter, { //starts listening for secondary command, should be a number. If it's not a number the command fails and must be re-entered
          max: 1,
          time:30000,
          errors: ['time']
        })
      })
        .then(m  => {
          input = Number(`${m.first()}`);
            if(input) {
              console.log("success");
            } else {
              console.log("Failure");
            }
          }).catch((collected:any) => {
            console.log(collected);
              message.channel.send('Timeout');
              console.log(collected);
          });*/
    } else {
      return message.channel.send(`Specie exists`);
    }
  },
} as ICommand;
