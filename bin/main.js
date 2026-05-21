#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import spawn from 'cross-spawn'

const templateDir = path.resolve(import.meta.dirname, '../template')
const targetDir = process.cwd()

const files = fs.readdirSync(targetDir)
if (files.length > 0) {
  console.error('空のディレクトリで実行してください。処理を停止します。')
  console.error(
    '既に作成したプロジェクトの場合は、代わりに npm start を実行してください。',
  )
  process.exit(1)
}

copyDirectory(templateDir, targetDir)

console.log('> npm i')
runNpmCommand('i')

console.log('> npm start')
runNpmCommand('start')

function copyDirectory(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
    } else {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

function runNpmCommand(command) {
  const result = spawn.sync('npm', [command], {
    cwd: targetDir,
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status)
  }
}
