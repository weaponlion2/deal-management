import axios from 'axios';

//  export const host: string = "https://localhost:7003";
// export const host: string = window.location.origin;
export const host: string = "https://192.168.1.204:1008";
const baseURL: string = "/api/";

const myAxios = axios.create({
  baseURL: host + baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json', 
  },
});


myAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("@Login");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => { 
    return Promise.reject(error);
  }
);


myAxios.interceptors.response.use(
  (response) => { 
    return response;
  },
  (error) => { 
    return Promise.reject(error);
  }
);

export default myAxios;
