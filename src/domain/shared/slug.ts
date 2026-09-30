const COMBINING_MARKS = /[̀-ͯ]/g
const APOSTROPHES = /['’]/g
const NON_ALPHANUMERIC_RUNS = /[^a-z0-9]+/g
const EDGE_DASHES = /^-+|-+$/g

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(APOSTROPHES, '')
    .replace(NON_ALPHANUMERIC_RUNS, '-')
    .replace(EDGE_DASHES, '')
}
