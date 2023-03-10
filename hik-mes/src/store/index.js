import {createStore} from 'vuex'
import persistedState from 'vuex-persistedstate'

const store = createStore({
    state:{
        sysConfig:{
            WorkStation: null,
            MachineId: null
        },
        theme: 'white',
        role: null,
        name: null,
        updateMenu: false,
        mainMenus : [
            {
                key:"/MainWindow",
                label: "主界面",
            },
            {
                key:"/SysManager",
                label: "系统管理",
                authorization: [0]
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
                authorization: [0]
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
        },
        updateRole(state, role){
            state.role = role
        },
        updateName(state, name){
            state.name = name
        },
        updateMenu(state, updateMenu){
            state.updateMenu = updateMenu
        }
    },
    actions:{

    },
    plugins: [persistedState()]
})

export default store;