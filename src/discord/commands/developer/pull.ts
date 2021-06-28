import {Permissions} from "discord.js";
import {UserPermissions} from "../../enums/userPermissions";
import type {ICommand} from "../../../types/commands";

import {exec} from "child_process";
import {promisify} from "util";
const sh = promisify(exec);

module.exports = {
  desc: "Attempts to execute git pull.",
  commandPermissions: [Permissions.FLAGS.SEND_MESSAGES],
  userPermissons: UserPermissions.DEVELOPER,
  async command(message) {
    const msg = await message.channel.send("Attempting git pull...");
    const remoteOutput = await sh("git remote -v").catch(console.error);
    if (!remoteOutput || remoteOutput.stderr) {
      return msg.edit(Utilities.failureEmoji(message, "No git remote output."));
    }

    const pull = await sh("git pull").catch(console.error);
    if (!pull || (pull.stderr && !pull.stdout)) {
      return msg.edit(Utilities.failureEmoji(message, "Could not pull origin."));
    }
    if (pull.stdout.replace("\n", "").replace(/-/g, " ") === "Already up to date.") {
      return msg.edit(Utilities.failureEmoji(message, "Already up to date!"));
    } else {
      return msg.edit(Utilities.successEmoji(message, `Pull completed!\`\`\`${pull.stdout}\`\`\``));
    }
  },
} as ICommand;
