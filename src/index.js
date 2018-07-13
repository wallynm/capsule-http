import axios from 'axios'
import { cacheAdapterEnhancer, throttleAdapterEnhancer } from 'axios-extensions';

const PARAMETER_REGEXP = /([:*])(\w+)/g

class Request {
  constructor() {
    this.methods = []
    this.http = axios.create({ 
      adapter: throttleAdapterEnhancer(cacheAdapterEnhancer(axios.defaults.adapter, { enabledByDefault: false }))
    })
  }

  static defaultHeaders = 'test';
  
  exec(key, params, options = {}) {
    return new Promise((resolve, reject) => {
      let route = Object.assign({}, this.methods[key])
      const { url, data } = this.replaceDynamicURLParts(route.url, params)
      
      // Updates route with new replaced data
      route.url = url

      if(route.method === 'get') {
        route.params = data
      } else {
        route.data = data
      }

      route = this.applyHeaders(route, options)

      this.http.request(route)
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

  applyHeaders(route, options) {
    route.headers = { ...this.defaultHeaders, ...options.headers }
    return route
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

        this.methods[key] = {
          method,
          url,
          baseURL
        }
      }
    }
  }
  
  replaceDynamicURLParts(url, data) {
    const urlParams = []
    const params = {}
    
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

export default new Request()