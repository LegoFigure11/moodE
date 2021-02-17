interface IFriendCodeEntry {
  user: string;
  categories: Dict<string[]>;
}

export interface IDatabase {
  commands?: any;
  managers?: string[];
  elevated?: string[];
  name?: string;
  prefix?: string;
  fc?: Dict<IFriendCodeEntry[]>;
  global?: number;
  servers?: Dict<number>;
  gifs?: string[];
  events?: KeyedDict<string, Dict<string>>;
}
