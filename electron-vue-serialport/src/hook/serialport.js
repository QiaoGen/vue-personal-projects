import { SerialPort } from 'serialport'

const listSerialport = function(){
    return new Promise(async(resolve, reject) => {
        let paths = []
        await SerialPort.list().then((ports, err) => {
            if(err){
                console.error(err)
                reject(err)
            }
            ports.map(port => paths.push(port.path))
        })
        resolve(paths)
    })
}

const openSerialport = function(path){
    var port = new SerialPort({ path: path, baudRate: 115200 })
    port.open(() => {
        port.on('data', data => {
            console.log(path,data.toString())
        })
    })
}

export default {
    listSerialport,
    openSerialport
}