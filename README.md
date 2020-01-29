# Web-Crawler Mercado Livre!

Este repositório foi criado para demonstração de funcionamento de um web-crawler.

## Formato da requisição

A requisição deve ser via POST para '/' no formato JSON ( accept: application/json ), da seguinte forma:
> <pre> 
> {
>     search: String|Required // Conteúdo a ser pesquisado
>     limit: Int|Optional // Default, o total entrado na primeira página da busca. 
> }
> 
> </pre>

## Formato da resposta

A resposta será retornada em JSON com HTTP Status Code 200 caso ok e no seguinte formato:
> <pre> 
> {
>     total: Int // Total de conteúdo encontrado para a busca
>     perPage: Int // Total de conteúdo encontrado para o formato da pesquisa.
>     data: Object // Conteúdo da busca
>         {
>             "title": String, // Nome do produto
>             "link": String, // Link do produto
>             "price": Number, // Preço
>             "store": String, // Nome da loja, se houver
>             "state": String // Estado, se houver
>         }   
> }
> 
> </pre>

Status de retorno esperados: 200, 400, 404, 500
>Dúvidas [Sérgio Venâncio](https://github.com/sergiodii)
>Obrigado
