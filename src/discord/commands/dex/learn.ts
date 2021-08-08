import {Permissions, Util} from "discord.js";
import type {ICommand} from "../../../types/commands";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import {getAlias} from "../../../misc/dex-aliases";

module.exports = {
  desc: "Gets learnset information of a Pok\u{00e9}mon.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["learnset"],
  usage: "<species (optional)>, <move (optional)>" +
    ", <restriction [pentagon, plus, galar] (optional)>, <gen (optional)>",
  async command(message, args) {
    const [gen, newArgs, hadGenSpec,, restriction] = Utilities.getGen(args);
    args = newArgs;

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);

    args[0] = getAlias(args[0], ["pokemon", "moves"])[0];
    const specie = Dex.species.get(args[0]);
    if (!specie?.exists) {
      // All species that learn move
      const move = Dex.moves.get(args[0]);
      if (!move?.exists) {
        return message.channel.send(
          Utilities.failureEmoji(message,
            `Unable to find Pok\u{00e9}mon/Move "${
              args[0]
            }" for Generation ${gen}${
              restriction ? ` (${restriction} restriction)` : ""
            }! (Check your spelling?)`)
        ).catch(e => console.error(e));
      }

      const learnable: string[] = [];
      for (const mon of Dex.species) {
        const canLearn = await Dex.learnsets.canLearn(mon.name, move.name, restriction);
        if (canLearn) learnable.push(mon.name);
      }
      if (!learnable.length) {
        return message.channel.send(
          `Oops! It doesn't look like any Pok\u{00e9}mon are able to learn ${
            move.name
          } in Generation ${gen}${restriction ? ` (${restriction} restriction)` : ""}`
        ).catch(e => console.error(e));
      }
      for (const chunk of Util.splitMessage(
        `All Pok\u{00e9}mon who can learn ${move.name} in Generation ${gen}${
          restriction ? ` (${restriction} restriction)` : ""
        }:\n\`\`\`${learnable.sort().join(", ")}\`\`\``,
        {char: ", ", prepend: "```", append: "```"}
      )) {
        message.channel.send(chunk).catch(e => console.error(e));
      }
      return;
    }

    if (args[1]) {
      // Can species learn a specific move
      if (!specie?.exists) {
        return message.channel.send(
          Utilities.failureEmoji(
            message,
            `Unable to find Pok\u{00e9}mon "${
              args[0]
            }" for Generation ${gen}! (Check your spelling?)`
          )
        ).catch(e => console.error(e));
      }
      const move = Dex.moves.get(args[1]);
      if (!move?.exists) {
        return message.channel.send(
          Utilities.failureEmoji(message,
            `Unable to find move "${
              args[1]
            }" for Generation ${gen}${
              restriction ? ` (${restriction} restriction)` : ""
            }! (Check your spelling?)`)
        ).catch(e => console.error(e));
      }

      Dex.learnsets.learnable(specie.name, restriction).then(async moves => {
        const reason: {[k: string]: string[]} = {};
        const can = !!moves![move.id];
        if (can) {
          for (const i of moves![move.id]) {
            const g = i.charAt(0); // Gen
            const m = i.substr(1); // Method
            if (!reason[g]) reason[g] = [];
            reason[g].push(Utilities.getMoveLearnMethod(m));
          }
        }
        let reasonString = "";
        let pastGenReasonString = "";
        let found: [boolean, number] = [false, 0];
        let g = 8;
        for (g; g > 0; g--) {
          if (reason[g]) {
            if (!found[0]) {
              reasonString += `Generation ${g}:\n\t${[...new Set(reason[g])].join("; ")}\n`;
              found = [true, g];
            } else {
              pastGenReasonString += `Generation ${g}:\n\t${[...new Set(reason[g])].join("; ")}\n`;
            }
          }
        }
        const addPastGen = can && (found[1] < gen || !hadGenSpec);
        try {
          return await message.channel.send(
            `${specie.name} **${
              can ? "CAN" : "CANNOT"
            }** learn ${move.name} in Generation ${gen}${
              restriction ? ` (${restriction} restriction)` : ""
            }${
              can && addPastGen && (hadGenSpec || found[1] < gen) ? " by transfer from" : ""
            }${
              can ? `: \`\`\`${reasonString}` : ""
            }${
              addPastGen ? pastGenReasonString : ""
            }${can ? "```" : ""}`
          );
        } catch (e) {
          return console.error(e);
        }
      }).catch(e => console.error(e));
    } else {
      // All moves for species
      Dex.learnsets.learnable(specie.name, restriction).then(moves => {
        const learnable = [];
        for (const move of Dex.moves) {
          if (moves![move.id]) learnable.push(move.name);
        }
        for (const chunk of Util.splitMessage(
          `Full learnset for ${specie.name} in Generation ${gen}:\n\`\`\`${
            learnable.sort().join(", ")
          }\`\`\``, {char: ", ", prepend: "```", append: "```"}
        )) {
          message.channel.send(chunk).catch(e => console.error(e));
        }
      }).catch(e => console.error(e));
    }
  },
} as ICommand;
