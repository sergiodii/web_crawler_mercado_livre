
const Cheerio = require('cheerio')
const Axios = require('axios')
const Env = use('Env')

class ProductShowService {
    
    /**
     * @function prepareReturnList
     * @param {string} html
     * @return {object} [] List
     */

    static async prepareReturnList (html) {
        try {
            let finalList = []
            let $ = Cheerio.load(html)
            let idList = []
            let SProducts = []
            $('#searchResults li').each(async function () {
                let productId = $(this).find('.rowItem').attr('id')
                if (productId) {
                    idList.push(productId)
                } else {
                    SProducts.push(this)
                }
            })
            for (let id of idList) {
                let response = await Axios.get(`${Env.get('API_PAGE')}/items/${id.replace(/PAD-/g, '')}`)
                if (response.status === 200) {
                    let productInfo = response.data
                    finalList.push(
                        {
                            title: productInfo.title,
                            link:  productInfo.permalink,
                            price: productInfo.price,
                            store: await this._getStoreName(productInfo.seller_id),
                            state: productInfo.seller_address.state.name
                        }
                    )
                } else {
                    console.log(response.status)
                }
            }
            for (let self of SProducts) {
                let product = await this._getProductTypeS(self)
                if (product) {
                    product.forEach(p => finalList.push(p))
                }
            }
            console.log(`Total do final list: ${finalList.length}`)
            return finalList
        } catch (e) {
            console.log(e)
            return []
        }
    }

    /**
     * @function _getStoreName
     * @param {string} storeId
     * @return {string}
     */

    static async _getStoreName (storeId) {
        if (!storeId) return storeId
        try {
            let response = await Axios.get(`${Env.get('API_PAGE')}/users/${storeId}`)
            if (response.status === 200) {
                return response.data.nickname
            } else {
                return null
            }
        } catch (e) {
            console.log(e)
            return null
        }
    }

    static async _getProductTypeS (self) {
        try {
            let productList = []
            let link = Cheerio(self).find('.item__info-link').attr('href')
            if (link) {
                let response = await Axios.get(`${link.split('?')[0]}/s`)
                if (response.status === 200) {
                    let $ = Cheerio.load(response.data)
                    $('.ui-pdp-table form').each(function () {
                        productList.push({
                            title: $('.ui-pdp-title').html(),
                            link: `${link.split('?')[0]}/s`,
                            price: parseFloat(`${ $(this).find('.price-tag-fraction').html() }${ $(this).find('.price-tag-cents') ? '.' + $(this).find('.price-tag-cents').html() : ''}`),
                            store: $(this).find('.ui-pdp-action-modal__link').html(),
                            state: null
                        })
                    })
                    return productList
                } else {
                    console.log(response.status, `${link.split('?')[0]}/s`)
                    return null
                }
            }
            return null
        } catch (e) {
            console.log(e)
            return null
        }
    }
}
module.exports = ProductShowService