const HEX_TOKEN = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g

/** Extrait les custom properties `--nom: #hex;` d'un fichier CSS (clé sans `--`). */
export function parseTokens(css: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const [, name, value] of css.matchAll(HEX_TOKEN)) {
    if (name && value) tokens[name] = value.toUpperCase()
  }
  return tokens
}
