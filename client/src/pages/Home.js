import React from 'react'
import Polls from '../components/polls.js';
import Navbar from '../components/Navbar.js';

const Home = () => {
  return (
    <>
    <Navbar/>
    <div className="homediv">
    <Polls/>
    </div>
    </>
  )
}

export default Home
