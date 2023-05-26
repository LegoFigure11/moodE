import * as path from "path";

import type {IPlugin} from "../../types/plugins";

export class PluginsLoader {
  pluginsDirectory: string = path.join(Utilities.discordFolder, "plugins");
  private plugins: Dict<IPlugin> = {};

  onReload(previous: Partial<PluginsLoader>): void {
    // @ts-expect-error
    for (const i in previous.plugins) {
      // @ts-expect-error
      previous[i]?.unload();
    }
    for (const i in previous) {
      // @ts-expect-error
      delete previous[i];
    }

    this.loadPlugins().catch(e => console.error(e));
  }

  async loadPlugins(directory: string = this.pluginsDirectory): Promise<void> {
    const plugins: Dict<IPlugin> = {};
    for await (const file of Utilities.getFiles(directory)) {
      if (!file.endsWith(".js")) continue;
      const pluginName = path.basename(file).split(".")[0];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const plugin = require(file) as IPlugin;
      if (pluginName !== Utilities.toId(pluginName)) {
        console.error(
          Utilities.discordText(`"${pluginName}" is not a valid plugin name! Skipping...`)
        );
        continue;
      }
      plugins[pluginName] = plugin;
      if (plugin.onLoad) plugin.onLoad();
    }
    this.plugins = plugins;
    __PluginLoaderLoaded = true;
    ReadyChecker.emit("loaded");
  }
}

export const instantiate = (): void => {
  const oldLoader = global.PluginsLoader as PluginsLoader | undefined;

  global.PluginsLoader = new PluginsLoader();

  if (oldLoader) {
    global.PluginsLoader.onReload(oldLoader);
  }
};
