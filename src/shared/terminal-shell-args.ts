/**
 * Splits a shell arguments string into separate tokens, respecting single and double quotes.
 */
export function parseShellArgs(input: string): string[] {
  const args: string[] = []
  let current = ''
  let inDouble = false
  let inSingle = false

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle
    } else if (ch === ' ' && !inDouble && !inSingle) {
      if (current) {
        args.push(current)
        current = ''
      }
    } else {
      current += ch
    }
  }
  if (current) {
    args.push(current)
  }
  return args
}

/**
 * Resolves effective shell arguments from an optional user-configured argument string.
 * Returns ['-l'] if unconfigured, or the parsed argument list if explicitly configured.
 */
export function resolveDefaultShellArgs(configuredArgs: string | undefined): string[] {
  if (configuredArgs === undefined) {
    return ['-l']
  }
  return parseShellArgs(configuredArgs.trim())
}
