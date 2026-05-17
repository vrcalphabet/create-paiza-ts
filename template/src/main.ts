// ここにはチャレンジ問題のコードを書く
import fs from 'node:fs'

const lines = fs.readFileSync(0, 'utf8').split('\n')
console.log(lines[0]!)
