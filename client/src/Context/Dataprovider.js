import React,{createContext,useState} from 'react'

export const Datacontext = createContext(null);
const Dataprovider = ({children}) => {
    
    const [account,setaccount]=useState({username:'',name:'',email:'',avatar:''})
  return (
    <Datacontext.Provider value={{
        account,setaccount
    }}>
       {children}  
    </Datacontext.Provider>
  )
}

export default Dataprovider
