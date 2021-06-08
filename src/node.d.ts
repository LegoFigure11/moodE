declare namespace NodeJS {
  interface Global {
    __clientReady: boolean;
    __commandsLoaded: boolean;
    __guildMemberAddHandlerLoaded: boolean;
    __messageDeleteHandlerLoaded: boolean;
    __messageUpdateHandlerLoaded: boolean;
    __production: boolean;
    __listen: boolean;
    __reloadInProgress: boolean;
    __reloadModules: (message: import("discord.js").Message, args: string[]) => Promise<void>;
    CommandHandler: import("./discord/handlers/commandHandler").CommandHandler;
    Utilities: import("./utilities").Utilities;
    DiscordConfig: Partial<typeof import("./discord/config-example")>;
    Storage: import("./storage").Storage;
    GuildMemberAddHandler: import("./discord/handlers/guildMemberAddHandler").GuildMemberAddHandler;
    MessageDeleteHandler: import("./discord/handlers/messageDeleteHandler").MessageDeleteHandler;
    MessageUpdateHandler: import("./discord/handlers/messageUpdateHandler").MessageUpdateHandler;
    ReadyChecker: import("events").EventEmitter;
  }
}
