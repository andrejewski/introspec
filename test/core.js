import test from 'ava'
import {isMap, taskSeries, start, stop} from '../src/core'
import {createRef} from '../src/ref'

test('isMap() should return whether the arg is a non-array object', t => {
  t.is(isMap(true), false)
  t.is(isMap([true]), false)
  t.is(isMap(null), false)
  t.is(isMap(undefined), false)
  t.is(isMap({}), true)
})

test('taskSeries() should call each task in order', t => {
  const order = []
  const tasks = [
    () => { order.push(1); return Promise.resolve() },
    () => { order.push(2); return Promise.resolve() },
    () => { order.push(3); return Promise.resolve() }
  ]

  return taskSeries(tasks).then(() => {
    t.deepEqual(order, [1, 2, 3])
  })
})

test('start() should fill `cache` with primitives', t => {
  const config = {
    main: 'foo',
    test: 'bar'
  }
  const hooks = {}
  const cache = {}
  const path = []
  const key = 'main'

  return start(config, hooks, cache, path, key).then(() => {
    t.deepEqual(cache, {main: 'foo'})
  })
})

test('start() should fill `cache` with nested maps of primitives', t => {
  const config = {
    main: {
      foo: 1,
      bar: 2
    },
    test: 3
  }
  const hooks = {}
  const cache = {}
  const path = []
  const key = 'main'
  return start(config, hooks, cache, path, key).then(() => {
    t.deepEqual(cache, {
      main: {
        foo: 1,
        bar: 2
      }
    })
  })
})

test('start() should fill `cache` with resolved references', t => {
  const config = {
    main: {
      foo: 1,
      bar: createRef('test')
    },
    test: 2
  }
  const hooks = {}
  const cache = {}
  const path = []
  const key = 'main'
  return start(config, hooks, cache, path, key).then(() => {
    t.deepEqual(cache, {
      main: {
        foo: 1,
        bar: 2
      },
      test: 2
    })
  })
})

test('start() should use startup hooks for resolving root keys', t => {
  const config = {
    main: 1,
    test: 2
  }

  const hooks = {
    main: x => Promise.resolve(x + 4)
  }

  const cache = {}
  const path = []
  const key = 'main'
  return start(config, hooks, cache, path, key).then(() => {
    t.deepEqual(cache, {main: 5})
  })
})

test('start() should start depencencies only once', t => {
  const config = {
    a: {c: createRef('c')},
    b: {c: createRef('c')},
    c: 'test'
  }

  let count = 0
  const hooks = {
    c: () => count++
  }
  const cache = {}

  return Promise.resolve()
    .then(() => start(config, hooks, cache, [], 'a'))
    .then(() => start(config, hooks, cache, [], 'b'))
    .then(() => {
      t.is(count, 1)
    })
})

test('stop() should empty `cache` of primitives', t => {
  const config = {
    main: 'foo',
    test: 'bar'
  }
  const hooks = {}
  const cache = {}
  const path = []
  const key = 'main'

  return start(config, hooks, cache, path, key).then(() => {
    return stop(config, hooks, cache, key).then(() => {
      t.deepEqual(cache, {})
    })
  })
})

test('stop() should empty `cache` of nested maps of primitives', t => {
  const config = {
    main: {
      foo: 1,
      bar: 2
    },
    test: 3
  }
  const hooks = {}
  const cache = {}
  const path = []
  const key = 'main'
  return start(config, hooks, cache, path, key).then(() => {
    return stop(config, hooks, cache, key).then(() => {
      t.deepEqual(cache, {})
    })
  })
})

test('stop() should empty `cache` of resolved references', t => {
  const config = {
    main: {
      foo: 1,
      bar: createRef('test')
    },
    test: 2
  }
  const hooks = {}
  const cache = {}
  const path = []
  const key = 'main'
  return start(config, hooks, cache, path, key).then(() => {
    return stop(config, hooks, cache, key).then(() => {
      t.deepEqual(cache, {})
    })
  })
})

test('stop() should use stop hooks for shutting down root keys', t => {
  const config = {
    main: 1,
    test: 2
  }

  let hookCalled = false
  const hooks = {
    main: x => { hookCalled = true }
  }

  const cache = {}
  const path = []
  const key = 'main'
  return start(config, hooks, cache, path, key).then(() => {
    return stop(config, hooks, cache, key).then(() => {
      t.deepEqual(cache, {})
      t.true(hookCalled)
    })
  })
})

test('stop() should stop depencencies only once', t => {
  const config = {
    a: {c: createRef('c')},
    b: {c: createRef('c')},
    c: 'test'
  }

  let count = 0
  const hooks = {
    c: () => count++
  }
  const cache = {}

  return Promise.all([
    start(config, {}, cache, [], 'a'),
    start(config, {}, cache, [], 'b')
  ]).then(() => Promise.all([
    stop(config, hooks, cache, 'a'),
    stop(config, hooks, cache, 'b')
  ])).then(() => {
    t.deepEqual(cache, {})
    t.is(count, 1)
  })
})
