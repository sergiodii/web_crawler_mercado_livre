'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} AdonisRequest */
/** @typedef {import('@adonisjs/auth/src/Schemes/Session')} AuthSession */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('../../Services/ProductShowService')} */

const Env = use('Env');
const Axios = require('axios');
const ProductShowService = use('App/Services/ProductShowService');


class ProductController {
    
    /**
     * @function index
     * @param {object} ctx
     * @param {AuthSession} ctx.auth
     * @param {AdonisRequest} ctx.request
     * @param {Response} ctx.response
     */
    async index ({response, request}) {
        try {
            console.log(request.all())
            return { url: 'not exist' }
        } catch (e) {
            console.log(e)
            return { 'error': e }
        }
    }
    async show ({ request, response }) {
        try {
            let { search, limit } = request.all()
            const res = await Axios.get(`${Env.get('BASE_PAGE')}/jm/search?as_word=${search.replace(/[ ]/g, '+')}`.replace(/[/][/][j]/g, '/j'));
            if (res.status === 200) {
                return response.status(200).json(await ProductShowService.prepareReturnList(res.data))
            }
            return response.status(400).json({error: 400, message:'bad request'})
        } catch (e) {
            console.log(e)
            return { 'error': e }
        } 
    }
}

module.exports = ProductController
