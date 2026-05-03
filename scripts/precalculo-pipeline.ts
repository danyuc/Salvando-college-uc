import { execSync } from 'node:child_process'

execSync('npx tsx scripts/fix-precalculo-questions.ts', { stdio: 'inherit' })
execSync('npx tsx scripts/validate-precalculo-questions.ts', { stdio: 'inherit' })
execSync('npx tsx scripts/upload-precalculo-questions.ts', { stdio: 'inherit' })
