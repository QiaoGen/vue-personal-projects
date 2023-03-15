// 补全二进制 参数string
const fullBinary = function (param) {
    let fullNum = ''
    for (let i = (8 - param.length); i > 0; i--) {
        fullNum += '0'
    }
    return fullNum + param
}

//转化32位int
const toInt32 = function (buffer) {
    return getView(buffer).getUint32()
}

function getView(bytes) {
    var view = new DataView(new ArrayBuffer(bytes.length));
    for (var i = 0; i < bytes.length; i++) {
        view.setUint8(i, bytes[i]);
    }
    return view;
}

//将数值写入到视图中，获得其字节数组，大端字节序
function getUint8Array(len, setNum) {
    var buffer = new ArrayBuffer(len);  //指定字节长度
    setNum(new DataView(buffer));  //根据不同的类型调用不同的函数来写入数值
    return new Uint8Array(buffer); //创建一个字节数组，从缓存中拿取数据
}

export default{
    toInt32,
    fullBinary,
    getView
}