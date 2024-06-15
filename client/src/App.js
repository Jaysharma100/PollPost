
import './App.css';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate} from "react-router-dom";
import Home from './pages/Home.js';
import Signup from './pages/Signup.js';
import Login from './pages/login.js';
import Create_poll from './pages/create_poll.js';
import Userinfo from './pages/userinfo.js';
import Following from './pages/following.js';
import Mypolls from './pages/mypolls.js';
import Editpoll from './pages/Editpoll.js';
import Dataprovider from './Context/Dataprovider.js';
import { useState } from 'react';

const PrivateRoute=({isauth,...props})=>{
  return isauth?
  <>
  <Outlet/>
  </>
  : <Navigate replace to='/login'/>
}

function App() {
  
  const [isauth,authupdate]=useState(false);

  return (
    <>
    <Dataprovider>
    <Router>
      <Routes>
        <Route exact path='/signup' element={<Signup/>}/>
        <Route exact path='/login' element={
          <Login authupdate={authupdate}/>
        }/>
        <Route path='/' element={<PrivateRoute isauth={isauth}/>}>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path='/create_poll' element={<Create_poll/>}/>
          <Route exact path='/userinfo' element={<Userinfo username="myloarmy" name="Jay" email="email.com"/>}/>
          <Route exact path='/following' element={<Following/>}/>
          <Route exact path='/mypolls' element={<Mypolls/>}/>
          <Route exact path="/editpoll/:pollid" element={<Editpoll/>} />
        </Route>
      </Routes>
    </Router>
    </Dataprovider>
    </>
  );
}

export default App;
