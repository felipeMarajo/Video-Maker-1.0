const algorithmia = require('algorithmia')
const algoorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

async function robot(content){
    await fetchContetentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)

    async function fetchContetentFromWikipedia(){
        const algorithmiaAuthenticated = algorithmia(algoorithmiaApiKey)
        const wikipediaAlgoritm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2?timeout=300')
        const wikipediaResponse = await wikipediaAlgoritm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')
      
            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
              if (line.trim().length === 0 || line.trim().startsWith('=')) {
                return false
              }
              return true
            })    
            return withoutBlankLinesAndMarkdown.join(' ') //Retorna texto único com espaços entre as junções
          }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    
    }

    function breakContentIntoSentences(content){
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentences) => {
            content.sentences.push({
                text: sentences,
                keywords: [],
                images: []
            })
        })
    }

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            // Passa as sentenças para o watson, depois retorna as
            // keywords e faz isso para todas as sentenças
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error){
                    throw error
                }
                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })
                resolve(keywords)
            })
        })
    }

}

module.exports = robot