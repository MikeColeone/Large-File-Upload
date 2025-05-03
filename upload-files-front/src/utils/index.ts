//简单封装axios
import axios from 'axios'

const baseURL = 'https://localhost:3000/api/' // 这里是你的后端接口地址

const service = axios.create({
  baseURL,
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

//拦截响应
service.interceptors.request.use(
  (reponse) => {
    // 在发送请求之前做些什么
    return reponse.data
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

export default service
