import * as Discord from "discord.js";
import * as colors from "colors/safe";

const client: Discord.Client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER"],
});

(async () => {
  console.log(Utilities.discordText("Logging in..."));
  try {
    await client.login(DiscordConfig.token);
  } catch (e) {
    console.error(e);
    throw (e);
  }
})();

ReadyChecker.on("loaded", () => {
  if (
    __commandsLoaded &&
    __clientReady &&
    __messageDeleteHandlerLoaded &&
    __messageUpdateHandlerLoaded
  ) {
    console.log(Utilities.discordText(colors.green("Ready!")));
    __listen = true;
  }
});

client.on("ready", () => {
  const guilds = client.guilds.cache.map(g => [g.id, g.name]);
  for (const guild of guilds) {
    // Storage.getDatabase() creates a database if one doesn't already exist,
    // so there's no need to create them manually. Nice!
    Storage.getDatabase(guild[0]);
    const db = Storage.getDatabase(guild[0]);
    db.name = guild[1];
    Storage.exportDatabase(guild[0]);
  }

  __clientReady = true;
  ReadyChecker.emit("loaded");
});

client.on("message", (m) => void (async (message: Discord.Message) => {
  if (__listen) {
    if (message.partial) {
      try {
        message = await message.fetch();
      } catch (e) {
        console.log(
          Utilities.discordText(
            `Unable to resolve a message partial! ${colors.grey(`${message.id}`)}`
          )
        );
      }
    }

    const prefix =
      Storage.getDatabase(Utilities.toDatabaseId(message))?.prefix || DiscordConfig.prefix!;
    message.content = message.content.trim();
    const u = client.user!.toString().replace("<@!", "<@");
    const startsWithBotTag =
      message.content.replace("<@!", "<@").startsWith(u);
    if (message.content.startsWith(prefix) || startsWithBotTag) {
      if (startsWithBotTag) message.content = message.content.replace("<@!", "<@");
      const firstPart = startsWithBotTag ? u : prefix;
      // We also want messages that start with the prefix and a space to register as commands
      const spacer = message.content.replace(firstPart, "").startsWith(" ") ? " " : "";
      const commandName = message.content.replace(`${firstPart}${spacer}`, "").split(" ")[0];
      const args =
        message.content.replace(`${firstPart}${spacer}${commandName}`, "").split(",").map(
          arg => arg.trim()
        );

      // Looks like we finally have everything in order. Lets run the command!
      CommandHandler.executeCommand(Utilities.toId(commandName), message, args);
    }
  }
})(m));

client.on("messageDelete", (m) => void (
  async (
    message: Discord.Message | Discord.PartialMessage
  ) => {
    if (__listen) {
      if (message.partial) {
        try {
          message = await message.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a message partial! ${colors.grey(`${message.id}`)}`
            )
          );
        }
      }
      MessageDeleteHandler.executeEvents(message as Discord.Message).catch(console.error);
    }
  })(m));

client.on("messageUpdate", (o, n) => void (async (
  oldMessage: Discord.Message | Discord.PartialMessage,
  newMessage: Discord.Message | Discord.PartialMessage
) => {
  if (__listen) {
    if (oldMessage.partial || newMessage.partial) {
      try {
        oldMessage = await oldMessage.fetch();
        newMessage = await newMessage.fetch();
      } catch (e) {
        console.log(
          Utilities.discordText(
            `Unable to resolve a message partial! ${colors.grey(`${oldMessage.id}`)}`
          )
        );
      }
    }
    MessageUpdateHandler.executeEvents(
      oldMessage as Discord.Message, newMessage as Discord.Message
    ).catch(console.error);
  }
})(o, n));
