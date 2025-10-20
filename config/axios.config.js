import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL,
});


const unProtectedApi = [
  '/api/validateToken'
]


axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !unProtectedApi.includes(config.url)) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.status === 401) {
      localStorage.clear()
      window.location.href = window.location.origin
    }
    return Promise.reject(error);
  }
);


const baseURL = process.env.NEXT_PUBLIC_SITE_URL + "/api"; // Change this if using a diffe // Change this if using a different backend API

export const api = axios.create({
  baseURL,
});


export default axiosInstance;  
