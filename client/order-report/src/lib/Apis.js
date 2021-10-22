import axios from 'axios';
import qs from 'qs';

console.log(process.env.REACT_APP_CONTAINER_URL)

const instance = axios.create({
    baseURL: process.env.REACT_APP_CONTAINER_URL || 'http://localhost:8080',
    timeout: 30000
});

const APIS = {
    GET_ORDER: '/api/order'    
}

const request = (method, url, options) => {
        switch(method) {            
            case 'POST':
                // const data = qs.stringify(options);
                return(instance.post(`${url}`, options));               
            case 'GET':                
            const opt = options ? options : {} 
                return(instance.get(`${url}`, opt));
            default:
                return false;
        }
}

export {
    APIS,
    request
}