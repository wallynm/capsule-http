const { Capsule } = require('../../dist/capsule-http.cjs')

Capsule.register('https://httpbin.org', {
  get: {
    'fetch.basic': {
      url: '/get'
    }
  }
})
