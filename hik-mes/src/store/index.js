import {createStore} from 'vuex'
import persistedState from 'vuex-persistedstate'

const store = createStore({
    state:{
        sysConfig:{
            WorkStation: '1',
            MachineId: '2'
        },
        theme: 'white',
        mainMenus : [
            {
                key:"/MainWindow",
                label: "主界面",
            },
            {
                key:"/SysManager",
                label: "系统管理",
            },
            {
                key:"/DataReport",
                label: "数据报告",
            },
            {
                key:"/UserManage",
                label: "用户管理",
            },
            {
                key:"/log",
                label: "日志",
            },
            {
                key:"/theme",
                label: "主题",
            },
            {
                key:"/Help",
                label: "帮助",
            },
        ],
    },
    getters:{
        
    },
    mutations:{
        updateSysConfig(state, sysConfig){
            state.sysConfig = sysConfig
        },
        updateTheme(state, theme){
            state.theme = theme
        }
    },
    actions:{

    },
    plugins: [persistedState()]
})

export default store;