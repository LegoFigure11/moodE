declare namespace NodeJS {
  interface Global {
    __clientReady: boolean;
    __commandsLoaded: boolean;
    __guildBanAddHandlerLoaded: boolean;
    __guildBanRemoveHandlerLoaded: boolean;
    __guildMemberAddHandlerLoaded: boolean;
    __guildMemberRemoveHandlerLoaded: boolean;
    __guildMemberUpdateHandlerLoaded: boolean;
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
    CSRNG: import("./misc/csrng").CSRNG;
    RNG: import("./misc/lcrng").PokeRNG;
    Utilities: import("./utilities").Utilities;
    DiscordConfig: Partial<typeof import("./discord/config-example")>;
    Storage: import("./storage").Storage;
    GuildBanAddHandler: import("./discord/handlers/guildBanAddHandler").GuildBanAddHandler;
    GuildBanRemoveHandler: import("./discord/handlers/guildBanRemoveHandler").GuildBanRemoveHandler;
    GuildMemberAddHandler: import("./discord/handlers/guildMemberAddHandler").GuildMemberAddHandler;
    GuildMemberRemoveHandler: import(
      "./discord/handlers/guildMemberRemoveHandler"
    ).GuildMemberRemoveHandler;
    GuildMemberUpdateHandler: import(
      "./discord/handlers/guildMemberUpdateHandler"
    ).GuildMemberUpdateHandler;
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
