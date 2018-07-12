import Request from './index'
const jsonServer = require('json-server')
const chai = require('chai')
const should = chai.should()
const expect = chai.expect
const assert = chai.assert

const server = jsonServer.create()
const router = jsonServer.router(__dirname + '/utils/db.json')
server.use(router)
const ServerInstance = server.listen(3001)


// Register api calls
Request.register('http://localhost:3001', {
  get: {
    'fetch.posts': '/posts/:id',
    'fetch.post': '/post'
  },
  post: {
    'fetch.posts': '/posts/:id'
  },
  put: {
    'fetch.posts': '/posts/:id'
  },
  delete: {
    'remove.post': '/posts/:id'
  }
})


describe('Basic API execution', () => {
  // Ensures that fake server it's running
  // after(() => ServerInstance.close())

  it('should execute GET method', async () => {  
    const result = await Request.fetch('fetch.posts', { id: 1})
    console.info(result)
    expect(typeof result).to.be.equal('object')
  })

  it('should return a single object', async () => {  
    const result = await Request.fetch('fetch.post', { id: 1})
    console.info('singke', result)
    expect(typeof result).to.be.equal('object')
  })

  it('should include all properties', async () => {
    const result = await Request.fetch('fetch.posts', { id: 1, title: "json-server"})
    expect(result).to.include({title: "json-server"})
  })

  it('should apply query params correctly', async () => {  
    const result = await Request.fetch('fetch.posts', { id: 1, title: "json-server"})
    expect(result).to.include({title: "json-server"})
  })
})