import axios from 'axios';
import {api_returnmsg, service_url} from '../constants/config.js'

const Api_url = 'http://localhost:8000';

const axiosinstance = axios.create({
    baseURL: Api_url,
    timeout: 10000,
    headers: {
        "Content-Type":"application/json"
    }
})

axiosinstance.interceptors.request.use(
    function(config){
        return config;
    },
    function(error){
        return Promise.reject(error);
    }
)

axiosinstance.interceptors.response.use(
    function(response){
        return processresponse(response);
    },
    function (error){
        return Promise.reject(processerror(error));
    }
)

const processresponse=(response)=>{
    if(response?.status===200){
        return{ isSucess:true ,data:response.data}
    }
    else{
        return{
            isfailure:true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        }
    }
}

const processerror=(error)=>{
    if(error.response){
        //req recievedby server but bad response
        console.log('error in response: ',error.toJSON())
        return{
            isError: true,
            msg: api_returnmsg.responsefailure,
            code: error.response.status
        }
    }
    else if(error.request){
        //req recievedby server but no response
        console.log('error in request: ',error.toJSON())
        return{
            isError: true,
            msg: api_returnmsg.requestfailure,
            code: ""
        }
    }
    else{
        //some error in setting up(may be fontend, may be backend )
        console.log('error in network: ',error.toJSON())
        return{
            isError: true,
            msg: api_returnmsg.networkerror,
            code: ""
        }
    }
}

const api={};

for(const {key,value} of Object.entries(service_url)){
    api[key]=(body)=>
        axiosinstance({
            method: value.method,
            url: value.url,
            data:  body,
            responseType: value.responseType,
        })
}

export default api;