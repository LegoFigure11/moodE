import * as path from "path";
import * as util from "util";
import * as fs from "fs";
import * as colors from "colors/safe";
import * as https from "https";

import {exec} from "child_process";
import * as Discord from "discord.js";

import type {BoostID, BoostsTable, Move, Species, GenerationNum} from "@pkmn/dex-types";
import type {DateMention} from "./types/utilities";

const sh = util.promisify(exec);

const ID_REGEX = /[^a-z0-9-]/g;
const URL_REGEX = /[^A-Za-z0-9-_.~:/?#[\]@!$&'()*+,;=%\s]/g;

const DEFAULT_DEX_GENERATION = 8;
const GEN_1_ALIASES = [
  "r", "b", "y", "g", "red", "yellow", "blue", "green", "rb", "rby", "rbyg", "gen1", "generation1",
  "1", "g1",
];
const GEN_2_ALIASES = [
  "g", "s", "c", "gold", "silver", "crystal", "gs", "gsc", "gen2", "generation2", "2", "g2",
];
const GEN_3_ALIASES = [
  "r", "s", "e", "fr", "lg", "c", "xd", "rs", "rse", "frlg", "colo", "gales", "adv", "ruby",
  "sapphire", "emerald", "firered", "leafgreen", "colosseum", "gen3", "generation3", "3", "g3",
];
const GEN_4_ALIASES = [
  "d", "p", "pt", "hg", "ss", "dp", "dpp", "dppt", "hgss", "diamond", "pearl", "plat", "platinum",
  "heartgold", "soulsilver", "gen4", "generation4", "4", "g4",
];
const GEN_5_ALIASES = [
  "b", "w", "b2", "w2", "bw", "bw2", "black", "black2", "white", "white2", "gen5", "generation5",
  "5", "g5",
];
const GEN_6_ALIASES = [
  "x", "y", "xy", "or", "as", "oras", "xyoras", "gen6", "generation6", "6", "g6",
];
const GEN_7_ALIASES = [
  "s", "m", "sm", "us", "um", "usum", "sun", "moon", "ultrasun", "ultramoon", "gen7", "generation7",
  "7", "g7",
];
const GEN_8_ALIASES = [
  "sw", "sh", "swsh", "swish", "swoshi", "sword", "shield", "swordshield", "swordandsheild", "gen8",
  "8", "g8", "generation8",
];
const PENTAGON_ALIASES = [
  "penta", "pentagon",
];
const PLUS_ALIASES = [
  "plus",
];
const GALAR_ALIASES = [
  "galar",
];

const dateOptions: {[k: string]: "numeric"} = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
};

export class Utilities {
  /**
   * Path to the root folder of the entire project
   */
  readonly rootFolder: string = path.resolve(__dirname, "..");
  /**
   * Path to the folder containing the built files
   */
  readonly builtFolder: string = path.join(this.rootFolder, "built");
  /**
   * Path to the discord directory
   */
  readonly discordFolder: string = path.join(this.builtFolder, "discord");

  /**
   * Short hash of the current commit
   */
  readonly shortVersionHash: Promise<string> = this.getVersionHash();

  onReload(previous: Partial<Utilities>): void {
    for (const i in previous) {
      // @ts-expect-error
      delete previous[i];
    }
  }

  /**
   * Turns input into a lower-case alphanumeric string, removing all symbols except hyphen
   * @param input the input to turn into an id
   */
  toId(input?: string | number | {id: string}): string {
    if (!input) return "";
    if (typeof input !== "string") {
      if (typeof input === "number") {
        input = `${input}`;
      } else {
        input = input.id;
      }
    }
    return input.toLowerCase().replace(ID_REGEX, "");
  }

  /**
   * Returns a string with the first letter of each word capitalised
   * @param input the string to capitalise
   */
  toTitleCase(input?: string): string {
    if (!input) return "";
    return input.replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Returns a string with all invalid URL characters removed
   * @param input the input to process
   */
  removeIllegalURLCharacters(input?: string | number): string {
    if (!input) return "";
    if (typeof input !== "string") {
      if (typeof input === "number") {
        input = `${input}`;
      }
    }
    return input.replace(URL_REGEX, "");
  }

  /**
   * Used for building the timestamp used in Utilities#timeStampString()
   * @returns Returns the current date and time in human-readable format
   */
  timeStamp(): string {
    const d = new Date();
    return `[${d.toLocaleDateString("en-AU", dateOptions)} ${d.toTimeString().split(" ")[0]}]`;
  }

  /**
   * Gets a string representation of the provided or current date
   * @param date (optional) the date to strigify
   * @returns Returns a human-readable date format
   */
  UTCtimeStamp(date?: Date): string {
    const d = date || new Date();
    return d.toUTCString();
  }

  /**
   * Used for logging a timestamp to stdout
   * @param text the message to output
   * @returns Returns a timestamp followed by the provided message
   */
  timeStampString(text: string): string {
    return `${colors.grey(this.timeStamp())} ${text}`;
  }

  /**
   * Used for logging to stdout from the main process
   * @param text the message to output
   * @returns Returns a timestamp followed by "moodE: " and the provided message
   */
  moodeText(text: string): string {
    return this.timeStampString(`${colors.yellow("moodE: ")}${text}`);
  }

  /**
   * Used for logging to stdout from discord
   * @param text the message to output
   * @returns Returns a timestamp followed by "Discord: " and the provided message
   */
  discordText(text: string): string {
    return this.timeStampString(`${colors.yellow("Discord: ")}${text}`);
  }

  /**
   * Executes git rev-parse --short HEAD
   * @returns Returns the short hash of the current commit
   */
  async getVersionHash(): Promise<string> {
    try {
      const revParseOutput = await sh("git rev-parse --short HEAD");
      return revParseOutput.stdout.trim();
    } catch (e) {
      return "";
    }
  }

  async getFullVersionString(): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const version = require(path.join(this.rootFolder, "package.json")).version;
    const hash = await this.shortVersionHash;
    return `moodE v${version}-${hash}`;
  }

  /**
  * Writes a file to system asynchronosly avoiding race conditions,
  * Taken from https://git.io/JLhid
  * @param filepath location for the file to be written to
  * @param data the contents of the file
  */
  async safeWriteFile(filepath: string, data: string): Promise<void> {
    const tempFilepath = `${filepath}.temp`;
    return new Promise(resolve => {
      fs.writeFile(tempFilepath, data, () => {
        fs.rename(tempFilepath, filepath, () => {
          resolve();
        });
      });
    });
  }

  /**
   * Writes a file to system synchronosly avoiding race conditions,
   * Taken from https://git.io/JLhi7
   * @param filepath location for the file to be written to
   * @param data the contents of the file
   */
  safeWriteFileSync(filepath: string, data: string): void {
    const tempFilepath = `${filepath}.temp`;
    fs.writeFileSync(tempFilepath, data);
    fs.renameSync(tempFilepath, filepath);
  }

  /**
   * Cleans a string to remove accidental tags
   * @param text the text to clean
   * @returns the text without tags
   */
  clean(text: string) {
    if (typeof text === "string") {
      return text.replace(
        /`/g, `\`${String.fromCharCode(8203)}`
      ).replace(/@/g, `@${String.fromCharCode(8203)}`);
    } else {
      return text;
    }
  }

  /**
   * Removes a tree from the require cache
   * @param root the path to the tree
   */
  uncacheTree(root: string): void {
    const filepaths = [require.resolve(root)];
    while (filepaths.length) {
      const filepath = filepaths[0];
      filepaths.shift();
      if (filepath in require.cache) {
        const cachedModule = require.cache[filepath]!;
        for (const child of cachedModule.children) {
          if (!child.id.endsWith(".node")) filepaths.push(child.filename);
        }

        cachedModule.exports = {};
        cachedModule.children = [];
        if (cachedModule.parent) {
          const index = cachedModule.parent.children.indexOf(cachedModule);
          if (index !== -1) cachedModule.parent.children.splice(index, 1);
        }

        delete require.cache[filepath];
      }
    }
  }

  /**
   * Checks the permissions of the bot in the current guild
   * @param message the context of the check
   * @param permission the integer representation of the permission (see Permissions.FLAGS)
   */
  checkBotPermissions(message: Discord.Message, permission: bigint): boolean {
    if (message.channel.type === "DM" || !message?.guild?.me) return true;
    const channelPermissions = message.channel.permissionsFor(message.guild.me);
    const memberPermissions = message.guild.me.permissionsIn(message.channel);
    const rolePermissions = message.channel.permissionsFor(message.guild.me.roles.highest);
    return (
      channelPermissions?.has(permission) ||
      memberPermissions?.has(permission) ||
      rolePermissions?.has(permission)
    ) || false;
  }

  /**
   * Checks the permissions of the bot in the current guild from a channel
   * @param channel the context of the check
   * @param permission the integer representation of the permission (see Permissions.FLAGS)
   */
  checkBotPermissionsFromChannel(
    channel: Discord.TextChannel | Discord.DMChannel, permission: bigint
  ): boolean {
    if (channel.type === "DM" || !channel?.guild?.me) return true;
    const channelPermissions = channel.permissionsFor(channel.guild.me);
    const memberPermissions = channel.guild.me.permissionsIn(channel);
    const rolePermissions = channel.permissionsFor(channel.guild.me.roles.highest);
    return (
      channelPermissions?.has(permission) ||
      memberPermissions?.has(permission) ||
      rolePermissions?.has(permission)
    ) || false;
  }

  /**
   * Checks the permissions of the bot in the current guild from a channel
   * @param channel the context of the check
   * @param permission the integer representation of the permission (see Permissions.FLAGS)
   */
  checkBotPermissionsFromGuild(
    guild: Discord.Guild, permission: bigint, channel: Discord.TextChannel
  ): boolean {
    if (!guild?.me) return true;
    const channelPermissions = channel.permissionsFor(guild.me);
    const memberPermissions = guild.me.permissionsIn(channel);
    const rolePermissions = channel.permissionsFor(guild.me.roles.highest);
    return (
      channelPermissions?.has(permission) ||
      memberPermissions?.has(permission) ||
      rolePermissions?.has(permission)
    ) || false;
  }

  /**
   * Used for signifying success on discord
   * @param message the message used to perform the permission check to determine the emoji used
   * @param text the text to output
   * @returns an emoji followed by `text`
   */
  successEmoji(message: Discord.Message, text: string): string {
    let emoji = "\u{2714}"; // Fallback
    if (message?.channel?.type === "DM") return `${DiscordConfig.successEmoji || emoji} ${text}`;
    const permission = Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    if (
      DiscordConfig.successEmoji &&
      this.checkBotPermissions(message, permission)
    ) emoji = DiscordConfig.successEmoji;
    return `${emoji} ${text}`;
  }

  /**
   * Used for signifying failure on discord
   * @param message the message used to perform the permission check to determine the emoji used
   * @param text the text to output
   * @returns an emoji followed by `text`
   */
  failureEmoji(message: Discord.Message, text: string): string {
    let emoji = "\u{274C}"; // Fallback
    if (message?.channel?.type === "DM") return `${DiscordConfig.failureEmoji || emoji} ${text}`;
    const permission = Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    if (
      DiscordConfig.failureEmoji &&
      this.checkBotPermissions(message, permission)
    ) emoji = DiscordConfig.failureEmoji;
    return `${emoji} ${text}`;
  }

  /**
   * Used for custom join messages
   * @param message the message used to perform the permission check to determine the emoji used
   * @param text the text to output
   * @returns an emoji followed by `text`
   */
  guildJoinEmoji(channel: Discord.TextChannel | Discord.DMChannel, text: string): string {
    let emoji = "\u{27A1}"; // Fallback
    if (channel?.type === "DM") return `${DiscordConfig.guildJoinEmoji || emoji} ${text}`;
    const permission = Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    if (
      DiscordConfig.guildJoinEmoji &&
      this.checkBotPermissionsFromChannel(channel, permission)
    ) emoji = DiscordConfig.guildJoinEmoji;
    return `${emoji} ${text}`;
  }

  /**
   * Used for custom leave messages
   * @param message the message used to perform the permission check to determine the emoji used
   * @param text the text to output
   * @returns an emoji followed by `text`
   */
  guildLeaveEmoji(channel: Discord.TextChannel | Discord.DMChannel, text: string): string {
    let emoji = "\u{2B05}"; // Fallback
    if (channel?.type === "DM") return `${DiscordConfig.guildLeaveEmoji || emoji} ${text}`;
    const permission = Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    if (
      DiscordConfig.guildLeaveEmoji &&
       this.checkBotPermissionsFromChannel(channel, permission)
    ) emoji = DiscordConfig.guildLeaveEmoji;
    return `${emoji} ${text}`;
  }

  /**
   * Used for messages that need a warning emoji
   * @param message the message used to perform the permission check to determine the emoji used
   * @param text the text to output
   * @returns an emoji followed by `text`
   */
  warningEmoji(channel: Discord.TextChannel | Discord.DMChannel, text: string): string {
    let emoji = "\u{26A0}"; // Fallback
    if (channel?.type === "DM") return `${DiscordConfig.warningEmoji || emoji} ${text}`;
    const permission = Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    if (
      DiscordConfig.warningEmoji &&
       this.checkBotPermissionsFromChannel(channel, permission)
    ) emoji = DiscordConfig.warningEmoji;
    return `${emoji} ${text}`;
  }

  /**
   * Normalizes a Message object into a string representing the id of its database
   * @param message the message to get the database id of
   * @returns the database id, or unfined if one cannot be found
   */
  toDatabaseId(message: Discord.Message): string | undefined {
    if (message.channel.type === "DM") {
      return message.channel.id;
    } else {
      return message?.guild?.id;
    }
  }

  /**
   * Generates a string of dashes equal to the length of a string
   * @param string
   * @returns the string followed by a linebreak and a string of dashes
   */
  generateDashes(string: string): string {
    return `${string}\n${"-".repeat(string.length)}`;
  }

  parseChannelId(guild: Discord.Message | Discord.Guild, id: string | undefined):
  Discord.GuildChannel | Discord.ThreadChannel | undefined {
    if (!id) return;
    // @ts-ignore
    if (guild.guild) guild = guild.guild; // Input is Message Type
    const idFromRegex = Discord.MessageMentions.CHANNELS_PATTERN.exec(id);
    if (idFromRegex?.[1]) {
      return (guild as Discord.Guild).channels.cache.get(idFromRegex[1]);
    } else {
      let channel = (guild as Discord.Guild).channels.cache.find(
        c => this.toId(c.name) === this.toId(id)
      );
      if (!channel) channel = (guild as Discord.Guild).channels.cache.get(id);
      return channel;
    }
  }

  async parseUserId(message: Discord.Message, id: string | undefined):
  Promise<Discord.User | undefined | void> {
    if (!id) return;
    id = id.trim();
    let user: Discord.User | undefined | null | void;
    id = Discord.MessageMentions.USERS_PATTERN.exec(id)?.[1] || id;
    user = message.client.users.cache.get(id);
    if (!user) {
      user = await message.client.users.fetch(id.replace(/[^0-9]/g, "")).catch(console.error);
    }
    return user;
  }

  parseRoleId(guild: Discord.Message | Discord.Guild, id: string | undefined):
  Discord.Role | undefined | void {
    if (!id) return;
    // @ts-ignore
    if (guild.guild) guild = guild.guild; // Input is Message Type
    id = id.trim();
    let role: Discord.Role | undefined | null | void;
    id = Discord.MessageMentions.ROLES_PATTERN.exec(id)?.[1] || id;
    role = (guild as Discord.Guild).roles.cache.get(id);
    if (!role) {
      role = (guild as Discord.Guild).roles.cache.find(
        r => this.toId(r.name) === this.toId(id)
      );
    }
    return role;
  }

  joinList(
    list: readonly string[], preFormatting?: string | null,
    postFormatting?: string | null, conjunction?: string
  ): string {
    let len = list.length;
    if (!len) return "";
    if (!preFormatting) preFormatting = "";
    if (!postFormatting) postFormatting = preFormatting;
    if (!conjunction) conjunction = "and";
    if (len === 1) {
      return preFormatting + list[0] + postFormatting;
    } else if (len === 2) {
      return `${preFormatting + list[0] + postFormatting} ${conjunction}` +
        `${preFormatting}${list[1]}${postFormatting}`;
    } else {
      len--;
      return `${preFormatting + list.slice(0, len).join(
        `${postFormatting}, ${preFormatting}`
      ) + postFormatting}, ${conjunction} ${preFormatting}${list[len]}${postFormatting}`;
    }
  }

  blankEmbedField(inline: boolean) {
    return {
      name: "\u200b",
      value: "\u200b",
      inline: !!inline,
    };
  }

  // From https://stackoverflow.com/a/23259289/13258354
  timeSince(date: number | Date) {
    if (typeof date !== "object") {
      date = new Date(date).getTime();
    } else {
      date = date.getTime();
    }


    const seconds = Math.floor((new Date().getTime() - date) / 1000);
    let intervalType;

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      intervalType = "year";
    } else {
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) {
        intervalType = "month";
      } else {
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
          intervalType = "day";
        } else {
          interval = Math.floor(seconds / 3600);
          if (interval >= 1) {
            intervalType = "hour";
          } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
              intervalType = "minute";
            } else {
              interval = seconds;
              intervalType = "second";
            }
          }
        }
      }
    }

    if (interval > 1 || interval === 0) {
      intervalType += "s";
    }

    return `${interval} ${intervalType} ago`;
  }

  /**
   * Converts a timestamp to Discord Markdown format
   * If no timestamp is provided, uses the current time
   */
  date(timestamp?: number): DateMention {
    return `<t:${
      timestamp ? ~~(+new Date(timestamp) / 1000) : ~~(Date.now() / 1000)
    }>` as unknown as DateMention;
  }

  random(max: number | null) {
    if (!max) max = 2;
    return Math.floor(Math.random() * max);
  }

  shuffle(array: any[]) {
    array = array.slice();

    // Fisher-Yates shuffle algorithm
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = this.random(currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  sampleOne(array: any[]) {
    const len = array.length;
    if (!len) throw new Error("Utilities.sampleOne() does not accept empty arrays");
    if (len === 1) return array.slice()[0];
    return this.shuffle(array)[0];
  }

  sampleMany(array: any[], amount: number) {
    const len = array.length;
    if (!len) throw new Error("Utilities.sampleMany() does not accept empty arrays");
    if (len === 1) return array.slice();
    if (typeof amount === "string") amount = parseInt(amount);
    if (!amount || isNaN(amount)) throw new Error("Invalid amount in Utilities.sampleMany()");
    if (amount > len) amount = len;
    return this.shuffle(array).splice(0, amount);
  }

  async fetchURL(url: string): Promise<string | Error> {
    return new Promise(resolve => {
      let data = "";
      const request = https.get(url, res => {
        res.setEncoding("utf8");
        // eslint-disable-next-line no-return-assign
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          resolve(data);
        });
      });

      request.on("error", error => {
        resolve(error);
      });
    });
  }

  getGen(args: string[]): [
    gen: number,
    newArgs: string[],
    hadGenSpec: boolean,
    mod: string | number | undefined,
    restriction: "Pentagon" | "Plus" | "Galar" | undefined
  ] {
    let gen = DiscordConfig.defaultGeneration || DEFAULT_DEX_GENERATION;
    let restriction: "Pentagon" | "Plus" | "Galar" | undefined;
    let hadGenSpec = false;
    const newArgs = [];
    args = args.map(a => this.toId(a));
    for (const arg of args) {
      if (GEN_1_ALIASES.includes(arg)) {
        gen = 1;
        hadGenSpec = true;
      } else if (GEN_2_ALIASES.includes(arg)) {
        gen = 2;
        hadGenSpec = true;
      } else if (GEN_3_ALIASES.includes(arg)) {
        gen = 3;
        hadGenSpec = true;
      } else if (GEN_4_ALIASES.includes(arg)) {
        gen = 4;
        hadGenSpec = true;
      } else if (GEN_5_ALIASES.includes(arg)) {
        gen = 5;
        hadGenSpec = true;
      } else if (GEN_6_ALIASES.includes(arg)) {
        gen = 6;
        hadGenSpec = true;
      } else if (GEN_7_ALIASES.includes(arg)) {
        gen = 7;
        hadGenSpec = true;
      } else if (GEN_8_ALIASES.includes(arg)) {
        gen = 8;
        hadGenSpec = true;
      } else if (PENTAGON_ALIASES.includes(arg)) {
        restriction = "Pentagon";
      } else if (PLUS_ALIASES.includes(arg)) {
        restriction = "Plus";
      } else if (GALAR_ALIASES.includes(arg)) {
        restriction = "Galar";
      } else {
        newArgs.push(arg);
      }
    }
    return [gen, newArgs, hadGenSpec, undefined, restriction];
  }

  getMoveLearnMethod(method: string): string {
    if (method === "M") {
      return "TM, HM, or TR";
    } else if (method.charAt(0) === "L") {
      return `Level Up (Level ${method.substr(1)})`;
    } else if (method === "D") {
      return "Dream World";
    } else if (method.charAt(0) === "S") {
      return "Event";
    } else if (method === "V") {
      return "Virtual Console transfer";
    } else if (method === "E") {
      return "Egg Move";
    } else if (method === "T") {
      return "Move Tutor";
    } else if (method === "X") {
      return "Egg (Traded back)";
    } else if (method === "Y") {
      return "Event (Traded back)";
    } else {
      return `(Unknown, please report this as a bug - Move Type \`${method}\`)`;
    }
  }

  getMoveFlagDescriptions(move: Move): string {
    const flags = [];

    if ("authentic" in move.flags) flags.push("\u{2705} Bypasses Substitute");
    if ("bite" in move.flags) flags.push("\u{2705} Boosted by Strong Jaw");
    if ("bullet" in move.flags) flags.push("\u{2705} Blocked by Bulletproof");
    if ("charge" in move.flags) flags.push("\u{2705} Prevents the user from moving between turns");
    if ("contact" in move.flags) flags.push("\u{2705} Makes contact");
    if ("dance" in move.flags) flags.push("\u{2705} Can be copied by Dancer");
    if ("defrost" in move.flags) flags.push("\u{2705} Thaws the user");
    if ("distance" in move.flags) flags.push("\u{2705} Can target any potision in a Triple Battle");
    if ("gravity" in move.flags) flags.push("\u{274E} Cannot be used in Gravity");
    if ("heal" in move.flags) flags.push("\u{274E} Cannot be used after Heal Block");
    if ("mirror" in move.flags) flags.push("\u{2705} Can be copied by Mirror Move");
    // if ("mystery" in move.flags) flags.push("\u{2705} Unknown effect");
    if ("nonsky" in move.flags) flags.push("\u{274E} Cannot be used in a Sky Battle");
    if ("powder" in move.flags) {
      flags.push(
        "\u{2705} Blocked by Overcoat, Safety Goggles, and Grass Types"
      );
    }
    if ("protect" in move.flags) {
      flags.push(`\u{2705} Blocked by Detect, Protect, ${
        move.category === "Status" ? "and Spiky Shield" : "Spiky Shield, and King's Shield"
      }`);
    }
    if ("pusle" in move.flags) flags.push("\u{2705} Boosted by Mega Launcher");
    if ("punch" in move.flags) flags.push("\u{2705} Boosted by Iron Fist");
    if ("recharge" in move.flags) {
      flags.push(
        "\u{2705} The user must recharge after using this move"
      );
    }
    if ("reflectable" in move.flags) flags.push("\u{2705} Is bounced by Magic Coat/Magic Guard");
    if ("snatch" in move.flags) flags.push("\u{2705} Can be stolen by Snatch");
    if ("sound" in move.flags) flags.push("\u{2705} Blocked by Soundproof, boosted by Punk Rock");

    return flags.join("\n");
  }

  toStatName(stat: string): string {
    if (["h", "hp"].includes(stat)) {
      return "HP";
    } else if (["a", "atk"].includes(stat)) {
      return "Atk";
    } else if (["b", "def"].includes(stat)) {
      return "Def";
    } else if (["c", "spa"].includes(stat)) {
      return "SpA";
    } else if (["d", "spd"].includes(stat)) {
      return "SpD";
    } else if (["s", "spe"].includes(stat)) {
      return "Spe";
    } else if (stat === "accuracy") {
      return "Accuracy";
    } else if (stat === "evasion") {
      return "Evasion";
    }
    return stat;
  }

  processZmoveBoost(boostObject: Partial<BoostsTable>): string {
    const result = [];
    for (const key of Object.keys(boostObject)) {
      result.push(`+${boostObject[key as BoostID]} ${this.toStatName(key)}`);
    }
    return result.join(", ");
  }

  getEvoMethod(specie: Species | undefined): string {
    let method = "";
    if (specie?.evoLevel) method = ` (Lv. ${specie.evoLevel})`;
    return method;
  }

  lowKickCalcs(weight: number): number {
    if (weight < 100) return 20;
    if (weight < 250) return 40;
    if (weight < 500) return 60;
    if (weight < 1000) return 80;
    if (weight < 2000) return 100;
    return 120;
  }

  genToSmogonGenString(gen: GenerationNum): string {
    if (gen === 7) return "sm";
    if (gen === 6) return "xy";
    if (gen === 5) return "bw";
    if (gen === 4) return "dp";
    if (gen === 3) return "rs";
    if (gen === 2) return "gs";
    if (gen === 1) return "rb";
    return "ss";
  }

  genToSerebiiGenString(gen: GenerationNum): string {
    if (gen === 7) return "-sm";
    if (gen === 6) return "-xy";
    if (gen === 5) return "-bw";
    if (gen === 4) return "-dp";
    if (gen === 3) return "-rs";
    if (gen === 2) return "-gs";
    if (gen === 1) return "";
    return "-swsh";
  }

  // Yoinked from https://stackoverflow.com/a/45130990/13258354
  async* getFiles(dir: string): AsyncGenerator<string, void, void> {
    const dirents = await fs.promises.readdir(dir, {withFileTypes: true});
    for (const dirent of dirents) {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory()) {
        yield* this.getFiles(res);
      } else {
        yield res;
      }
    }
  }
}

export const instantiate = (): void => {
  const oldUtilities = global.Utilities as Utilities | undefined;

  global.Utilities = new Utilities();

  if (oldUtilities) {
    global.Utilities.onReload(oldUtilities);
  }
};
