import {Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import * as dexts from "./pokedex";
import * as movets from "./move";
import * as abilityts from "./ability";
import * as itemts from "./item";
import * as naturets from "./nature";
import {TypoChecker} from "./typoChecker";


module.exports = {
  desc: "Gets the information of a Pok\u{00e9}mon, ability, move, or item.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["dt", "datasearch", "dex", "details", "detail", "dr"],
  usage: "<Pok\u{00e9}mon Name>",
  async command(message, args) {
    let [gen,, hadGenSpec] = Utilities.getGen(args);


    const test = new TypoChecker(message, args);
    const temp = test.getSimilarMons();
    for (let i = 0; i < temp.length; i++) {
      console.log(temp[i]);
    }

    const gens = new Generations(dex.Dex);
    const Dex = gens.get(gen as dex.GenerationNum);
    const Gen7Dex = gens.get(7);

    args[0] = getAlias(args[0]);
    let specie = Dex.species.get(args[0]);

    // Species
    if (!specie?.exists) {
      specie = Gen7Dex.species.get(args[0]);
      if (specie?.exists && !hadGenSpec) {
        if (gen === 8) gen = 7;
      } else {
        // Move
        let move = Dex.moves.get(args[0]);

        if (!move?.exists) {
          move = Gen7Dex.moves.get(args[0]);
          if (move?.exists && !hadGenSpec) {
            if (gen === 8) gen = 7;
          } else {
            // Ability
            const ability = Dex.abilities.get(args[0]);

            if (!ability?.exists) {
              // Item
              const item = Dex.items.get(args[0]);

              if (!item?.exists) {
                // Nature
                const nature = Dex.natures.get(args[0]);

                if (!nature?.exists) {
                  return message.channel.send(
                    Utilities.failureEmoji(
                      message,
                      `Unable to find anything matching "${
                        args[0]
                      }" for Generation ${gen}! (Check your spelling?)`
                    )
                  ).catch(e => console.error(e));
                }
                return (naturets as ICommand).command(message, args);
              }
              return (itemts as ICommand).command(message, args);
            }
            return (abilityts as ICommand).command(message, args);
          }
        }
        return (movets as ICommand).command(message, args);
      }
    }

    return (dexts as ICommand).command(message, args);
  },
} as ICommand;
