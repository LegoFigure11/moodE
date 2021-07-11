export const Aliases: KeyedDict<string, string> = {
  // Typos
  "delibirb": "delibird",

  // Cool people
  "anubis": "corviknight",
  "archie": "jirachi",
  "bluecake": "scorbunny",
  "lego": "eldegoss",
  "mica": "shaymin",
  "onion": "eldegoss",
  "psychicj": "gardevoir",
  "saiph": "gengar",
  "taylor": "nidoking",
  "tora": "luxray",
  "xen": "qwilfish",

  // Memes
  "boob": "rowlet",
  "god": "bidoof",

  // Dex Numbers
  "360": "wynaut",

  // Foreign Names
  "boober": "magmar",

  // Adam Nicknames
  "raijin": "luxio",
  "chomei": "staravia",
  "hmdog": "bidoof",
  "mokuton": "grotle",
  "goryuka": "ponyta",
};

export function getAlias(args: string | undefined): string {
  const arg = Utilities.toId(args);
  if (Aliases[arg]) return Aliases[arg];
  return args || "";
}
