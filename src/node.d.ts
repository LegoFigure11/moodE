declare namespace NodeJS {
  interface Global {
    __clientReady: boolean;
    __commandsLoaded: boolean;
    __guildMemberAddHandlerLoaded: boolean;
    __guildMemberRemoveHandlerLoaded: boolean;
    __messageCreateHandlerLoaded: boolean;
    __messageDeleteHandlerLoaded: boolean;
    __messageUpdateHandlerLoaded: boolean;
    __messageReactionAddHandlerLoaded: boolean;
    __messageReactionRemoveHandlerLoaded: boolean;
    __PluginLoaderLoaded: boolean;
    __production: boolean;
    __listen: boolean;
    __reloadInProgress: boolean;
    __reloadModules: (message: import("discord.js").Message, args: string[]) => Promise<void>;
    client: import("discord.js").Client;
    CommandHandler: import("./discord/handlers/commandHandler").CommandHandler;
    LCRNG: import("./misc/lcrng").LCRNG;
    RNG: import("./misc/lcrng").PokeRNG;
    Utilities: import("./utilities").Utilities;
    DiscordConfig: Partial<typeof import("./discord/config-example")>;
    Storage: import("./storage").Storage;
    GuildMemberAddHandler: import("./discord/handlers/guildMemberAddHandler").GuildMemberAddHandler;
    GuildMemberRemoveHandler: import(
      "./discord/handlers/guildMemberRemoveHandler"
    ).GuildMemberRemoveHandler;
    MessageCreateHandler: import("./discord/handlers/messageCreateHandler").MessageCreateHandler;
    MessageDeleteHandler: import("./discord/handlers/messageDeleteHandler").MessageDeleteHandler;
    MessageUpdateHandler: import("./discord/handlers/messageUpdateHandler").MessageUpdateHandler;
    MessageReactionAddHandler: import(
      "./discord/handlers/messageReactionAddHandler"
    ).MessageReactionAddHandler;
    MessageReactionRemoveHandler: import(
      "./discord/handlers/messageReactionRemoveHandler"
    ).MessageReactionRemoveHandler;
    PluginsLoader: import("./discord/handlers/pluginsLoader").PluginsLoader;
    ReadyChecker: import("events").EventEmitter;
  }
}
