import {createStore} from 'vuex'
import persistedState from 'vuex-persistedstate'

const store = createStore({
    state:{
        sysConfig:{
            WorkStation: '1',
            MachineId: '2'
        }
    },
    getters:{
        
    },
    mutations:{
        updateSysConfig(state, sysConfig){
            state.sysConfig = sysConfig
        }
    },
    actions:{

    },
    plugins: [persistedState()]
})

export default store;