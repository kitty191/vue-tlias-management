import axios from "axios";

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
    return Promise.reject(error);
  }
);

export default request;
