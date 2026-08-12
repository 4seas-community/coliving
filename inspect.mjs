import { read, utils } from 'xlsx'
import { readFileSync } from 'fs'

const buf = readFileSync('data/4SEAS-co-living-room-details-info-9adc9a.xlsx')
const workbook = read(buf, { cellDates: true })

console.log('Sheet names:', workbook.SheetNames)

for (const name of workbook.SheetNames) {
  console.log(`\n=== Sheet: ${name} ===`)
  const rows = utils.sheet_to_json(workbook.Sheets[name], { defval: null })
  console.log('Row count:', rows.length)
  console.log(JSON.stringify(rows.slice(0, 15), null, 2))
}
