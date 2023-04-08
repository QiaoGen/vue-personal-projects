// /**axios封装
//  * 请求拦截、相应拦截、错误统一处理
//  */
// import axios from 'axios';
// import QS from 'qs';
// import router from '../router/index'
// import store from '@/store'

// axios.defaults.withCredentials = false

// let urlPrefix = ''
// // 环境的切换
// if (process.env.NODE_ENV == 'development') {
//     axios.defaults.baseURL = 'http://mes-expose.hikvision.com:12304/ws/manMachine?wsdl';
// } else if (process.env.NODE_ENV == 'production') {
//     axios.defaults.baseURL = 'http://mes-expose.hikvision.com:12304/ws/manMachine?wsdl';
//     urlPrefix = '/api'
// }

// // 接口api post请求
// var urls = {
   
// }


// // 请求超时时间
// axios.defaults.timeout = 10000;
// // axios.defaults.headers.common['Authorization'] = store.state.access_token
// // post请求头
// // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';


// // 请求拦截器
// axios.interceptors.request.use(
//     config => {
//         // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
//         // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
//         const token = store.state.access_token;
//         token && (config.headers.Authorization = token);
        
//         return config;
//     },
//     error => {
//         return Promise.error(error);
//     })

// // 响应拦截器
// axios.interceptors.response.use(
//     response => {
//         if (response.status === 200) {
//             if (response.data.code == 401) {
//                 console.log('response:', response)
//                 window.$message.error("登录过期，请重新登录")
//                 // localStorage.removeItem('access_token')
//                 // localStorage.setItem('loginStatus', false)
//                 router.replace({
//                     path: '/login',
//                     query: { redirect: router.currentRoute.fullPath }
//                 });
//                 return Promise.reject(response);
//             } else if (response.data.code == 403) {
//                 console.log('response:', response)
//                 // ElMessage({message:"暂无资源",type:'error',center:true})
//                 router.replace({
//                     path: '/login',
//                     query: { redirect: router.currentRoute.fullPath }
//                 });
//                 return Promise.reject(response);
//             }
//             return Promise.resolve(response);
//         } else {

//             return Promise.reject(response);
//         }
//     },
//     // 服务器状态码不是200的情况    
//     error => {
//         if (error.response.status) {
//             switch (error.response.status) {
//                 // 401: 未登录                
//                 // 未登录则跳转登录页面，并携带当前页面的路径                
//                 // 在登录成功后返回当前页面，这一步需要在登录页操作。                
//                 case 401:
//                     // ElMessage({message:"登录过期，请重新登录",type:'warning',center:true})
//                     localStorage.removeItem('access_token');
//                     router.replace({
//                         path: '/login',
//                         query: { redirect: router.currentRoute.fullPath }
//                     });
//                     break;
//                 // 403 token过期                
//                 // 登录过期对用户进行提示                
//                 // 清除本地token和清空vuex中token对象                
//                 // 跳转登录页面                
//                 case 403:
//                     // ElMessage({message:"登录过期，请重新登录",type:'warning',center:true})
//                     // 清除token                    
//                     localStorage.removeItem('access_token');
//                     // localStorage.setItem("loginStatus", false)
//                     // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
//                     setTimeout(() => {
//                         router.replace({
//                             path: '/login',
//                             query: {
//                                 redirect: router.currentRoute.fullPath
//                             }
//                         });
//                     }, 1000);
//                     break;
//                 // 404请求不存在                
                
                    
//                 default:
//                 // ElMessage({message: error.response.data.message,type:'error',center:true})
//             }
//             return Promise.reject(error.response);
//         }
//     }
// );
// /** 
//  * get方法，对应get请求 
//  * @param {String} url [请求的url地址] 
//  * @param {Object} params [请求时携带的参数] 
//  */
// var get = function get(url, params) {
//     return new Promise((resolve, reject) => {
//         axios.get(urlPrefix + getUrl(url), {
//             params: params
//         }).then(res => {
//             resolve(res.data);
//         })
//             .catch(err => {
//                 reject(err.data)
//             })
//     });
// }
// /** 
//  * post方法，对应post请求 
//  * @param {String} url [请求的url地址] 
//  * @param {Object} params [请求时携带的参数] 
//  */
// var post = function post(params, headers) {
//     return new Promise((resolve, reject) => {
//         // Object.assign()
//         if(headers != null){
//             console.log('headers',Object.assign(headers, { 'Content-Type': 'application/json' }))
//         }
        
//         axios.post(urlPrefix , params, { headers: { 'Content-Type': 'application/json' } })
//             .then(res => {
//                 resolve(res.data);
//             })
//             .catch(err => {
//                 console.error('error:',err)
//                 reject(err.data)
//             })
//     });
// }



// export default { urls, get, post }