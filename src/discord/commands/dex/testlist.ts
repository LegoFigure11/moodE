import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";


module.exports = {
  desc: "Updates the default generation",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["testlist", "ts"],
  usage: "<Pok\u{00e9}mon or Type>, <Type (optional)>," +
    "<Generation (optional)>, <\"inverse\" (optional)>",
  async command(message, args) {
    const db = Storage.getDatabase("monMegaList");
    let matches;
    const passes: string[] = [];
    if (!args[0]) {
      return message.channel.send(`Please include an argument!`);
    } else {
      for (let i = 0; i < db.monMegaList.length; i++) {
        matches = 0;
        for (let u = 0; u < db.monMegaList[i].length; u++) {
          if (args[0].charAt(u)) {
            if (args[0].charAt(u).toUpperCase() == db.monMegaList[i][u].toUpperCase()) { // PLEASE WORK!
              matches++;
            }
          }
          /* for(let z = 0; z < args[0].length; z++) {
            if(args[0].charAt(z).toUpperCase() == db.monMegaList[i][u].toUpperCase()) {
              matches++;
            }
          }*/
        }
        // console.log(args[0] + ` matches ${db.monMegaList[i]} ` + matches + ` times.`);
        if (matches >= db.monMegaList[i].length * 0.5) {
          passes.push(db.monMegaList[i]);
        }
      }
    }

    for (let i = 0; i < passes.length; i++) {
      if (passes[i]) {
        console.log(passes[i]);
      }
    }

    Storage.exportDatabase("monMegaList");

    return message.channel.send(
      `Successfully created string`
    ).catch(e => console.error(e));
  },
} as ICommand;


/*      for(let i = 0; i < db.monMegaList.length; i++) {
        matches = 0;
        for(let u = 0; u < db.monMegaList[i].length; u++) {
          for(let z = 0; z < args[0].length; z++) {
            if(args[0].charAt(z).toUpperCase() == db.monMegaList[i][u].toUpperCase()) {
              matches++;
            }
          }
        }
        //console.log(args[0] + ` matches ${db.monMegaList[i]} ` + matches + ` times.`);
        if(matches >= db.monMegaList[i].length * .7) {
          passes.push(db.monMegaList[i]);
        }
      }
    }*/
