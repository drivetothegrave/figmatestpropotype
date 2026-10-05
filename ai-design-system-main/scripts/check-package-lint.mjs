import { execFileSync } from 'node:child_process'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import typescriptEslint from '@typescript-eslint/eslint-plugin'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const temporaryDirectory = await mkdtemp(join(tmpdir(), 't-ds-package-lint-'))

async function findCommonJsFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return findCommonJsFiles(path)
    return entry.isFile() && path.endsWith('.cjs') ? [path] : []
  }))
  return nested.flat()
}

try {
  const packOutput = execFileSync('npm', [
    'pack', '--pack-destination', temporaryDirectory, '--ignore-scripts', '--json',
  ], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: join(temporaryDirectory, 'npm-cache') },
  })
  const [{ filename }] = JSON.parse(packOutput)
  execFileSync('tar', ['-xzf', join(temporaryDirectory, filename), '-C', temporaryDirectory])

  const packageDirectory = join(temporaryDirectory, 'package')
  const files = await findCommonJsFiles(packageDirectory)
  if (files.length === 0) throw new Error('The package contains no CommonJS files.')

  const eslint = new ESLint({
    cwd: packageDirectory,
    overrideConfigFile: true,
    overrideConfig: [{
      files: ['**/*.cjs'],
      languageOptions: { sourceType: 'commonjs' },
      plugins: { '@typescript-eslint': typescriptEslint },
      rules: { '@typescript-eslint/no-require-imports': 'error' },
    }],
  })

  const [control] = await eslint.lintText('require("react")', {
    filePath: join(packageDirectory, 'lint-control.cjs'),
  })
  if (!control.messages.some(({ ruleId }) => ruleId === '@typescript-eslint/no-require-imports')) {
    throw new Error('The ESLint control did not detect a require() import.')
  }

  const results = await eslint.lintFiles(files)
  const formatter = await eslint.loadFormatter('stylish')
  const output = formatter.format(results)
  if (output) process.stdout.write(output)
  if (results.some(({ errorCount, fatalErrorCount }) => errorCount || fatalErrorCount)) {
    process.exitCode = 1
  } else {
    console.log(`ESLint passed for all ${files.length} packaged .cjs files.`)
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}
