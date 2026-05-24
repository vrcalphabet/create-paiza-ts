#!/usr/bin/env node
import type { StdioOptions } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline'
import { PassThrough } from 'node:stream'
import { regex } from 'arkregex'
import spawn from 'cross-spawn'

const templateDir = path.resolve(import.meta.dirname, '../template')
const targetDir = process.cwd()

const files = await fs.readdir(targetDir)
if (files.length > 0) {
  console.error('空のディレクトリで実行してください。処理を停止します。')
  console.error(
    '既に作成したプロジェクトの場合は、代わりに npm start を実行してください。',
  )
  process.exit(1)
}

await copyDirectory(templateDir, targetDir)

console.log('> npm i')
await runNpmCommand(['i', '--loglevel=info'], 'pipe', (line) => {
  if (line.startsWith('npm info')) return

  if (line.startsWith('npm http')) {
    const m1 = regex('^npm http (?:fetch|cache)(?: \\w+ \\d+)? (?<url>[^ ]+)').exec(
      line,
    )?.groups
    if (!m1) return

    if (m1.url.endsWith('.tgz')) {
      const m2 = regex(
        '/?(.+)@https?://[^/]+/(?<name>.+)/-/\\1-(?<version>.+)\\.tgz',
      ).exec(m1.url)?.groups
      if (!m2) return

      console.log(`依存関係をインストール中: ${m2.name}@${m2.version}`)
    }

    return
  }

  console.log(line)
})

console.log('> npm start')
await runNpmCommand(['start'], 'inherit')

async function copyDirectory(sourceDir: string, targetDir: string) {
  await fs.mkdir(targetDir, { recursive: true })
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath)
    } else {
      await fs.copyFile(sourcePath, targetPath)
    }
  }
}

async function runNpmCommand(
  command: string[],
  stdio: StdioOptions,
  callback?: (line: string) => void,
) {
  await new Promise<void>((resolve) => {
    const child = spawn.spawn('npm', command, {
      cwd: targetDir,
      stdio: stdio,
    })

    if (stdio === 'pipe' && callback) {
      const combined = new PassThrough()
      child.stdout!.pipe(combined)
      child.stderr!.pipe(combined)

      const rl = readline.createInterface({ input: combined, terminal: false })

      ;(async () => {
        for await (const line of rl) {
          callback(line)
        }
      })()
    }

    child.on('close', (code) => {
      if (code !== 0) process.exit(code)
      resolve()
    })
  })
}
