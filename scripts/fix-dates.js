const fs = require('fs')
const path = require('path')

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')

  if (content.includes('new Date(evaluation.')) {
    content = content.replace(/new Date\(evaluation\./g, 'safeDate(evaluation.')

    if (!content.includes("import { safeDate } from '@/lib/utils/date'")) {
      content = "import { safeDate } from '@/lib/utils/date'\n" + content
    }

    fs.writeFileSync(filePath, content)
    console.log('Fixed:', filePath)
  }
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)

    if (
      full.includes('node_modules') ||
      full.includes('.next') ||
      full.includes('.git')
    ) {
      continue
    }

    if (fs.statSync(full).isDirectory()) {
      walk(full)
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      processFile(full)
    }
  }
}

walk('.')
