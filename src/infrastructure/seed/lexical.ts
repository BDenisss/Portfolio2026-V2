import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

const LEXICAL_VERSION = 1

const textNode = (text: string) => ({
  type: 'text',
  text,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: LEXICAL_VERSION,
})

const paragraphNode = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: LEXICAL_VERSION,
  direction: 'ltr',
  textFormat: 0,
  textStyle: '',
  children: [textNode(text)],
})

export function lexicalFromParagraphs(paragraphs: readonly string[]): SerializedEditorState {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: LEXICAL_VERSION,
      direction: 'ltr',
      children: paragraphs.map(paragraphNode),
    },
  } as unknown as SerializedEditorState
}
