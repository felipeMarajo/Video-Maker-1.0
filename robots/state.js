const fileSystem = require('fs')
const contentFilePath = './content.json'
const scriptFilePath = './content/after-effects-script.js'

function save(content){
    const contentString = JSON.stringify(content)
    return fileSystem.writeFileSync(contentFilePath, contentString)
}

function saveScript(content) {
    const contentString = JSON.stringify(content)
    const scriptString = `var content = ${contentString}`
    return fileSystem.writeFileSync(scriptFilePath, scriptString)
  }  

function load(){
    const fileBuffer = fileSystem.readFileSync(contentFilePath,'utf-8')
    const contentJson = JSON.parse(fileBuffer) // Transforma em obj JS
    return contentJson
}

module.exports = {
    save,
    load,
    saveScript
}