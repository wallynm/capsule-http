import "regenerator-runtime/runtime";
import Request from './index'
const jsonServer = require('json-server')
const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const assert = chai.assert

const server = jsonServer.create()
const router = jsonServer.router(__dirname + '/utils/db.json')
server.use(router)
const PORT = 3001
const ServerInstance = server.listen(PORT)

const baseURL = `http://localhost:${PORT}`

function randString() {
  return (+new Date * Math.random()).toString(36).substring(0,6)  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Register api calls
Request.register(baseURL, {
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


describe('Basic API execution', () => {
  // Ensures that fake server it's running
  after(() => ServerInstance.close())

  describe('register method domain', () => {


    it('should define baseURL', () => {
      expect(() => Request.register({get: {'fetch.posts': '/posts/:id'}}) ).to.throw("You must define the first parameter the baseURL.");
    })
    
    it('shouldn\'t allow duplicated key names', () => {
      expect(() => Request.register(baseURL, {get: {'fetch.posts': '/posts/:id'}}) ).to.throw("This route name already registered");
    })
  })

  describe('GET method', () => {
    it('should execute with success', async () => {  
      const result = await Request.exec('fetch.posts', { id: 1})
      expect(result).to.include({title: "json-server", id: 1})
    })

    it('should return the object data', async () => {  
      const result = await Request.exec('fetch.posts', { id: 1})
      expect(typeof result).to.be.equal('object')
    })

    it('should execute GET method with success and retrieve data', async () => {  
      const result = await Request.exec('fetch.posts', { id: 1})
      expect(typeof result).to.be.equal('object')
      expect(result).to.include({title: "json-server", id: 1})
    })

    it('should return object even using fixed params', async () => {  
      const result = await Request.exec('fetch.mongodb.post')
      expect(typeof result).to.be.equal('object')
    })

    it('should keep the GET result cached', async () => {
        const cachedResult = await Request.exec('fetch.posts', { id: 3}, { cache: 100 })
        await Request.exec('update.post', { id: 3, title: randString() })
        await sleep(1000);  
        const normalResult = await Request.exec('fetch.posts', { id: 3 })//.then(normalResult => {        
        expect(cachedResult).to.be.equal(normalResult)
    })
  })






  it('should include all properties', async () => {
    const result = await Request.exec('fetch.posts', { id: 1, title: "json-server"})
    expect(result).to.include({title: "json-server"})
  })

  it('should apply query params correctly', async () => {  
    const result = await Request.exec('fetch.posts', { id: 1, title: "json-server"})
    expect(result).to.include({title: "json-server"})
  })
})