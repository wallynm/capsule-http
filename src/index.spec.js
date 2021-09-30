const { Capsule } = require('..')
const jsonServer = require('json-server')

const app = require('./test/server') // Link to your server file
const supertest = require('supertest')
const request = supertest(app)

const server = jsonServer.create()
const router = jsonServer.router(__dirname + '/utils/db.json')
const PORT = 3008
const baseURL = `http://localhost:${PORT}`
jest.setTimeout(1000)

Capsule.register(baseURL, {
  get: {
    'fetch.posts': '/posts/:id',
    'fetch.post': '/post',
    'fetch.mongodb.post': '/posts/3',
    'fetch.get.error': '/error'
  },
  post: {
    'insert.post': '/posts'
  },
  patch: {
    'update.post': '/posts/:id'
  },
  delete: {
    'remove.post': '/posts/:id'
  }
})
// Register api calls

function randString() {
  return (+new Date * Math.random()).toString(36).substring(0,6)  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Basic API execution', () => {
  beforeAll(() => {
    server.use(router)
    const ServerInstance = server.listen(PORT)
  })
  afterAll(() => ServerInstance.close())

  describe('GET method', () => {
    it('should execute with success', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 1})
      expect(result).toEqual(expect.objectContaining({title: "json-server", id: 1}))
    })

    it('should return the object data', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 2})
      expect(typeof result).toEqual('object')
    })

    it('should execute GET method with success and retrieve data', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 3})
      expect(typeof result).toEqual('object')
      expect(result).toEqual(expect.objectContaining({title: "4pr148", id: 3}))
    })

    it('should return object even using fixed params', async () => {  
      const result = await Capsule.request('fetch.mongodb.post')
      expect(typeof result).toEqual('object')
    })

    it('should include all properties', async () => {
      const result = await Capsule.request('fetch.posts', { id: 4 })
      expect(result).toEqual(expect.objectContaining({title: "Test"}))
    })

    it('should apply query params correctly', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 5 })
      expect(result).toEqual(expect.objectContaining({title: "Test 5"}))
    })

    it('should apply query params correctly', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 6 })
      expect(result).toEqual(expect.objectContaining({title: "Test 6"}))
    })
  })

  describe('NodeJS Capsule Testing', () => {
    it('gets the test endpoint', async done => {
      const response = await request.get('/test')    
      expect(response.status).toBe(200)
      expect(response.body.url).toBe('https://httpbin.org/get')
      done()
    })

    it('gets the test endpoint', async done => {
      const result = await Capsule.request('fetch.posts',
        { id: 7 },
      )
      expect(result).toEqual(expect.objectContaining({title: "Test 7"}))
      done()
    })

    it('Ensures the request receives params correctly', async done => {
      const logSpy = jest.spyOn(Capsule.methods['fetch.posts'], 'request');
      await Capsule.request('fetch.posts',
        { id: 8, "title": "json-server" }
      )

      expect(logSpy).toBeCalledWith({
        "headers": {},
        "params": {"id": 8, "title": "json-server"},
        "url": "/posts/8"
      });
      done()
    })
    it('Ensures that dynamic request applies headers correctly', async done => {
      const logTest = jest.spyOn(Capsule.methods['fetch.posts'], 'request');
      await Capsule.request('fetch.posts', { id: 9}, { headers: {"X-Test-Config": true }})


      expect(logTest).toBeCalledWith({
        "headers": {"X-Test-Config": true},
        "params": {"id": 9},
        "url": "/posts/9"
      });
      done()
    })

    it('Ensures that default headers gets merged with custom headers', async done => {
      Capsule.config({
        headers: {
          'Test-Config': true
        }
      })
      
      const logA = jest.spyOn(Capsule.methods['fetch.posts'], 'request');
      await Capsule.request('fetch.posts', { id: 10}, { headers: {"Config": true }})

      expect(logA).toBeCalledWith(
        expect.objectContaining({
          "headers": { "Test-Config": true, "Config": true },
          "params": {"id": 10},
          "url": "/posts/10"
        })
      )

      done()
    })

    it('Ensures that custom headers have prefference over default ones', async done => {
      Capsule.config({
        headers: {
          'Test-Config': false
        }
      })
      
      const logA = jest.spyOn(Capsule.methods['fetch.posts'], 'request');
      await Capsule.request('fetch.posts', { id: 10}, { headers: {"Test-Config": true }})

      expect(logA).toBeCalledWith(
        expect.objectContaining({
          "headers": { "Test-Config": true },
          "params": {"id": 10},
          "url": "/posts/10"
        })
      )

      done()
    })
  })

  // describe('Caching data', () => {
  //   const stringToBeCached = randString()

  //   it('should keep the GET result cached', async () => {
  //     const cachedResult = await Capsule.request('fetch.posts', { id: 3}, { cache: 300 })
  //     await Capsule.request('update.post', { id: 3, title: stringToBeCached })
  //     const normalResult = await Capsule.request('fetch.posts', { id: 3 })
  //     expect(cachedResult).toEqual(normalResult)
  //   })

  //   it('should have same value as first cache GET', async () => {
  //     const normalResult = await Capsule.request('fetch.posts', { id: 3 })
  //     expect(normalResult.title).not.toEqual(stringToBeCached)
  //   })

  //   it('should clean cache correctly with flag "cache" false', async () => {
  //     const noCacheResult = await Capsule.request('fetch.posts', { id: 3}, { cache: false })
  //     expect(stringToBeCached).toEqual(noCacheResult.title)
  //   })

  //   it('should clean cache correctly after defined time', async () => {
  //     const newString = randString()
  //     const cachedResult = await Capsule.request('fetch.posts', { id: 3}, { cache: 0.1, forceUpdate: true })
  //     await Capsule.request('update.post', { id: 3, title: newString })
  //     await sleep(100)
  //     const normalResult = await Capsule.request('fetch.posts', { id: 3 })
  //     expect(cachedResult).not.toEqual(normalResult)
  //   })
  // })
})
