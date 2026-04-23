import load from './load'

const PATH = '--path'
const VERSION = '--version'

const { argv = [] }: { argv: string[] } = process

const param = argv[2]

if (param === PATH) {
  load(argv[3]).run()
} else if (param === VERSION) {
  const pkg = require('../../../package.json') as { version: string }
  console.log(pkg.version)
}
