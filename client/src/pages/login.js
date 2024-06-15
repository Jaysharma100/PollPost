import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Datacontext } from '../Context/Dataprovider.js';

const Login = ({ authupdate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setAccount } = useContext(Datacontext);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('accessToken', `Bearer ${data.accessToken}`);
            sessionStorage.setItem('refreshToken', `Bearer ${data.refreshToken}`);
            setAccount({ username: data.username, name: data.name, email: data.email, avatar: data.avatar });
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
