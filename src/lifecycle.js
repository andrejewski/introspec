import assert from 'assert'

export default class Lifecycle {
  constructor () {
    this.reset()
  }

  copy () {
    const {start, stop} = this.db
    return {
      start: {...start},
      stop: {...stop}
    }
  }

  reset () {
    this.db = {
      start: {},
      stop: {}
    }
  }

  _addHook (group, name, func) {
    assert(typeof name === 'string')
    assert(typeof func === 'function')

    const existingHook = this.db[group][name]
    assert(!existingHook, `Multiple hooks cannot added to ${name}:${group}`)

    this.db[group][name] = func
  }

  start () { return this._addHook('start', ...arguments) }
  stop () { return this._addHook('stop', ...arguments) }
}
