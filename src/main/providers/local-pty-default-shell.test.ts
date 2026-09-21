import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLocalPtyLaunchPlan } from './local-pty-launch-plan'

vi.mock('./local-pty-utils', () => ({
  ensureNodePtySpawnHelperExecutable: vi.fn(),
  validateWorkingDirectory: vi.fn()
}))

afterEach(() => vi.unstubAllEnvs())

describe.skipIf(process.platform === 'win32')('default terminal shell', () => {
  it.each(['/bin/bash', '/bin/zsh', '/usr/bin/fish', '/usr/bin/nu'])(
    'uses the configured executable %s',
    (shell) => {
      const plan = createLocalPtyLaunchPlan({ cwd: '/tmp', cols: 80, rows: 24 }, () => ({
        getDefaultShell: () => shell
      }))
      expect(plan).toMatchObject({ shellPath: shell, shellArgs: ['-l'] })
    }
  )

  it('keeps an explicit per-terminal shell ahead of the default', () => {
    const plan = createLocalPtyLaunchPlan(
      { cwd: '/tmp', cols: 80, rows: 24, shellOverride: '/bin/bash' },
      () => ({
        getDefaultShell: () => '/usr/bin/fish'
      })
    )
    expect(plan).toMatchObject({ shellPath: '/bin/bash' })
  })

  it('uses the environment shell when no default is configured', () => {
    vi.stubEnv('SHELL', '/bin/zsh')
    const plan = createLocalPtyLaunchPlan({ cwd: '/tmp', cols: 80, rows: 24 }, () => ({
      getDefaultShell: () => ''
    }))
    expect(plan).toMatchObject({ shellPath: '/bin/zsh' })
  })

  it('supports empty shell arguments when configured', () => {
    const plan = createLocalPtyLaunchPlan({ cwd: '/tmp', cols: 80, rows: 24 }, () => ({
      getDefaultShell: () => '/bin/zsh',
      getDefaultShellArgs: () => []
    }))
    expect(plan).toMatchObject({ shellPath: '/bin/zsh', shellArgs: [] })
  })

  it('supports custom flags when configured', () => {
    const plan = createLocalPtyLaunchPlan({ cwd: '/tmp', cols: 80, rows: 24 }, () => ({
      getDefaultShell: () => '/bin/zsh',
      getDefaultShellArgs: () => ['-f', '-i']
    }))
    expect(plan).toMatchObject({ shellPath: '/bin/zsh', shellArgs: ['-f', '-i'] })
  })

  it('defaults shellArgs to login shell -l when unconfigured', () => {
    const plan = createLocalPtyLaunchPlan({ cwd: '/tmp', cols: 80, rows: 24 }, () => ({
      getDefaultShell: () => '/bin/zsh',
      getDefaultShellArgs: () => undefined
    }))
    expect(plan).toMatchObject({ shellPath: '/bin/zsh', shellArgs: ['-l'] })
  })
})
