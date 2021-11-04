import * as Discord from "discord.js";
import * as colors from "colors/safe";
import {Intents} from "discord.js";

global.client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER"],
});

void (async () => {
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
    __guildBanAddHandlerLoaded &&
    __guildBanRemoveHandlerLoaded &&
    __guildMemberAddHandlerLoaded &&
    __guildMemberRemoveHandlerLoaded &&
    __messageCreateHandlerLoaded &&
    __messageDeleteHandlerLoaded &&
    __messageUpdateHandlerLoaded &&
    __messageReactionAddHandlerLoaded &&
    __messageReactionRemoveHandlerLoaded &&
    __PluginLoaderLoaded
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

client.on("messageCreate", (m) => void (async (message: Discord.Message) => {
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

    message = await MessageCreateHandler.executeEvents(
      message
    ).catch(console.error) as unknown as Discord.Message;

    if (message && !message.deleted) {
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
  }
})(m));

client.on("guildBanAdd", (b) => void (
  async (
    ban: Discord.GuildBan
  ) => {
    if (__listen) {
      if (ban.partial) {
        try {
          ban = await ban.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a ban partial! ${colors.grey(`${ban.guild.id}`)}`
            )
          );
        }
      }
      GuildBanAddHandler.executeEvents(ban).catch(console.error);
    }
  }
)(b));

client.on("guildBanRemove", (b) => void (
  async (
    ban: Discord.GuildBan
  ) => {
    if (__listen) {
      if (ban.partial) {
        try {
          ban = await ban.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a ban partial! ${colors.grey(`${ban.guild.id}`)}`
            )
          );
        }
      }
      GuildBanRemoveHandler.executeEvents(ban).catch(console.error);
    }
  }
)(b));

client.on("guildMemberAdd", (m) => void (
  async (
    member: Discord.GuildMember | Discord.PartialGuildMember
  ) => {
    if (__listen) {
      if (member.partial) {
        try {
          member = await member.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a member partial! ${colors.grey(`${member.id}`)}`
            )
          );
        }
      }
      GuildMemberAddHandler.executeEvents(member as Discord.GuildMember).catch(console.error);
    }
  }
)(m));

client.on("guildMemberRemove", (m) => void (
  async (
    member: Discord.GuildMember | Discord.PartialGuildMember
  ) => {
    if (__listen) {
      if (member.partial) {
        try {
          member = await member.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a member partial! ${colors.grey(`${member.id}`)}`
            )
          );
        }
      }
      GuildMemberRemoveHandler.executeEvents(member as Discord.GuildMember).catch(console.error);
    }
  }
)(m));

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
  }
)(m));

client.on("messageDeleteBulk", (ms) => void (
  async (
    messages: Discord.Collection<string, Discord.Message | Discord.PartialMessage>
  ) => {
    if (__listen) {
      for (const entry of messages) {
        let message = entry[1];
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
    }
  }
)(ms));

client.on("messageReactionAdd", (r, u) => void (
  async (
    messageReaction: Discord.MessageReaction | Discord.PartialMessageReaction,
    user: Discord.User | Discord.PartialUser
  ) => {
    if (__listen) {
      if (user.partial) {
        try {
          user = await user.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a user partial! ${colors.grey(`${user.id}`)}`
            )
          );
        }
      }
      if (messageReaction.partial) {
        try {
          messageReaction = await messageReaction.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a reaction partial!`
            )
          );
        }
      }
      MessageReactionAddHandler.executeEvents(
        messageReaction as Discord.MessageReaction, user as Discord.User
      ).catch(console.error);
    }
  }
)(r, u));

client.on("messageReactionRemove", (r, u) => void (
  async (
    messageReaction: Discord.MessageReaction | Discord.PartialMessageReaction,
    user: Discord.User | Discord.PartialUser
  ) => {
    if (__listen) {
      if (user.partial) {
        try {
          user = await user.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a user partial! ${colors.grey(`${user.id}`)}`
            )
          );
        }
      }
      if (messageReaction.partial) {
        try {
          messageReaction = await messageReaction.fetch();
        } catch (e) {
          console.log(
            Utilities.discordText(
              `Unable to resolve a reaction partial!`
            )
          );
        }
      }
      MessageReactionRemoveHandler.executeEvents(
        messageReaction as Discord.MessageReaction, user as Discord.User
      ).catch(console.error);
    }
  }
)(r, u));

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
