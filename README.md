# Introspec
Dependencies and configuration described through data.

```sh
npm install introspec
```

[![Build Status](https://travis-ci.org/andrejewski/introspec.svg?branch=master)](https://travis-ci.org/andrejewski/introspec)
[![Coverage Status](https://coveralls.io/repos/github/andrejewski/introspec/badge.svg?branch=master)](https://coveralls.io/github/andrejewski/introspec?branch=master)

## Why even?
Introspec is a variation of [Integrant](https://github.com/weavejester/integrant) for JavaScript. A [great talk](https://skillsmatter.com/skillscasts/9820-enter-integrant-a-micro-framework-for-data-driven-architecture-with-james-reeves) by the author of the framework goes into the details of why it simplifies system structure.

Re-iterating one main point here:

### Code obscures structure
Component systems often leave dependency injection to the code. For example, when component A needs component B to do its job.

```js
class B {}
class A {}

const b = new B({ username: 'bender', password: 'antiquing' })
const a = new A({ bot: b, debug: false, bug: true })
a.job()
```

The problem is that this dependency carries a lot of overhead configuring A. We know need to know the invocation of B, the instantiation order, what options both A and B need. Some of this is avoidable, but consider if we put this into a data structure instead.

```js
import {ref} from 'introspec'
export default {
  a: {
    bot: ref('b'), // ref points to a top key in the same config
    debug: false,
    bug: true
  },
  b: {
    username: 'bender',
    password: 'antiquing'
  }
}
```

The data structure isolates the dependencies and configuration. The invocation happens, unavoidably, in the code. We do stop caring *how* some B gets to some A. The other benefit is we can query our configuration in one place to get values like `b.username`.

## Documentation
Introspec has a three function API surface.

#### `ref`
- `ref(key: string)` returns an internal symbol for pointing to a top-level configuration value. This is the function that applies to building configurations.

#### `start`
- `start(key: string, startFn: (options: map) -> Promise<service: any>)` assigns a startup hook to the top-level config property with the given `key` which calls with its instantiated `options` when that property resolves for usage.

- `start(config: object, entryPoints: Array<string>) completion: Promise<system>` resolves the dependency graph for top-level `entryPoints`, applying the startup hooks for the respective dependencies, and returns a promise which resolves with a started `system` reference.

#### `stop`
- `stop(key: string, stopFn: (service: any) -> Promise<_: any>)` assigns a shutdown hook to the top-level config property with the given `key` which calls with the startup result when that property resolves for destruction.

- `stop(system) completion: Promise` shuts down the `system` starting with the top-level `entryPoints`, applying the shutdown hooks for the respective dependencies, and returns a promise which resolves on completion.

### Non-global Introspecs
Introspec exports a default instance for convenience. Make Introspec instances with their own lifecycle hook registries and nest them at will.

```js
import {Introspec} from 'introspec'
const myIntrospec = new Introspec()

myIntrospec.ref('b')
myIntrospec.start({ b: 'cake' }, ['b']).then(system => {
  return myIntrospec.stop(system)
})
```

## Introspec IRL
For larger projects, this data structure based dependency graph shines.

Imagine the following application:

- Five services: a HTTP(S) webserver, Redis connection, Postgres connection, email client, and payments API.
- The webserver uses the four other services handling requests.
- The email client needs Redis for storing email link tokens.
- The payments API needs both Redis and Postgres for persistence.

```js
import {ref, start, stop} from 'introspec'

/*
  Environment variables and intermediate transformations are fine.
  Configs are plain data structures after all.
*/
const config = {
  webserver: {
    port: 8080,
    cache: ref('redis'),
    database: ref('postgres'),
    email: ref('email'),
    payments: ref('payments')
  },
  redis: 'redis://...',
  postgres: 'postgres://...',
  email: {
    from: 'introspec@example.com',
    redis: ref('redis')
  },
  payments: {
    apiKey: 'xkcd12b4ucab',
    cache: ref('redis'),
    database: ref('postgres')
  }
}

/*
  Start/stop hooks can fit anywhere, preferably with
  the relevant code (which I was too lazy to mock here).
*/
start('webserver', ({port, cache, database, email, payments}) => {})
stop('webserver', webserver => {})

start('redis', uri => {})
stop('redis', connection => {})

start('postgres', uri => {})
stop('postgres', connection => {})

start('email', ({from, redis}) => {})
stop('email', client => {})

start('payments', ({apiKey, cache, database}) => {})
stop('payments', service => {})

start(config, ['webserver']).then(app => {
  return stop(app) // sometime later
})
```

## Contributing
Contributions are incredibly welcome as long as they are standardly applicable and pass the tests (or break bad ones). Tests are in AVA.

```bash
# running tests
npm run test
```

Follow me on [Twitter](https://twitter.com/compooter) for updates or for the lolz and please check out my other [repositories](https://github.com/andrejewski) if I have earned it. I thank you for reading.
