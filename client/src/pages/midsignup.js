import React, { useState } from 'react';

const MidSignup = () => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Username:', username);
    console.log('Avatar:', avatar);
    // You can further process the form data or send it to a server here
  };

  return (
    <>
    <div className="midsignupcontainer">
      <h2>Add to your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>
        <div>
          <label htmlFor="avatar">Avatar:</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            required
            />
        </div>
        {/* {avatarPreview && (
            <div>
            <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
          </div>
        )} */}
        <button type="submit">Add</button>
      </form>
    </div>
    {
    avatarPreview && 
    <div className="avatarpreview">
        <span>Preview</span>
        <img src={avatarPreview} alt="" />
    </div>
    }   
    </>
  );
};

export default MidSignup;
