import {MessageEmbed, Permissions} from "discord.js";
import type {ICommand} from "../../../types/commands";
import {getAlias} from "../../../misc/dex-aliases";
import * as dex from "@pkmn/dex";
import {Generations} from "@pkmn/data";
import {Sprites} from "@pkmn/img";

module.exports = {
  desc: "Gets the information about a Pok\u{00e9}mon Species.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  aliases: ["pokemon", "mon"],
  usage: "<Pok\u{00e9}mon Name>",
  async command(message, args) {
    const db = Storage.getDatabase("currentGen");
    if (!db.currentGen) db.currentGen = "8"; // If the database loses the variable, reset it to 8!
    Storage.exportDatabase("currentGen");

    if (!args[1]) {
      args.push(db.currentGen);
    }

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

    const bs = specie.baseStats;
    let abilityString = "";
    if (gen >= 3) {
      abilityString += Object.keys(specie.abilities).length === 1 ? "Ability: " : "Abilities: ";
      abilityString += `${specie.abilities[0] + (specie.abilities[1] ? `, ${specie.abilities[1]}`
        : "") + (specie.abilities["H"] ? `, ${specie.abilities["H"]} (H)` : "")}\n`;
    }
    const statsString =
      `HP: ${bs.hp} / Atk: ${bs.atk} / Def: ${bs.def} / SpA: ${bs.spa} / SpD: ${bs.spd} / Spe: ` +
      `${bs.spe} (Total: ${Object.values(specie.baseStats).reduce((t, n) => t + n)})\n`;
    const heightWeightString = `Weight: ${specie.weightkg}kg (${
      Utilities.lowKickCalcs(specie.weighthg)
    } BP)`; // Height doesn't work yet
    // TODO: Switch to @pkmn/sim so we can access heightm and color
    const typeString = `Type: ${specie.types.join(" / ")}\n`;

    const extraInfo: string[] = [];
    if (specie.otherFormes) extraInfo.push(`Other formes: ${specie.otherFormes.join(", ")}`);
    if (specie.prevo) {
      extraInfo.push(`Evolves from: ${specie.prevo}${Utilities.getEvoMethod(specie)}`);
    }
    if (specie.evos) {
      const evos = [];
      const GenDex = gens.get(gen as dex.GenerationNum);
      for (const evo of specie.evos) {
        evos.push(`${evo} ${Utilities.getEvoMethod(GenDex.species.get(evo))}`);
      }
      extraInfo.push(`Evolves into: ${evos.join(", ")}`);
    }
    if (specie.eggGroups) {
      extraInfo.push(
        `Egg Group${specie.eggGroups.length === 1 ? "" : "s"}: ${specie.eggGroups.join(", ")}`
      );
    }
    if (specie.gender) {
      let g = "Genderless";
      if (specie.gender === "M") g = "100% Male";
      else if (specie.gender === "F") g = "100% Female";
      extraInfo.push(`Gender Ratio: ${g}`);
    } else {
      const m = specie.genderRatio["M"] * 100;
      const f = specie.genderRatio["F"] * 100;
      if (m !== 0 && f !== 0) extraInfo.push(`Gender Ratio: ${m}% Male; ${f}% Female`);
    }
    extraInfo.push("");
    if (specie.baseSpecies && specie.baseSpecies !== specie.name) {
      extraInfo.push(`Base Species: ${specie.baseSpecies}`);
    }
    if (specie.baseForme) extraInfo.push(`Base Forme: ${specie.baseForme}`);
    if (specie.requiredItems) {
      extraInfo.push(
        `This Pok\u{00e9}mon must hold ${specie.requiredItems.join(" or ")} as an item.`
      );
    }
    if (specie.requiredAbility) {
      extraInfo.push(
        `This Pok\u{00e9}mon must have the ability ${specie.requiredAbility}.`
      );
    }
    if (specie.requiredMove) {
      extraInfo.push(
        `This Pok\u{00e9}mon must have the move ${specie.requiredMove}.`
      );
    }
    if (specie.unreleasedHidden) {
      extraInfo.push(
        `This Pok\u{00e9}mon's Hidden Ability is unreleased.`
      );
    }
    if (specie.maleOnlyHidden) {
      extraInfo.push(
        `This Pok\u{00e9}mon can only have its Hidden Ability if it is Male.`
      );
    }
    if (specie.battleOnly) {
      extraInfo.push(
        `This Pok\u{00e9}mon is only available in battle.`
      );
    }
    if (specie.tier) extraInfo.push(`Tier: ${specie.tier}`);
    extraInfo.push(`Introduced in Gen ${specie.gen}`);


    if (Utilities.checkBotPermissions(message, Permissions.FLAGS.EMBED_LINKS)) {
      const embed = new MessageEmbed()
        .setTitle(`[Gen ${gen}] #${specie.num} - ${specie.name}`)
        .setDescription(
          `${typeString}${statsString}${abilityString}${heightWeightString}\n`
        )
        .setFooter(await Utilities.getFullVersionString())
        .setThumbnail(Sprites.getPokemon(specie.name, {gen: gen as dex.GenerationNum}).url)
        .addField(
          "Extra Info:",
          [
            extraInfo.join("\n"), [
              `[Smogon](https://www.smogon.com/dex/${
                Utilities.genToSmogonGenString(gen as dex.GenerationNum)
              }/pokemon/${(specie.name.split(" ").join("-")).toLowerCase()}/)`,
              `[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/${
                specie.baseSpecies
              }_(Pok%C3%A9mon))`,
              `[Serebii](https://www.serebii.net/pokedex${
                Utilities.genToSerebiiGenString(gen as dex.GenerationNum)
              }/${
                `${
                  gen === 8 ? specie.baseSpecies.toLowerCase() : `${specie.num}`.padStart(3, "0")
                }`
              }${gen === 8 ? "/" : ".shtml"})`,
            ].join(" | "),
          ]
        );
      message.channel.send({embed: embed}).catch(console.error);
    } else {
      // Can't send embed, fall back to text only
      return message.channel.send(
        `${`${
          Utilities.generateDashes(`[Gen ${gen}] #${specie.num} - ${specie.name}`)
        }\n` +
        `${typeString}${statsString}${abilityString}${heightWeightString}\n` +
        `\nExtra Info: \n`}${
          extraInfo.join("\n")}`,
        {code: "XL"}
      ).catch(e => console.error(e));
    }
  },
} as ICommand;
