import assert from 'assert'

export function createRef (key) {
  assert(arguments.length === 1, 'Arguments must be a single string argument')
  assert(typeof key === 'string', `First argument must be a string, not ${key}`)
  return {__introspecRef: key}
}

export function isRef (ref) {
  return typeof ref === 'object' && typeof ref.__introspecRef === 'string'
}

export function getRefKey (ref) {
  assert(isRef(ref), `ref must be a valid ref, not ${ref}`)
  return ref.__introspecRef
}
