import assert from 'assert'
import {isRef, getRefKey} from './ref'

export function isObj (x) {
  return !!x && typeof x === 'object'
}

export function isMap (x) {
  return isObj(x) && !Array.isArray(x)
}

export function taskSeries (tasks) {
  return tasks.reduce((promise, task) => {
    return promise.then(() => task())
  }, Promise.resolve())
}

export function appendDep (chain, dep) {
  const message = `Circular refs are not allowed: ${chain.join('->')}->${dep}`
  assert(!chain.includes(dep), message)
  return [...chain, dep]
}

export function start (config, hooks, cache, path, key, value) {
  if (key && cache.hasOwnProperty(key)) {
    return cache[key]
  }

  const ifRoot = fn => dep => key ? fn(dep) : dep
  return Promise.resolve(value || config[key])
    .then(dep => {
      if (isRef(dep)) {
        const depKey = getRefKey(dep)
        return start(config, hooks, cache, appendDep(path, depKey), depKey)
      }
      if (isObj(dep)) {
        return Object.keys(dep).reduce((promise, childKey) => (
          promise.then(obj => {
            const nextPath = appendDep(path, `${key}.${childKey}`)
            const value = dep[childKey]
            return start(config, hooks, cache, nextPath, null, value)
              .then(value => {
                obj[childKey] = value
                return obj
              })
          })
        ), Promise.resolve({}))
      }
      return dep
    })
    .then(ifRoot(dep => {
      const startHook = hooks[key]
      return startHook ? startHook(dep) : dep
    }))
    .then(ifRoot(dep => {
      cache[key] = dep
      return dep
    }))
}

export function stop (config, hooks, cache, key, value) {
  if (!key) {
    if (isRef(value)) {
      return stop(config, hooks, cache, getRefKey(value))
    }
    if (isObj(value)) {
      return Object.keys(value).reduce((promise, key) => (
        promise.then(() => stop(config, hooks, cache, null, value[key]))
      ), Promise.resolve())
    }
    return Promise.resolve()
  }

  if (!cache.hasOwnProperty(key)) {
    return Promise.resolve()
  }

  value = cache[key]
  delete cache[key]

  const stopHook = hooks[key]
  return Promise.resolve()
    .then(() => stopHook && stopHook(value))
    .then(() => stop(config, hooks, cache, null, config[key]))
}
