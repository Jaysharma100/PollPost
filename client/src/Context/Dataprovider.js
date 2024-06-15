// Context/Dataprovider.js

import React, { createContext, useState, useEffect } from 'react';

export const Datacontext = createContext(null);

const Dataprovider = ({ children }) => {
    const [auth, setAuth] = useState(false); // Initial auth state
    const [account, setAccount] = useState(null); // User account info

    // Check for authentication status on initial load
    useEffect(() => {
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken) {
            setAuth(true);
            // Fetch user details based on accessToken if needed
            // Example fetchUserDetails(accessToken);
        }
    }, []);

    // Example method to update authentication state
    const updateAuth = (value) => {
        setAuth(value);
    };

    return (
        <Datacontext.Provider value={{ auth, updateAuth, account, setAccount }}>
            {children}
        </Datacontext.Provider>
    );
};

export default Dataprovider;
