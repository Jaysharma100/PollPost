import React from 'react';
import User from './user';

const Users = ({ users, func }) => {
  return (
    <div>
      {users.map(user => (
        <User key={user.username} name={user.name} func={func} username={user.username} avatar={user.avatar} />
      ))}
    </div>
  );
}

export default Users;
