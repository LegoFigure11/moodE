import type {GuildBan, GuildMember, Message, MessageReaction, User} from "discord.js";

export interface IEventDefinition<IEvent> {
  event: Dict<IEvent>;
}

interface IEvent {
  users?: string[];

  priority?: number;
  disabled?: boolean;

  commandPermissions?: number[];
  userPermissons?: number;

  pmOnly?: boolean;
  noPm?: boolean;

  process: (message: Message) => Promise<Message>;
  onLoad?: void;
}

interface IGuildMemberAddRemoveEvent {
  users?: string[];

  priority?: number;
  disabled?: boolean;

  commandPermissions?: number[];
  userPermissons?: number;

  pmOnly?: boolean;
  noPm?: boolean;

  process: (member: GuildMember) => Promise<GuildMember>;
  onLoad?: void;
}

interface IGuildBanEvent {
  users?: string[];

  priority?: number;
  disabled?: boolean;

  commandPermissions?: number[];
  userPermissons?: number;

  pmOnly?: boolean;
  noPm?: boolean;

  process: (ban: GuildBan) => Promise<GuildBan>;
  onLoad?: void;
}

interface IMessageUpdateEvent {
  users?: string[];

  priority?: number;
  disabled?: boolean;

  commandPermissions?: number[];
  userPermissons?: number;

  pmOnly?: boolean;
  noPm?: boolean;

  process: (oldMessage: Message, newMessage: Message) => Promise<Message>;
  onLoad?: void;
}

interface IMessageReactionEvent {
  users?: string[];

  priority?: number;
  disabled?: boolean;

  commandPermissions?: number[];
  userPermissons?: number;

  pmOnly?: boolean;
  noPm?: boolean;

  process: (messageReaction: MessageReaction, user: User) => Promise<MessageReaction>;
  onLoad?: void;
}
