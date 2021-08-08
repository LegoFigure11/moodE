import type {Message} from "discord.js";

export interface ICommandDefinition<ICommand> {
  command: Dict<ICommand>;
}

interface ICommand {
  usage?: string;
  aliases?: string[];
  desc?: string;
  longDesc?: string;

  users?: string[];

  disabled?: boolean;

  commandPermissions?: bigint[];
  userPermissions?: number;

  nsfw?: boolean;
  pmOnly?: boolean;
  noPm?: boolean;

  command: (message: Message, args: string[], permissions?: string[] | string) => void;
  onLoad?: void;
}
