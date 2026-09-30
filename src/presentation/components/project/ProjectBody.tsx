import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { RichTextDocument } from '@/domain'
import styles from './ProjectBody.module.css'

/** Seul endroit qui sait lire l'étude de cas : pour le domaine, c'est un document opaque. */
export function ProjectBody({ caseStudy }: { caseStudy: RichTextDocument | null }) {
  if (!caseStudy) return null
  return <RichText data={caseStudy as unknown as SerializedEditorState} className={styles.body} />
}
