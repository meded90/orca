import { expect, it, vi } from 'vitest'

const callRuntimeResult = vi.hoisted(() => vi.fn())

vi.mock('./web-runtime-calls', () => ({ callRuntimeResult }))

import { createGitLabApi } from './web-gitlab-api'

it('aborts host work for a cancelled item without cancelling another dialog', async () => {
  const signals = new Map<string, AbortSignal>()
  callRuntimeResult.mockImplementation(
    (_method, params: { iid: number }, _timeout, signal: AbortSignal) => {
      signals.set(String(params.iid), signal)
      return new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('cancelled')), { once: true })
      })
    }
  )
  const api = createGitLabApi()
  const first = api.workItemDetails({
    repoPath: '/repo',
    iid: 1,
    type: 'issue',
    requestToken: 'one',
    includeImages: true
  })
  const second = api.workItemDetails({
    repoPath: '/repo',
    iid: 2,
    type: 'issue',
    requestToken: 'two'
  })
  const firstRejected = expect(first).rejects.toThrow('cancelled')
  await api.cancelWorkItemDetails({ requestToken: 'one' })
  await firstRejected
  expect(signals.get('1')?.aborted).toBe(true)
  expect(signals.get('2')?.aborted).toBe(false)
  const secondRejected = expect(second).rejects.toThrow('cancelled')
  await api.cancelWorkItemDetails({ requestToken: 'two' })
  await secondRejected
})
