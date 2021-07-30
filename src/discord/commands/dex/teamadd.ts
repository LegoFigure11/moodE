import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations, Species} from "@pkmn/data";

module.exports = {
  desc: "Updates the default generation",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["ta", "teamadd"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    const db = Storage.getDatabase("myTeam");
    // create myTeam if it doesnt exist
    if (!db.myTeam) {
      const temp: Species[] = [];
      db.myTeam = temp;
    }
    // if the team has 6 members, return fail
    if (db.myTeam[5]) {
      return message.channel.send(
        Utilities.failureEmoji(
          message,
          `Your team is full! Please delete a pokemon from your team with !teamdel`
        )
      ).catch(e => console.error(e));
    }


    // get the currentgen from database
    const dbGen = Storage.getDatabase("currentGen");
    if (!dbGen.currentGen) dbGen.currentGen = "8"; // If the database loses the variable, reset it to 8!
    Storage.exportDatabase("currentGen");
    // if no generation is given then default to currentGen var from database
    if (!args[1]) {
      args.push(dbGen.currentGen);
    }


    // Get the pokemon species stuff
    let [gen, newArgs, hadGenSpec] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    args[0] = getAlias(args[0]);
    let specie = Dex.species.get(args[0]);

    if (!specie?.exists) {
      const Gen7Dex = gens.get(7);
      specie = Gen7Dex.species.get(args[0]);
      if (specie?.exists && !hadGenSpec) {
        if (gen === 8) gen = 7;
      } else {
        return message.channel.send(
          Utilities.failureEmoji(
            message,
            `Unable to find any Pok\u{00e9}mon matching "${
              args[0]
            }" for Generation ${gen}! (Check your spelling?)`
          )
        ).catch(e => console.error(e));
      }
    }

    // Team database variable stuff
    if (specie?.exists) {
      for (let i = 0; i < 6; i++) {
        if (!db.myTeam[i]) {
          db.myTeam.push(specie);
          break;
        }
      }
    }

    Storage.exportDatabase("myTeam");

    message.channel.send(`Successfully added ${args[0]} to your team!`).catch(e => console.error(e));
    return message.channel.send(
      `New Team list:
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
  db.myTeam[5] ? `${db.myTeam[5].name}` : ""}
`, {code: "XL"}
    ).catch(e => console.error(e));
  },
} as ICommand;
