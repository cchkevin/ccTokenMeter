import { expect, test } from 'claude-code/testing'

import { register } from './register'

test('registers without error', ($, on) => {
  expect(typeof register).toBe('function')
})
