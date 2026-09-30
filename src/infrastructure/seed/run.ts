import config from '@payload-config'
import { getPayload } from 'payload'
import { seedPortfolio } from './seed-portfolio'

// `payload run` quitte le processus dès que ce module est évalué : le seed doit donc être attendu
// en top-level await (une promesse non attendue serait tuée avant de toucher la base).
const payload = await getPayload({ config })
const report = await seedPortfolio(payload)
console.log('Seed terminé :', report)
