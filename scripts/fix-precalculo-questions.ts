import fs from 'node:fs'

const file = 'data/precalculo-preguntas.ts'
let s = fs.readFileSync(file, 'utf8')

s = s
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/−/g, '-')
  .replace(/≤/g, '<=')
  .replace(/≥/g, '>=')
  .replace(/≠/g, '!=')
  .replace(/\]\s*export const questions\s*=\s*\[/g, ',')
  .replace(/P\(t\)=3002\^\(t\/5\)/g, 'P(t)=300*2^(t/5)')
  .replace(/3002\^\(t\/5\)/g, '300*2^(t/5)')
  .replace(/4\^\(2x\)-104\^x\+16/g, '4^(2x)-10*4^x+16')

fs.writeFileSync(file, s)
console.log('✅ Archivo limpiado automáticamente')
