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

  get isNode () {
    return typeof global !== "undefined" && ({}).toString.call(global) === '[object global]';
  }
  
  log(message, type = 'success') {
    const SHRESET = "\x1b[0m"
    const color = {
      error: "\x1b[31m",
      warning: "\x1b[33m",
      success: "\x1b[32m"
    }

    if (this.isNode) {
      console.log(color[type], message, SHRESET)
    } else {
      console.log(message)
    }
  }

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
        const { method, baseURL } = route.defaults
        this.log(`[${method.toUpperCase()}] ${key} -> ${baseURL + url}`)
      }

      route.request(options)
      .then(result => {

        if(!this.isNode) {
          console.log(result)
        }
        const data = (options.fullResult && options.fullResult === true) ? result : result.data
        resolve(data)
      }).catch(error => {
        let data = (options.fullResult && options.fullResult === true) ? error : error.response.data

        if(!this.isNode) {
          data = {
            code: error.response.status,
            message: error.response.statusText
          }
        }

        if (this.debug === true) {
          const { method, baseURL } = route.defaults
          this.log(`[${method.toUpperCase()}] ${data.code} ${key} -> ${baseURL + url}`, 'error')
        }
        resolve(data)
      })
    })
  }

  register(baseURL, data) {

    console.info(baseURL)
    if(!baseURL || typeof baseURL !== "string") {
      console.error("You must define the first parameter the baseURL.")
    }

    for(let method in data) {
      for(let key in data[method] ) {
        const methodData = data[method][key]

        // Treating url as always an object we open the register method to be treated very open
        let options = (typeof methodData === 'object') ? methodData : { url: methodData }

        if(typeof this.methods[key] !== 'undefined') {
          console.error(`The route ${key} already registered`)
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