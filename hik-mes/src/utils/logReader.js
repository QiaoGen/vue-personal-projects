import fs from 'fs'

const getLogFileList = function(path){
    return new Promise((reslove,reject) => {
        fs.readdir(path,(err, data) => {
            console.log('fileList:',data)
            if(err){
                reject(err)
            }else{
                reslove(data)
            }
        })
    })
}

const readFile = function(filePath){
    return new Promise((reslove,reject) => {
        fs.readFile(filePath,(err, data) => {
            // console.log('data------:',data.toString())
            if(err){
                reject(err)
            }else{
                reslove(data.toString())
            }
        })
    })
}

export default{
    getLogFileList,
    readFile
}