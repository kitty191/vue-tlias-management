/*
 *                             _ooOoo_
 *                            o8888888o
 *                            88" . "88
 *                            (| -_- |)
 *                            O\  =  /O
 *                         ____/`---'\____
 *                       .'  \\|     |//  `.
 *                      /  \\|||  :  |||//  \
 *                     /  _||||| -:- |||||-  \
 *                     |   | \\\  -  /// |   |
 *                     | \_|  ''\---/''  |   |
 *                     \  .-\__  `-`  ___/-. /
 *                   ___`. .'  /--.--\  `. . __
 *                ."" '<  `.___\_<|>_/___.'  >'"".
 *               | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *               \  \ `-.   \_ __\ /__ _/   .-` /  /
 *          ======`-.____`-.___\_____/___.-`____.-'======
 *                             `=---='
 *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                     佛祖保佑       永无BUG
 */

/*
 * 　　　　　　　┏┓　　　┏┓
 * 　　　　　　┏┛┻━━━┛┻┓
 * 　　　　　　┃　　　　　　┃
 * 　　　　　　┃　　　━　　　┃
 * 　　　　　　┃　┳┛　┗┳　┃
 * 　　　　　　┃　　　　　　┃
 * 　　　　　　┃　　　┻　　　┃
 * 　　　　　　┃　　　　　　┃
 * 　　　　　　┗━┓　　　┏━┛
 * 　　　　　　　　┃　　　┃神兽保佑
 * 　　　　　　　　┃　　　┃代码无BUG！
 * 　　　　　　　　┃　　　┗━━━┓
 * 　　　　　　　　┃　　　　　　┣┓
 * 　　　　　　　　┃　　　　　　┏┛
 * 　　　　　　　　┗┓┓┏━┳┓┏┛
 * 　　　　　　　　　┃┫┫　┃┫┫
 * 　　　　　　　　　┗┻┛　┗┻┛
 * 　　　　　　　神兽草泥马到此一游
 */

import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

//创建axios实例对象
const request = axios.create({
  baseURL: "/api",
  timeout: 600000,
});

//axios的请求拦截器，获取localStorage中的token，在请求头中增加token
request.interceptors.request.use(
  (config) => {
    //获取登录用户信息
    const loginUser = JSON.parse(localStorage.getItem("loginUser"));
    if (loginUser && loginUser.token) {
      config.headers.token = loginUser.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


//axios的响应，拦截器
request.interceptors.response.use(
  (response) => {
    //成功回调
    return response.data;
  },
  (error) => {
    //失败回调
    if (error.response.status === 401) {
      // token过期，跳转到登录页
      ElMessage.error("登录过期，请重新登录");
      router.push("/login");
    }
  }
);

export default request;