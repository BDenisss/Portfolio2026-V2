export const CONTACT_TOPICS = ['project', 'ai', 'job', 'other'] as const
export type ContactTopic = (typeof CONTACT_TOPICS)[number]
