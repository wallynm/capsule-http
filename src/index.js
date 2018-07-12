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
  
  fetch(key, params) {
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
        resolve(result.data)
      }).catch(result => {
        reject(result)
      })
    })
  }

  register(baseUrl, data) {
    for(let method in data) {
      for(let key in data[method] ) {
        const url = data[method][key]
        this.methods[key] = axios.create({ 
          url: url,
          baseURL: baseUrl,
          method
         })
      }
    }
  }
  
  replaceDynamicURLParts(url, data) {
    url = url.replace(PARAMETER_REGEXP, $0 => {
      const nameParam = $0.substring(1)
      const key = data[nameParam]
      delete data[nameParam]
      return key
    })

    console.log(url)

    return {
      url,
      data
    }
  }
}

export default new Request()