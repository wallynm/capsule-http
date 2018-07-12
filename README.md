### Intro
This project is a wrapper from axios HTTP client

It exports a singleton and trought methods we can register API methods that are accessed later to apply the HTTP requests an treat them.

### Install

`yarn add request` or `npm instal request --save`

To use this package is quite simple, after installed you need to import and register the requests with an url

```js
// 1. Import the package
import Request from 'request'


// 2. Register api calls
Request.register("https://yourwebsite.com", {
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
Request.fetch('fetch.posts')

// 4. Pass parameters with the request
Request.fetch('fetch.posts', { id: 3 })
```

### Testing
Just run `yarn test` or `npm run test` and the command line will start a local server wich will be test every single route and parameters related to the js API.
