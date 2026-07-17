// ここにはチャレンジ問題のコードを書く
import { parseInput } from '@vrcalphabet/paiza-ts-input-parser'

const $ = parseInput(`
  +n
  logs[type={C|R|U|D}, name, +time][n]
`)

const typeMap = {
  C: 'CREATE',
  R: 'READ',
  U: 'UPDATE',
  D: 'DELETE',
}

//! コメントを提出後のコードに残したい場合は、びっくりマークを付ける
// このコメントは提出後のコードに残らない
for (const log of $.logs) {
  const time = new Date(log.time * 1000).toLocaleString('ja-JP')
  const type = typeMap[log.type]
  console.log(`[${time}] ${type}: ${log.name}`)
}
