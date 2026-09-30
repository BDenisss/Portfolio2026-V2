import { STACK_CATEGORIES, type Stack, type StackCategory } from './stack'

export type StackGroup = { readonly category: StackCategory; readonly stacks: readonly Stack[] }

/** Ordre des groupes = `STACK_CATEGORIES` ; catégories vides omises ; ordre d'entrée conservé. */
export function groupStacksByCategory(stacks: readonly Stack[]): StackGroup[] {
  return STACK_CATEGORIES.map((category) => ({
    category,
    stacks: stacks.filter((stack) => stack.category === category),
  })).filter((group) => group.stacks.length > 0)
}
