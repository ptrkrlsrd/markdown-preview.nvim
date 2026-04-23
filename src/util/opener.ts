/*
 * fork from https://github.com/domenic/opener
 */
import childProcess from 'child_process'

module.exports = function opener(
  args: string | string[],
  tool: string | undefined
) {
  const platform = process.platform
  args = [].concat(args)

  let command
  switch (platform) {
    case 'darwin': {
      command = 'open'
      if (tool) {
        args.unshift(tool)
        args.unshift('-a')
      }
      break
    }
    default: {
      command = tool || 'xdg-open'
      break
    }
  }

  return childProcess.spawn(command, args, {
    shell: false,
    detached: true
  })
}
