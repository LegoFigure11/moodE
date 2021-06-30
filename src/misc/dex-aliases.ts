export const Aliases: KeyedDict<string, string> = {
  // Typos
  "delibirb": "delibird",

  // Cool people
  "archie": "jirachi",
  "lego": "eldegoss",
  "mica": "shaymin",
  "onion": "eldegoss",
  "psychicj": "gardevoir",
  "saiph": "gengar",
  "xen": "qwilfish",

  // Dex Numbers
  "360": "wynaut",
};

export function getAlias(args: string | undefined): string {
  const arg = Utilities.toId(args);
  if (Aliases[arg]) return Aliases[arg];
  return args || "";
}
