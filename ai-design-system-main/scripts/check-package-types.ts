import { Button } from '@pluginwoman/t-ds'
import { Circle } from '@pluginwoman/t-ds/icons'
import { ChevronDown as ChevronDown12 } from '@pluginwoman/t-ds/icons/12/Filled'
import { Checkmark as Checkmark16 } from '@pluginwoman/t-ds/icons/16/Stroked'
import { Bell as Bell16 } from '@pluginwoman/t-ds/icons/16/Filled'
import { CrossCircle as CrossCircle20 } from '@pluginwoman/t-ds/icons/20/Filled'
import { Checkmark as Checkmark20 } from '@pluginwoman/t-ds/icons/20/Stroked'
import { QuestionCircle } from '@pluginwoman/t-ds/icons/20/Stroked1px'
import { FileCsv } from '@pluginwoman/t-ds/icons/20/Graphic'
import { Circle as Circle24 } from '@pluginwoman/t-ds/icons/24/Stroked'
import { Acquiring as Acquiring24 } from '@pluginwoman/t-ds/icons/24/Filled'
import { Circle as Circle32 } from '@pluginwoman/t-ds/icons/32/Stroked'
import { Acquiring as Acquiring32 } from '@pluginwoman/t-ds/icons/32/Filled'

type ButtonComponent = typeof Button
type IconComponent = typeof Circle
type IconSubpathComponents = [
  typeof ChevronDown12,
  typeof Checkmark16,
  typeof Bell16,
  typeof CrossCircle20,
  typeof Checkmark20,
  typeof QuestionCircle,
  typeof FileCsv,
  typeof Circle24,
  typeof Acquiring24,
  typeof Circle32,
  typeof Acquiring32,
]

export type PackageExports = [ButtonComponent, IconComponent, ...IconSubpathComponents]
