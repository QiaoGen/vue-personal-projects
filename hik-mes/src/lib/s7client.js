var snap7 = require('node-snap7');

var s7client = new snap7.S7Client();
console.log("test=========================")
s7client.ConnectTo('192.168.2.1', 0, 1, function(err) {
    if(err)
        return console.log(' >> Connection failed. Code #' + err + ' - ' + s7client.ErrorText(err));

    // Read the first byte from PLC process outputs...

    
    // s7client.ABWrite(0,1, Buffer.from([1]), function(err, res){
    //     if(err)
    //         return console.log(' >> ABWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err));

    //     // ... and write it to stdout
    //     console.log('ABWrite:',res)
    // })

    // s7client.ABRead(0, 10, function(err, res) {
    //     if(err)
    //         return console.log(' >> ABRead failed. Code #' + err + ' - ' + s7client.ErrorText(err));

    //     // ... and write it to stdout
    //     console.log('ABRead',res)
    // });

    s7client.MBWrite(4,5, Buffer.from([255]), function(err, res){
        if(err)
            return console.log(' >> MBWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err));

        // ... and write it to stdout
        console.log('MBWrite:',res)
    })


    s7client.MBRead(0, 10, function(err,res){
        if(err)
            return console.log(' >> MBRead failed. Code #' + err + ' - ' + s7client.ErrorText(err));

        // ... and write it to stdout
        console.log('MBRead:',res)
        if(res.length > 0){
            res.forEach(e => {
                // console.log(e.toString(2))
                console.log(fullBinary(e.toString(2)))
            })
        }
    })

    // s7client.EBWrite(0,1, Buffer.from([1]), function(err, res){
    //     if(err)
    //         return console.log(' >> EBWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err));

    //     // ... and write it to stdout
    //     console.log('EBWrite:',res)
    // })


    // s7client.EBRead(0, 10, function(err,res){
    //     if(err)
    //         return console.log(' >> EBRead failed. Code #' + err + ' - ' + s7client.ErrorText(err));

    //     // ... and write it to stdout
    //     console.log('EBRead:',res)
    // })
    
});


// 补全二进制 参数string
const fullBinary = function(param){
    let fullNum = ''
    for(let i = (8-param.length); i > 0 ; i--){
        fullNum += '0'
    }
    return fullNum+param
}

module.exports

