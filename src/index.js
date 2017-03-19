import {createRef} from './ref'
import Lifecycle from './lifecycle'
import SystemManager from './system'

export class Introspec {
  constructor () {
    this._lifecycle = new Lifecycle()
    this._system = new SystemManager(this._lifecycle)
  }

  ref () { return createRef(...arguments) }

  start (x) {
    if (typeof x === 'string') {
      return this._lifecycle.start(...arguments)
    }
    return this._system.start(...arguments)
  }

  stop (x) {
    if (typeof x === 'string') {
      return this._lifecycle.stop(...arguments)
    }
    return this._system.stop(...arguments)
  }
}

const defaultIntrospect = new Introspec()
export default defaultIntrospect

export function ref () {
  return defaultIntrospect.ref(...arguments)
}

export function start () {
  return defaultIntrospect.start(...arguments)
}

export function stop () {
  return defaultIntrospect.stop(...arguments)
}
