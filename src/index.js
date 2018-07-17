import axios from 'axios'
import { cacheAdapterEnhancer, Cache } from 'axios-extensions'

const PARAMETER_REGEXP = /([:*])(\w+)/g
const DEFAULT_FIVE_MINUTES = 5000

class Capsule {
  constructor() {
    this.req = this.request.bind(this, true)
    this.methods = []
  }

  defaultHeaders = {
    'Cache-Control': 'no-cache'
  }

  debug = false
  
  enableDebug() {
    this.debug = true
  }

  addHeader(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
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

        // If cache it's marked as false we need to remove it as the axios will resolve the request itself
        if(options.cache !== false) {
          delete options.cache
        }
      }
  
      // Before get route object we update it's cache
      let route = Object.assign({}, this.methods[key])
      const { url, data } = this.replaceDynamicURLParts(route.defaults.url, params)


      options.url = url
      this.addHeader(options.headers)
      options.headers = this.defaultHeaders
  
      if(route.method === 'get') {
        options.params = data
      } else {
        options.data = data
      }

      if (this.debug === true) {
        const FgGreen = "\x1b[32m"
        const { method, baseURL, url } = route.defaults
        console.log(FgGreen, `[${method.toUpperCase()}] ${key} > ${baseURL + url}`)
      }

      route.request(options)
      .then(result => {
        // console.info(result)
        if(options.fullResult && options.fullResult === true) {
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
        const methodData = data[method][key]

        // Treating url as always an object we open the register method to be treated very open
        let options = (typeof methodData === 'object') ? methodData : { url: methodData }

        if(typeof this.methods[key] !== 'undefined') {
          throw "This route name already registered"
        }

        if(options.cache) {
          options.cache = this.cache(options.cache)
        }

        this.methods[key] = axios.create({
          ...options,
          method,
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

module.exports = new Capsule()