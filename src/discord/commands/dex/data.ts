import {Generations} from "@pkmn/data";
import * as dex from "@pkmn/dex";
import {Permissions} from "discord.js";

import {getAlias} from "../../../misc/dex-aliases";
import type {ICommand} from "../../../types/commands";

import * as abilityts from "./ability";
import * as itemts from "./item";
import * as movets from "./move";
import * as naturets from "./nature";
import * as dexts from "./pokedex";

module.exports = {
  desc: "Gets the information of a Pok\u{00e9}mon, ability, move, or item.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["dt", "datasearch", "dex", "details", "detail", "dr"],
  usage: "<Pok\u{00e9}mon Name>",
  async command(message, args) {
    let [gen,, hadGenSpec] = Utilities.getGen(args);
    const copyGen = gen;
    const gens = new Generations(dex.Dex);

    args[0] = getAlias(args[0], ["all"]).id;
    do {
      const tempDex = gens.get(gen);
      if (tempDex.species.get(args[0])?.exists) { return (dexts as ICommand).command(message, args); }
      if (tempDex.moves.get(args[0])?.exists) { return (movets as ICommand).command(message, args); }
      if (tempDex.abilities.get(args[0])?.exists) { return (abilityts as ICommand).command(message, args); }
      if (tempDex.items.get(args[0])?.exists) { return (itemts as ICommand).command(message, args); }
      if (tempDex.natures.get(args[0])?.exists) { return (naturets as ICommand).command(message, args); }
    } while (!hadGenSpec && --gen > 0);

    return message
      .reply({
        content: Utilities.failureEmoji(
          message,
          `Unable to find anything matching "${args[0]}" for Generation ${copyGen}! (Check your spelling?)`
        ),
        allowedMentions: {repliedUser: false},
      })
      .catch((e) => console.error(e));
  },
} as ICommand;
