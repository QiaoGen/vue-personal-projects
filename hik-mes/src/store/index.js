import { createStore } from 'vuex'
import persistedState from 'vuex-persistedstate'

const store = createStore({
    state: {
        sysConfig: {
            WorkStation: null,
            MachineId: null,
            ip: null,
            port: null,
            PLCIP: null
        },
        theme: 'white',
        role: null,
        name: null,
        updateMenu: false,
        workFlag: false,//系统开始工作标志
        plcStatus: false,//plc连接状态
        mesStatus: false,//mes连接状态
        tcpStatus: false,//打印机连接状态
        mainMenus: [
            {
                key: "/MainWindow",
                label: "主界面",
            },
            {
                key: "/Alarm",
                label: "异常告警",
            },
            {
                key: "/SendBox",
                label: "投盒机"
            },
            {
                key: "/SysManager",
                label: "系统管理",
                authorization: [0]
            },
            {
                key: "/DataReport",
                label: "数据报告",
            },
            {
                key: "/UserManage",
                label: "用户管理",
            },
            {
                key: "/log",
                label: "日志",
                authorization: [0]
            },
            // {
            //     key:"/theme",
            //     label: "主题",
            // },
            {
                key: "/Help",
                label: "帮助",
            },
        ],
    },
    getters: {

    },
    mutations: {
        updateSysConfig(state, sysConfig) {
            state.sysConfig = sysConfig
        },
        updateTheme(state, theme) {
            state.theme = theme
        },
        updateRole(state, role) {
            state.role = role
        },
        updateName(state, name) {
            state.name = name
        },
        updateMenu(state, updateMenu) {
            state.updateMenu = updateMenu
        },
        updateworkFlag(state, workFlag) {
            state.workFlag = workFlag
        },
        updateplcStatus(state, plcStatus) {
            state.plcStatus = plcStatus
        },
        updatemesStatus(state, mesStatus) {
            state.mesStatus = mesStatus
        },
        updatetcpStatus(state, tcpStatus) {
            state.tcpStatus = tcpStatus
        }
    },
    actions: {

    },
    plugins: [persistedState()]
})

export default store;