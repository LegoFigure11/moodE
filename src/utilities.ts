import * as path from "path";
import * as util from "util";
import * as fs from "fs";
import * as colors from "colors/safe";
import * as https from "https";

import {exec} from "child_process";
import * as Discord from "discord.js";

const sh = util.promisify(exec);

const ID_REGEX = /[^a-z0-9-]/g;

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
  checkBotPermissions(message: Discord.Message, permission: number): boolean {
    if (message.channel.type === "dm" || !message?.guild?.me) return true;
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
   * Used for signifying success on discord
   * @param message the message used to perform the permission check to determine the emoji used
   * @param text the text to output
   * @returns an emoji followed by `text`
   */
  successEmoji(message: Discord.Message, text: string): string {
    let emoji = "\u{2714}"; // Fallback
    if (message?.channel?.type === "dm") return `${DiscordConfig.successEmoji || emoji} ${text}`;
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
    if (message?.channel?.type === "dm") return `${DiscordConfig.failureEmoji || emoji} ${text}`;
    const permission = Discord.Permissions.FLAGS.USE_EXTERNAL_EMOJIS;
    if (
      DiscordConfig.failureEmoji &&
      this.checkBotPermissions(message, permission)
    ) emoji = DiscordConfig.failureEmoji;
    return `${emoji} ${text}`;
  }

  /**
   * Normalizes a Message object into a string representing the id of its database
   * @param message the message to get the database id of
   * @returns the database id, or unfined if one cannot be found
   */
  toDatabaseId(message: Discord.Message): string | undefined {
    if (message.channel.type === "dm") {
      return message.channel.id;
    } else {
      return message?.guild?.id;
    }
  }

  parseChannelId(message: Discord.Message, id: string | undefined):
  Discord.GuildChannel | undefined {
    if (!id) return;
    const idFromRegex = Discord.MessageMentions.CHANNELS_PATTERN.exec(id);
    if (idFromRegex?.[1]) {
      return message.guild!.channels.cache.get(idFromRegex[1]);
    } else {
      let channel = message.guild!.channels.cache.find(c => this.toId(c.name) === this.toId(id));
      if (!channel) channel = message.guild!.channels.cache.get(id);
      return channel;
    }
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
    } else { return `(Unknown, please report this as a bug - Move Type \`${method}\`)`; }
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
