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
  aliases: ["weak"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    const db = Storage.getDatabase("currentGen");
    if (!db.currentGen) db.currentGen = "8"; // If the database loses the variable, reset it to 8
    Storage.exportDatabase("currentGen");

    if (!args[1]) {
      args.push(db.currentGen);
    } // all this stuff is ignorable. It's just defaulting the generation to the gen I'm playing

    const [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);
    let types: TypeName[] = [];
    let monName: any;

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

    const bs = specie?.baseStats;
    const defString = `HP: ${bs?.hp} / Def: ${bs?.def} / SpD: ${bs?.spd}`; // these 2 lines of code are ones I added because I wanted defense stats on \weak

    if (!types.length) {
      let index = 0;
      for (const arg of args) {
        if (Dex.types.get(arg)?.name) {
          types[index] = Dex.types.get(arg)!.name;
          index++;
          if (index >= 2) break;
        }
      }
    }

    if (!specie?.exists) { // if it could not find a specie even after the gen7 check this executes
      let msgString = `No pokemon found with the name \'${args[0]}\'. Did you mean:`; // This begins the string that will be sent as a message when it asks the user for input

      const typoChecker = new TypoChecker(message, args); // creates a TypoChecker variable from the TypoChecker class
      const possibleMons = typoChecker.getSimilarMons(); // getSimilarMons returns an array of all pokemon with similar-ish names to the argument. getSimilarMons is where levenshtein algorithm is implemented

      for (let i = 0; i < possibleMons.length; i++) { // iterates through all the possible mons
        console.log(possibleMons[i]);
        msgString = `${msgString}${`\n${i + 1}` + `: `}${possibleMons[i]}`; // adds mons to the message string that will be used when asking the user for input. It adds i + 1 because arrays start at 0
      }

      let input; // the variable where user input will be stored
      const filter = (msg: any) => msg.author.id === message.author.id; // creates a filter that will be used later when getting secondary input. This makes it so only the user that uses the command can give secondary input
      message.channel.send( // sends the list of all pokemon mons and asks user to input a number.
        msgString, {code: "XL"}
      ).then(() => {
        message.channel.awaitMessages(filter, { // starts listening for secondary command, should be a number. If it's not a number the command fails and must be re-entered
          max: 1,
          time: 30000,
          errors: ["time"],
        })
          .then(msg => {
            input = Number(`${msg.first()}`); // converts the input into an integer
            if (input) { // this is not efficient code but I'm too lazy to change it. You could just if (!input) return 0;
              console.log("Success"); // function that removes the pokemon at the specified input
            } else { // if the user did not input a number, command fails
              console.log("Failure");
              return 0;
            }
            input--; // decrement input to match the input up with the array properly

            const specie = Dex.species.get(possibleMons[input]); // gets a new specie based on what the user inputted

            if (specie?.exists) { // basically copy and paste all the code that would have been used if a proper pokemon name was inputted at the start of the command. There is probably a better way to do this but I am smooth brain
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

            const bs = specie?.baseStats; // this is code I added myself because I wanted defense stats included. Feel free to ignore them
            const defString = `HP: ${bs?.hp} / Def: ${bs?.def} / SpD: ${bs?.spd}`;

            if (!types.length) {
              let index = 0;
              for (const arg of args) {
                if (Dex.types.get(arg)?.name) {
                  types[index] = Dex.types.get(arg)!.name;
                  index++;
                  if (index >= 2) break;
                }
              }
            }

            const effectiveness: {[k: string]: string[]} = {
              0: [],
              0.25: [],
              0.5: [],
              1: [],
              2: [],
              4: [],
            };

            for (const t of Dex.types) {
              const eff = Dex.types.totalEffectiveness(t.name, types);
              effectiveness[eff].push(t.name);
            }
            message.channel.send( // for some reason returning a message was crashing toothE so I just send the message then return 0 to exit the code.
              `${hadGenSpec ? `[Gen ${gen}] ` : ""}Weaknesses for: ${
                monName ? `${monName} ` : ""
              }[${types.join("/")}]
Stats: ${defString}
0.00x: ${
  effectiveness[0].length ? effectiveness[0].join(", ") : "(None)"}
0.25x: ${
  effectiveness[0.25].length ? effectiveness[0.25].join(", ") : "(None)"
}
0.50x: ${
  effectiveness[0.5].length ? effectiveness[0.5].join(", ") : "(None)"
}
1.00x: ${
  effectiveness[1].length ? effectiveness[1].join(", ") : "(None)"
}
2.00x: ${
  effectiveness[2].length ? effectiveness[2].join(", ") : "(None)"
}
4.00x: ${
  effectiveness[4].length ? effectiveness[4].join(", ") : "(None)"
}`, {code: "XL"}
            ).catch(e => console.error(e));
            return 0; // exits the code
          })
          .catch(collected => { // if an input is not sent within 30 seconds, await times out.
            console.log(collected);
            message.channel.send("Timeout");
            return 0;
          });
      });
    } else { // This code executes if a pokemon was inputted correctly at the original call of the command. This was the code that existed before I started messing w/ typo correction
      const effectiveness: {[k: string]: string[]} = {
        0: [],
        0.25: [],
        0.5: [],
        1: [],
        2: [],
        4: [],
      };

      for (const t of Dex.types) {
        const eff = Dex.types.totalEffectiveness(t.name, types);
        effectiveness[eff].push(t.name);
      }


      return message.channel.send(
        `${hadGenSpec ? `[Gen ${gen}] ` : ""}Weaknesses for: ${
          monName ? `${monName} ` : ""
        }[${types.join("/")}]
Stats: ${defString}
0.00x: ${
  effectiveness[0].length ? effectiveness[0].join(", ") : "(None)"}
0.25x: ${
  effectiveness[0.25].length ? effectiveness[0.25].join(", ") : "(None)"
}
0.50x: ${
  effectiveness[0.5].length ? effectiveness[0.5].join(", ") : "(None)"
}
1.00x: ${
  effectiveness[1].length ? effectiveness[1].join(", ") : "(None)"
}
2.00x: ${
  effectiveness[2].length ? effectiveness[2].join(", ") : "(None)"
}
4.00x: ${
  effectiveness[4].length ? effectiveness[4].join(", ") : "(None)"
}`, {code: "XL"}
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
