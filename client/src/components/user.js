import React from 'react';

const User = (props) => {
  return (
    <>
      <div className="user" onClick={props.func}>
        <div className="userimg">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE1yPVkmxPPvbPPyv0gZ0lpRBsgBnT7nfhZA&s" alt="" />
        </div>
        <div className="nameofuser">
          <p className='usernameishere'>{props.username}</p>
          <p className="nameishere">-  [{props.name}]</p>
        </div>
      </div>
    </>
  );
}

export default User;
