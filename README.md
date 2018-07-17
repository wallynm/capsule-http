### Intro
This project is a wrapio from axios HTTP client implemeted with better API organizations and also featured with cache support using external package ["axios-extensions"](https://github.com/kuitos/axios-extensions#cacheadapterenhancer)


It exports a singleton and trought methods we can register API methods that are accessed later to apply the HTTP requests an treat them.

### Install

`yarn add capsule-http` or `npm instal capsule-http --save`

To use this package is quite simple, after installed you need to import and register the requests with an url

```js
// 1. Import the package
import Capsule from 'capsule-http'


// 2. Register api calls
Capsule.register("https://yourwebsite.com", {
  get: {
    'fetch.posts': '/posts/:id',
    'fetch.post': '/post',
    'fetch.mongodb.post': '/posts/3',
  },
  post: {
    'update.posts': '/posts/:id'
  },
  put: {
    'insert.posts': '/posts/:id'
  },
  delete: {
    'remove.post': '/posts/:id'
  }
})

// 3. Execute the request
Capsule.request('fetch.posts')

// 4. Pass parameters with the request
Capsule.request('fetch.posts', { id: 3 })
```

While executing the requests is also an options object, passed after params which you can pass aditional info to the requests like headers, timeout, auth data or any other axios [config specific](https://github.com/axios/axios#request-config)

There's olny two configs that are not listed into axios that's caching data, this wrapper come with axios-extension cache adapter to handle cache requests, to take advantage of just pass the time in seconds of the cache as option parameter:
```js
// If you want, you can also set a cache handler to optimize requests (ex: 10 minutes)
Capsule.request('fetch.posts', { id: 3 }, { cache: 600 })
```
The default it's configured as 5 minutes but you can pass any time that you wish

You can make a request without cache, this way the cache keeps working but your request answer without it
```js
Capsule.request('fetch.posts', { id: 3 }, { cache: false })
```

You can also force the cache to be cleaned using a flag `forceUpdate` to remove it or updated it's ttl
```js
Capsule.request('fetch.posts', { id: 3 }, { forceUpdate: true, cache: false })
// or
Capsule.request('fetch.posts', { id: 3 }, { forceUpdate: true, cache: 500 })
```

### Testing
Just run `yarn test` or `npm run test` and the command line will start a local server wich will be test every single route and parameters related to the js API.


### Improvements

The package 'axios-extesions' provides also an throttleAdapterEnhancer designed to help multiples requests return same data without any aditional check, just returning the same response did in the last second.

This adapter wasn't implemented yet because need extensive tests related on how it would perform in a node server to handle not just client side requests but also backend requests.