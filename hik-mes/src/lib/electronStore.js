const Store = require('electron-store');
const store = new Store();

const setWorkStation = function(param){
    store.set('WorkStation', param)
}
const getWorkStation = function(){
    store.get('WorkStation')
}
const setMachineId = function(param){
    store.set('MachineId', param)
}
const getMachineId = function(){
    store.get('MachineId')
}

export default {setWorkStation,getWorkStation,setMachineId,getMachineId}