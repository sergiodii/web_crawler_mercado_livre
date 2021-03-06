'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} AdonisRequest */
/** @typedef {import('@adonisjs/auth/src/Schemes/Session')} AuthSession */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('../../Services/ProductShowService')} */

const Env = use('Env')
const Axios = require('axios')
const ProductShowService = use('App/Services/ProductShowService')
const Logger = use('Logger')


class ProductController {
    
    /**
     * @function index
     * @param {object} ctx
     * @param {AuthSession} ctx.auth
     * @param {AdonisRequest} ctx.request
     * @param {Response} ctx.response
     */

    async index ({ response }) {
        try {
            return response.status(404).json({ error: 404, message: 'Page not found' })
        } catch (e) {
            Logger.error({local: 'ProductController.js / 001', data: e, date: new Date() })
            return response.status(500).json({ error: 500, message: 'Internal error' })
        }
    }

    /**
     * @function show
     * @param {object} ctx
     * @param {AuthSession} ctx.auth
     * @param {AdonisRequest} ctx.request
     * @param {Response} ctx.response
     */

    async show ({ request, response }) {
        try {
            let { search, limit } = request.all()
            const res = await Axios.get(`${Env.get('BASE_PAGE')}/jm/search?as_word=${search.replace(/[ ]/g, '+')}`.replace(/[/][/][j]/g, '/j'))
            if (res.status === 200) {
                return response.status(200).json(await ProductShowService.prepareReturnList(res.data, parseInt(limit) || null))
            }
            else if (res.status === 404) {
                return response.status(404).json({ total: 0, perPage: 0, data: [] })
            }
            return response.status(res.status).json({ error: res.status, message: '' })
        } catch (e) {
            if (e.message.match(/404/)) {
                return response.status(404).json({ total: 0, perPage: 0, data: [] })
            }
            Logger.error({local: 'ProductController.js / 001', data: e, date: new Date() })
            return response.status(500).json({ error: 500, message: 'Internal error' })
        } 
    }
}

module.exports = ProductController
