declare namespace NodeJS {
  interface Global {
    __listen: boolean;
    __reloadInProgress: boolean;
    __reloadModules: (message: import("discord.js").Message, args: string[]) => Promise<void>;
    CommandHandler: import("./discord/handlers/commandHandler").CommandHandler;
    Utilities: import("./utilities").Utilities;
    DiscordConfig: Partial<typeof import("./discord/config-example")>;
    Storage: import("./storage").Storage;
    MessageDeleteHandler: import("./discord/handlers/messageDeleteHandler").MessageDeleteHandler;
  }
}
