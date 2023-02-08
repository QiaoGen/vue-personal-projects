import {createStore} from 'vuex'
import persistedState from 'vuex-persistedstate'

const store = createStore({
    state:{
        WorkStation: '123',
        MachineId: '22'
    },
    getters:{
        
    },
    mutations:{
        
    },
    actions:{

    },
    plugins: [persistedState()]
})

export default store;