import React from 'react';

const User = ({ func, username, name, avatar }) => {
  return (
    <div className="user" onClick={func}>
      <div className="userimg">
        <img src={`https://pollpost.onrender.com/${avatar}`} alt="User Avatar" />
      </div>
      <div className="nameofuser">
        <p className='usernameishere'>{username}</p>
        <p className="nameishere">- [{name}]</p>
      </div>
    </div>  
  );
}

export default User;
