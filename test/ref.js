import test from 'ava'
import {createRef, isRef, getRefKey} from '../src/ref'

test('createRef() accepts only a single string arg', t => {
  t.throws(() => createRef(8))
  t.throws(() => createRef('foo', 'bar'))
  t.notThrows(() => createRef('foo'))
})

test('getRefKey() returns the key the ref is initialized with', t => {
  const key = 'foo'
  const ref = createRef(key)
  t.is(getRefKey(ref), key)
})

test('isRef() returns whether the arg is a ref', t => {
  const val = {ref: 'hello'}
  t.false(isRef(val))

  const ref = createRef('world')
  t.true(isRef(ref))
})
