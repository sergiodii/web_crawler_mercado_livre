'use strict'

class ProductShow {
  get rules () {
    return {
      search: 'required'
    }
  }
  get messages () {
    return {
      'search.required': 'The input type string search is required'
    }
  }
}

module.exports = ProductShow
