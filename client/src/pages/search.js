import React from 'react'
import Users from '../components/users'
import Polls from '../components/polls'
import Navbar from '../components/Navbar'

const search = () => {
  return (
    <div>
      <Navbar/>
      <div className="search">
        <div className="getusers">
            <span>Users</span>
            <Users/>
        </div>
        <div className="getposts">
            <span>Polls</span>
            <Polls/>
        </div>
      </div>
    </div>
  )
}

export default search
