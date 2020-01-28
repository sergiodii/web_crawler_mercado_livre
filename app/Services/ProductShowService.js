
const Cheerio = require('cheerio')
const Axios = require('axios')
const Env = use('Env')

class ProductShowService {
    
    /**
     * @function prepareReturnList
     * @param {string} html
     * @return {object} [] List
     */

    static async prepareReturnList (html, limit) {
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
            for (let i in idList) {
                let queryStart = true
                let id = idList[parseInt(i)]
                if (limit) queryStart = (parseInt(i) + 1) <= limit
                if (queryStart) {
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
                    }
                }
            }

            if (limit) {
                if (limit <= idList.length) return finalList
            }
            for (let self of SProducts) {
                let product = await this._getProductTypeS(self)
                if (product) {
                    product.forEach(p => finalList.push(p))
                }
            }
            if (limit) {
                if (limit <= 48) {
                    return finalList.filter((v, i) => (parseInt(i) + 1) <= limit)
                }
                let moreIdList = []
                $('.andes-pagination li').each(function () {
                    let pageNumber = parseInt($(this).find('.andes-pagination__link').html())
                    if (!isNaN(pageNumber)) moreIdList.push({
                        pageNumber,
                        url: $(this).find('.andes-pagination__link').attr('href')
                    })
                })
                let numberToPageBreak = 48
                let totalPageToSearch = (Math.floor(-(limit / numberToPageBreak))) * -1
                for (let i = 1; i < (totalPageToSearch + 1); i++) {
                    let result = moreIdList.filter(r => r.pageNumber === parseInt(i))[0]
                    if (result) {
                        let previousValue = (parseInt(i) - 1) * numberToPageBreak + 1
                        let atualValue = parseInt(i) * numberToPageBreak + 1
                        if (limit >= previousValue) {
                            let response  
                            if (result.url !== '#') response = await Axios.get(result.url)
                            if (response && response.status === 200) {
                                if (limit <= atualValue) {
                                    finalList = [ ...finalList, ...await this.prepareReturnList(response.data, (limit % previousValue)) ]
                                } else {
                                    finalList = [ ...finalList, ...await this.prepareReturnList(response.data) ]
                                }
                            }
                        }
                    }
                }
                console.log('Total do finalList', finalList.length)
                let rr = finalList.filter((v, i) => parseInt(i) < limit)
                return {data: rr, total: rr.length}
            } else {
                return finalList
            }
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

    /**
     * @function _getProductTypeS
     * @param {string} self
     * @return {object} List
     */

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
                            price: $(this).find('.price-tag-fraction').html() ? $(this).find('.price-tag-cents') ? parseFloat(`${$(this).find('.price-tag-fraction').html()}.${$(this).find('.price-tag-cents')}`)  : parseInt($(this).find('.price-tag-fraction').html()) : null,
                            store: $(this).find('.ui-pdp-action-modal__link').html(),
                            state: null
                        })
                    })
                    return productList
                } else {
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