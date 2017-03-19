import assert from 'assert'
import {
  isMap,
  taskSeries,
  start,
  stop
} from './core'

export default class SystemManager {
  constructor (lifecycle) {
    this.lifecycle = lifecycle
  }

  start (config, entryPoints) {
    assert(isMap(config), 'config must be a non-array object')
    assert(Array.isArray(entryPoints), 'entryPoints must be an array')
    assert(entryPoints.length > 0, 'there must be at least one entryPoint')

    const system = {
      config,
      entryPoints,
      lifecycle: this.lifecycle.copy(),
      cache: {}
    }
    return taskSeries(system.entryPoints.map(key => () => {
      start(system.config, system.lifecycle.start, system.cache, [], key)
    })).then(() => system)
  }

  stop (system) {
    return taskSeries(system.entryPoints.map(key => () => {
      stop(system.config, system.lifecycle.stop, system.cache, key)
    }))
  }
}
