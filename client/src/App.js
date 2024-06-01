
import './App.css';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from './pages/Home.js';
import Signup from './pages/Signup.js';
import Login from './pages/login.js';
import Create_poll from './pages/create_poll.js';
import Userinfo from './pages/userinfo.js';
import Following from './pages/following.js';
import Mypolls from './pages/mypolls.js';
import Midsignup from './pages/midsignup.js';
import Search from './pages/search.js';

function App() {
  
  return (
    <>
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route exact path='/signup' element={<Signup/>}/>
        <Route exact path='/login' element={<Login/>}/>
        <Route exact path='/create_poll' element={<Create_poll/>}/>
        <Route exact path='/userinfo' element={<Userinfo username="myloarmy" name="Jay" email="email.com"/>}/>
        <Route exact path='/following' element={<Following/>}/>
        <Route exact path='/mypolls' element={<Mypolls/>}/>
        <Route exact path='/midsignup' element={<Midsignup/>}/>
        <Route exact path='/search' element={<Search/>}/>
      </Routes>
    </Router>
    </>
  );
}

export default App;
