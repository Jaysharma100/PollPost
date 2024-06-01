import React, { useState } from 'react';
import Polls from '../components/polls';
import Navbar from '../components/Navbar';
import User from '../components/user';

const Following = () => {
  const [clicked, setClicked] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const usersList = [
    { username: "user1", name: "John Doe" },
    { username: "user2", name: "Jane Smith" },
    { username: "user3", name: "Alice Johnson" },
    // Add more users as needed
  ];  
  const [filteredUsers, setFilteredUsers] = useState(usersList); // Initialize with all users

  const display = clicked ? "" : " not_display";
  const notdisplay = clicked ? " not_display" : "";

  

  function handleClick(e) {
    setClicked(e.target.parentNode.querySelector(".usernameishere").innerHTML);
    console.log(clicked);
  }

  function handleSearch(e) {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = usersList.filter(user => 
      user.username.toLowerCase().includes(value) || 
      user.name.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  }

  return (
    <>
      <Navbar />
      <div className='following'>
        <div className="followerlist">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search followers..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
            />
        </div>
        <div className="users">
          {filteredUsers && filteredUsers.map(user => (
            <User 
            key={user.username} 
            func={handleClick} 
            username={user.username} 
            name={user.name} 
            />
          ))}
          { filteredUsers.length===0 && 
          <>
          <span>No such User exist..</span>
          <p className='mx-3'><b>Try checking correct name/username</b></p>
          </>
          }
        </div>
        </div>
        <div className="userpoll">
          <div className={`pollclicked${display}`}>
            <Polls />
          </div>
          <div className={`noclicked${notdisplay}`}>
            <span>Click a follower to view their posts</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Following;
