const { Capsule } = require('..')
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router(__dirname + '/utils/db.json')
const PORT = 3008
const baseURL = `http://localhost:${PORT}`

// Register api calls
Capsule.register(baseURL, {
  get: {
    'fetch.posts': '/posts/:id',
    'fetch.post': '/post',
    'fetch.mongodb.post': '/posts/3',
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

  describe('register method domain', () => {
    it('should define baseURL', () => {
      expect(() => Capsule.register({get: {'fetch.posts': '/posts/:id'}}) ).to.throw("You must define the first parameter the baseURL.");
    })

    it('should allow register objects params', () => {
      Capsule.register(baseURL, {
        get: {
          'fetch.object.register': {
            url: '/posts/:id',
            data: { id: 2 }
          }
        }
      })

      expect(Capsule.methods['fetch.object.register']).to.exist
      expect(Capsule.methods['fetch.object.register'].defaults.url).toEqual('/posts/:id')
      expect(Capsule.methods['fetch.object.register'].defaults.data.id).toEqual(2)
    })
    
    it('shouldn\'t allow duplicated key names', () => {
      expect(() => Capsule.register(baseURL, {get: {'fetch.posts': '/posts/:id'}}) ).to.throw("The route fetch.posts already registered");
    })
  })

  describe('GET method', () => {
    it('should execute with success', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 1})
      expect(result).toEqual(expect.objectContaining({title: "json-server", id: 1}))
    })

    it('should return the object data', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 1})
      expect(typeof result).toEqual('object')
    })

    it('should execute GET method with success and retrieve data', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 1})
      expect(typeof result).toEqual('object')
      expect(result).toEqual(expect.objectContaining({title: "json-server", id: 1}))
    })

    it('should return object even using fixed params', async () => {  
      const result = await Capsule.request('fetch.mongodb.post')
      expect(typeof result).toEqual('object')
    })

    it('should include all properties', async () => {
      const result = await Capsule.request('fetch.posts', { id: 1, title: "json-server"})
      expect(result).toEqual(expect.objectContaining({title: "json-server"}))
    })

    it('should apply query params correctly', async () => {  
      const result = await Capsule.request('fetch.posts', { id: 1, title: "json-server"})
      expect(result).toEqual(expect.objectContaining({title: "json-server"}))
    })
  })

  describe('Caching data', () => {
    const stringToBeCached = randString()

    it('should keep the GET result cached', async () => {
      const cachedResult = await Capsule.request('fetch.posts', { id: 3}, { cache: 300 })
      await Capsule.request('update.post', { id: 3, title: stringToBeCached })
      const normalResult = await Capsule.request('fetch.posts', { id: 3 })
      expect(cachedResult).toEqual(normalResult)
    })

    it('should have same value as first cache GET', async () => {
      const normalResult = await Capsule.request('fetch.posts', { id: 3 })
      expect(normalResult.title).not.toEqual(stringToBeCached)
    })

    it('should clean cache correctly with flag "cache" false', async () => {
      const noCacheResult = await Capsule.request('fetch.posts', { id: 3}, { cache: false })
      expect(stringToBeCached).toEqual(noCacheResult.title)
    })

    it('should clean cache correctly after defined time', async () => {
      const newString = randString()
      const cachedResult = await Capsule.request('fetch.posts', { id: 3}, { cache: 0.1, forceUpdate: true })
      await Capsule.request('update.post', { id: 3, title: newString })
      await sleep(100)
      const normalResult = await Capsule.request('fetch.posts', { id: 3 })
      expect(cachedResult).not.toEqual(normalResult)
    })
  })
})
