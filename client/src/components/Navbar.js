import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {

    return (
        <nav className="navbar navbar-expand-lg navbar-light navbarcss fixed">
            <Link className="navbar-brand text-white" to="/">POLLPOST</Link>
            <button className="navbar-toggler bgw" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item active mx-3">
                        <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item mx-3">
                        <Link className="nav-link" to="/create_poll">Create Poll</Link>
                    </li>
                    <li className="nav-item mx-3">
                        <Link className="nav-link" to="/following">Following</Link>
                    </li>
                    <li className="nav-item dropdown mx-3">
                        <Link className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Profile
                        </Link>
                        <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <Link className="dropdown-item" to="/userinfo">User Info</Link>
                            <Link className="dropdown-item" to="/mypolls">My Polls</Link>
                            <div className="dropdown-divider"></div>
                            <Link className="dropdown-item" to="/signup">Logout</Link>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
