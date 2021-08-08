import {MessageEmbed, Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import {GraphicsGen, Sprites} from "@pkmn/img";

const spriteGens: {[k: string]: string[]} = {
  "gen1": ["1", "gen1", "g1", "y", "yellow"],
  "gen2": ["2", "gen2", "g2", "c", "crystal"],
  "gen3": ["3", "gen3", "g3", "rse", "e", "emerald"],
  "gen4": ["4", "gen4", "g4", "hgss", "hg", "ss", "heartgold", "soulsilver"],
  "gen1rg": ["rg", "green", "1rg", "redgreen"],
  "gen1rb": ["rb", "rby", "red", "blue", "1rb"],
  "gen2g": ["g", "gold", "2g"],
  "gen2s": ["s", "silver", "2s"],
  "gen3rs": ["rs", "ruby", "sapphire", "3rs"],
  "gen3frlg": ["frlg", "fr", "lg", "firered", "leafgreen", "3frlg"],
  "gen4dp": ["d", "p", "pt", "diamond", "pearl", "plat", "platinum", "dp", "dppt", "4dp"],
  "gen5ani": [
    "5", "gen5", "g5", "bw", "bw2", "b2", "w2", "black", "black2", "white", "white2", "b2w2", "5bw",
  ],
};


function resolveGenOptions(args: string[]): GraphicsGen | undefined {
  let gen;
  for (const arg of args) {
    for (const key of (Object.keys(spriteGens))) {
      if (spriteGens[key].map(e => Utilities.toId(e)).includes(arg)) {
        gen = key;
        break;
      }
    }
  }
  if (args.includes("noani") && gen === "gen5ani") gen = "gen5";
  return gen as GraphicsGen;
}

function resolveSide(args: string[]): "p1" | "p2" {
  for (const arg of args) {
    if (["p1", "back"].includes(arg)) return "p1";
  }
  return "p2";
}

module.exports = {
  desc: "Gets the sprite or model of a Pok\u{00e9}mon from the game specified.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS],
  aliases: ["gif", "model", "sprit"],
  usage: "<Pok\u{00e9}mon Name>, <game (optional)>",
  async command(message, args) {
    const gens = new Generations(dex.Dex);
    const Dex = gens.get(8);
    let gmax, emax;
    [args[0], gmax, emax] = getAlias(args[0], ["pokemon"]);
    let specie = Dex.species.get(args[0]);

    if (!specie?.exists) {
      const Gen7Dex = gens.get(7);
      specie = Gen7Dex.species.get(args[0]);
      if (!specie?.exists) {
        return message.reply(
          {
            content: Utilities.failureEmoji(
              message,
              `Unable to find any Pok\u{00e9}mon matching "${
                args[0]
              }"! All sprites can be viewed at: https://play.pokemonshowdown.com/sprites`
            ),
            allowedMentions: {repliedUser: false},
          }
        ).catch(e => console.error(e));
      }
    }

    args = args.map(a => Utilities.toId(a));

    const sprite = Sprites.getPokemon(
      specie.name + (gmax ? "-gmax" : emax ? "-eternamax" : ""),
      {
        gen: resolveGenOptions(args),
        side: resolveSide(args),
        shiny: args.includes("shiny"),
        gender: (args.includes("f") || args.includes("female")) ? "F" : "M",
      }
    );
    const embed = new MessageEmbed()
      .setTitle(`[Gen ${sprite.gen}] #${specie.num} - ${specie.name}`)
      .setImage(sprite.url)
      .setFooter(await Utilities.getFullVersionString());
    message.reply({embeds: [embed], allowedMentions: {repliedUser: false}}).catch(console.error);
  },
} as ICommand;
