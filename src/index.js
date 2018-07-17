import axios from 'axios'
import { cacheAdapterEnhancer, Cache } from 'axios-extensions'

const PARAMETER_REGEXP = /([:*])(\w+)/g
const DEFAULT_FIVE_MINUTES = 5000

class Capsule {
  constructor() {
    this.req = this.request.bind(this, true)
    this.methods = []
  }

  static defaultHeaders = {
    headers: { 'Cache-Control': 'no-cache' }
  }
  
  cache(seconds = DEFAULT_FIVE_MINUTES) {
    return new Cache({ maxAge: seconds * 1000, max: 100 })
  }

  request(key, params, options = {}) {
    return new Promise((resolve, reject) => {
      const CACHE_REGISTER = !this.methods[key].defaults.cache && options.cache
      const CACHE_UPDATE = this.methods[key].defaults.cache && options.forceUpdate
      
      // Configure a timing based on the input passed / default 5 mins
      if(CACHE_REGISTER || CACHE_UPDATE) {
        this.methods[key].defaults.cache = this.cache(options.cache)

        //
        if(options.cache !== false) {
          delete options.cache
        }
      }
  
      // Before get route object we update it's cache
      let route = Object.assign({}, this.methods[key])
      const { url, data } = this.replaceDynamicURLParts(route.defaults.url, params)


      options.url = url
      options.headers = { ...this.defaultHeaders, ...options.headers }
  
      if(route.method === 'get') {
        options.params = data
      } else {
        options.data = data
      }

      route.request(options)
      .then(result => {
        if(options.debug && options.debug === true) {
          resolve(result)
        } else {
          resolve(result.data)
        }
      }).catch(result => {
        reject(result)
      })
    })
  }

  register(baseURL, data) {
    if(!baseURL || typeof baseURL !== "string") {
      throw "You must define the first parameter the baseURL."
    }

    for(let method in data) {
      for(let key in data[method] ) {
        const url = data[method][key]

        if(typeof this.methods[key] !== 'undefined') {
          throw "This route name already registered"
        }

        this.methods[key] = axios.create({
          method,
          url,
          baseURL,
          cache: false,
          adapter: cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false })
        })
      }
    }
  }
  
  replaceDynamicURLParts(url, params) {
    let data = Object.assign({}, params)
    
    url = url.replace(PARAMETER_REGEXP, $0 => {
      const nameParam = $0.substring(1)
      const key = data[nameParam]
      delete data[nameParam]
      return key
    })

    return {
      url,
      data
    }
  }
}

export default new Capsule()