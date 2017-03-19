import test from 'ava'
import introspec, {ref, start, stop} from '../src/index'
import {isRef} from '../src/ref'

test.beforeEach(t => {
  // HACK: reset the global
  introspec._lifecycle.reset()
})

test('ref(name) returns a Ref instance', t => {
  const aRef = ref('hello')
  t.true(isRef(aRef))
})

test('start(name, startFn) should add a lifecycle hook', t => {
  let called = false
  start('main', num => {
    t.is(num, 1)
    called = true
    return Promise.resolve('Cake')
  })

  const config = {main: 1}
  return start(config, ['main']).then(() => {
    t.is(called, true)
  })
})

test('stop(name, stopFn) should add a lifecycle hook', t => {
  start('main', () => 1)

  let called = false
  stop('main', num => {
    t.is(num, 1)
    called = true
  })

  const config = {main: 4}
  return start(config, ['main']).then(system => {
    return stop(system).then(() => {
      t.true(called)
    })
  })
})
