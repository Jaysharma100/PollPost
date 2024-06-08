import React, { useState,useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Datacontext } from '../Context/Dataprovider';

const Login = ({ authupdate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {account,setaccount}= useContext(Datacontext);
    const navigate = useNavigate(); // Replaces useHistory

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Add your authentication logic here
        // For example, you can make a fetch request to your API
        const formData = new FormData();
        formData.append('email',email);
        formData.append('password',password);

        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        });
        const data= await response.json();
        console.log(data);
        if (response.ok) {
            // if(data.accesstoken && data.refreshtoken){
            // sessionStorage.setItem('accesstoken', `Bearer ${data.accesstoken}`);
            // sessionStorage.setItem('refreshtoken', `Bearer ${data.refreshtoken}`);
            // }
            // else{
            //     console.log("error");
            //     return;
            // }

            setaccount({username:data.username, name:data.name, email:data.email, avatar:data.avatar});
            console.log(account);
            authupdate(true);
            navigate('/');
        } else {
            alert('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="loginbody">
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? <Link to="/signup">Register here</Link>
            </p>
        </div>
        </div>
    );
};

export default Login;
