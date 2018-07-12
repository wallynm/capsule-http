import axios from 'axios'
import { 
  PARAMETER_REGEXP, 
  WILDCARD_REGEXP, 
  REPLACE_VARIABLE_REGEXP, 
  REPLACE_WILDCARD, 
  FOLLOWED_BY_SLASH_REGEXP, 
  MATCH_REGEXP_FLAGS
} from './constants'


class Request {
  constructor() {
    this.methods = []
  }
  
  fetch(key, params, returnObject = false) {
    return new Promise((resolve, reject) => {
      const route = this.methods[key]
      const { url, data } = this.replaceDynamicURLParts(route.defaults.url, params)
      
      route.defaults.url = url
      
      if(route.defaults.method === 'get') {
        route.defaults.params = data
      } else {
        route.defaults.data = data
      }
  
      route()
      .then(result => {
        if(returnObject) {
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
          url: url,
          baseURL: baseURL,
          method
          })
      }
    }
  }
  
  replaceDynamicURLParts(url, data) {
    const urlParams = []
    const params = {}
    url = url.replace(PARAMETER_REGEXP, $0 => {
      const nameParam = $0.substring(1)
      urlParams.push(nameParam)
      return data[nameParam]
    })

    for (var i in data) {
      if(!urlParams.indexOf(i)) {
        params[i] = data[i]
      }
    }

    return {
      url,
      params
    }
  }
}

export default new Request()