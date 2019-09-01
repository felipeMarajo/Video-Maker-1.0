const fileSystem = require('fs')
const contentFilePath = './content.json'

function save(content){
    const contentString = JSON.stringify(content)
    return fileSystem.writeFileSync(contentFilePath, contentString)
}

function load(){
    const fileBuffer = fileSystem.readFileSync(contentFilePath,'utf-8')
    const contentJson = JSON.parse(fileBuffer) // Transforma em obj JS
    return contentJson
}

module.exports = {
    save,
    load
}