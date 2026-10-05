import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { Button } from '@pluginwoman/t-ds'
import { Circle } from '@pluginwoman/t-ds/icons'
import { Circle as Circle24 } from '@pluginwoman/t-ds/icons/24/Stroked'
import { Circle as Circle32 } from '@pluginwoman/t-ds/icons/32/Stroked'

const require = createRequire(import.meta.url)
const commonJs = require('@pluginwoman/t-ds')
const commonJsIcons = require('@pluginwoman/t-ds/icons')
const commonJsIconSubpath = require('@pluginwoman/t-ds/icons/24/Stroked')
const commonJsIcon32Subpath = require('@pluginwoman/t-ds/icons/32/Stroked')

for (const component of [Button, Circle, Circle24, Circle32, commonJs.Button, commonJsIcons.Circle, commonJsIconSubpath.Circle, commonJsIcon32Subpath.Circle]) {
  assert.equal(typeof component, 'function')
}

console.log('CommonJS and ESM package exports passed.')
