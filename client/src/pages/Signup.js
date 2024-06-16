import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import default_profile from '../defualt_profile.webp';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState(default_profile);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [show,setshow]=useState(false);
    const [error,seterror]=useState('');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
      };
    
    const handleAvatarChange =(e) => {
        const file = e.target.files[0];
        if (file) {
          setAvatar(file);
          setAvatarPreview(URL.createObjectURL(file));
        }
      };
    const handleSubmit1= (e)=>{
        e.preventDefault();
        setshow(true);
    }
    const addclass1=show? " not_display":"";
    const addclass2=show? "":" not_display";

    const handleSubmit2 = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('username', username);
        formData.append('avatar', avatar);
        const response = await fetch('http://localhost:8000/api/signup', {
            method: 'POST',
            body: formData // Initialize username a s an empty string
        });
        const data=await response.json()
        if (response.status===200) {
            alert(data.msg);
            navigate('/login');
        } else {
            seterror('Signup failed. Please try again.');
        }
    };

    return (
        <div className="signupbody">
        <div className={`signup-container${addclass1}`}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit1}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        />
                </div>
                <button type='submit'>Next</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
        <div className={`midsignupcontainer${addclass2}`}>
            <h2>Add to your Profile</h2>
            <form onSubmit={handleSubmit2}>
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
                <button type="submit">Signup</button>
            </form>
            {error && <p className='text-danger'>{error}</p>
            }
        </div>
        {
        avatarPreview && 
        <div className="avatarpreview">
        <span>Preview</span>
        <img src={avatarPreview} alt="" />
        </div>
        } 
        </div>
    );
};

export default Signup;
