import axios from 'axios/index'

const PARAMETER_REGEXP = /([:*])(\w+)/g
const DEFAULT_FIVE_MINUTES = 5000

class Capsule {
  constructor() {
    this.http = axios
    this.req = this.request.bind(this, true)
    this.debug = false
    this.errorHandler = null
    this.methods = []
    this.configParams = {}
    this.defaultHeaders = {}
  }

  get isNode () {
    return typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs
  }
  
  log(message, type = 'success') {
    if(this.debug !== true) {
      return null
    }

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

  config(configParams) {
    this.configParams = configParams
  }

  request(key, params, options = {}) {
    if (!this.methods[key]) {
      return console.error(`The route ${key} was not defined.`)
    }

    const route = Object.assign({}, this.methods[key]);
    const { method, baseURL } = route.defaults;
    const { errorHandler, headers, ...configs } = this.configParams;

    // Before get route object we update it's cache
    options.url = this.replaceDynamicURLParts(route.defaults.url, params)
    options.headers = {
      ...this.defaultHeaders,
      ...headers,
      ...options.headers
    }

    if(method === 'get') {
      options.params = params
    } else {
      options.data = params
    }

    return new Promise((resolve, reject) => {
      this.log(`[${method.toUpperCase()}] ${key} -> ${ baseURL + options.url }`)

      const obj = {
        // validateStatus: false,
        ...configs,
        ...options
      }

      route.request(obj)
      .then(result => {
        const data = (options.fullResult && options.fullResult === true) ? result : result.data;
        resolve(data)
      }).catch(error => {
        let data = {};

        if(this.isNode) {
          data = error.response && error.response.data

          if(error.code) {
            data = {
              code: error.errno,
              message: error.code,
              ...data
            }
          }
        } else {
          console.info(error)
          data = {
            code: error.response.status,
            message: error.response.statusText
          };
        }

        if(typeof errorHandler === 'function') {
          errorHandler({
            ...data,
            url: options.url
          })
        }

        resolve(data);
      })
    })
  }

  register(baseURL, data) {
    if(typeof baseURL !== "string") {
      return console.error("You must define the first parameter the baseURL.")
    }

    for(let method in data) {
      for(let key in data[method] ) {
        const methodData = data[method][key]

        // Treating url as always an object we open the register method to be treated very open
        let options = (typeof methodData === 'object') ? methodData : { url: methodData }

        if(typeof this.methods[key] !== 'undefined') {
          return console.error(`The route ${key} already registered`)
        }

        this.methods[key] = axios.create({
          ...options,
          method,
          baseURL
        })
      }
    }
  }
  
  replaceDynamicURLParts(url, params) {
    return url.replace(PARAMETER_REGEXP, $0 => {
      const nameParam = $0.substring(1)
      return params[nameParam]
    })
  }
}

export default new Capsule()
