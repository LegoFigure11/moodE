export const Aliases: KeyedDict<string, string> = {
  // Cool people
  "mica": "shaymin",
  "psychicj": "gardevoir",
  "xen": "qwilfish",
};

export function getAlias(args: string | undefined): string {
  const arg = Utilities.toId(args);
  if (Aliases[arg]) return Aliases[arg];
  return args || "";
}
