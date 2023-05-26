import * as fs from "fs";
import * as path from "path";

import type {IDatabase} from "./types/databases";

export class Databases {
  // constants
  databasesDir: string = path.join(Utilities.rootFolder, "databases");
  loadedDatabases = false;
  reloadInProgress = false;

  private databases: Dict<IDatabase> = {};

  onReload(previous: Partial<Databases>): void {
    // @ts-expect-error
    if (previous.databases) Object.assign(this.databases, previous.databases);
    this.loadedDatabases = previous?.loadedDatabases as boolean;

    for (const i in previous) {
      // @ts-expect-error
      delete previous[i];
    }
  }

  // Functions
  getDatabase(id: string | undefined): IDatabase {
    if (!id) return {};
    if (!(id in this.databases)) this.databases[id] = {};
    return this.databases[id];
  }

  exportDatabase(id: string): void {
    if (!(id in this.databases)) return;
    const contents = JSON.stringify(this.databases[id]);
    Utilities.safeWriteFileSync(
      path.join(this.databasesDir, `${id}.json`),
      contents
    );
  }

  importDatabases(force?: boolean): void {
    if (this.loadedDatabases && !force) return;

    const files = fs.readdirSync(this.databasesDir);
    for (const fileName of files) {
      if (!fileName.endsWith(".json")) continue;
      const id = fileName.substr(0, fileName.indexOf(".json"));
      const file = fs
        .readFileSync(path.join(this.databasesDir, fileName))
        .toString();
      const database = JSON.parse(file) as IDatabase;
      this.databases[id] = database;
    }
    this.loadedDatabases = true;
  }
}

export const instantiate = (): void => {
  const oldDatabases = global.Databases as Databases | undefined;

  global.Databases = new Databases();

  if (oldDatabases) {
    global.Databases.onReload(oldDatabases);
  }
};
