import React, { useEffect, useState } from 'react';
import Users from '../components/users';
import Polls from '../components/polls';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

const Search = () => {
  const query = useQuery();
  const searchQuery = query.get('query');
  const [users, setUsers] = useState([]);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        // Fetch users
        const userResponse = await fetch(`http://localhost:8000/api/search/users?query=${searchQuery}`);
        const userData = await userResponse.json();
        setUsers(userData.users);

        // Fetch polls
        const pollResponse = await fetch(`http://localhost:8000/api/search/polls?query=${searchQuery}`);
        const pollData = await pollResponse.json();
        setPolls(pollData.polls);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery]);

  return (
    <div>
      <Navbar />
      <div className="search">
        <div className="getusers">
          <span>Users</span>
          <Users users={users} />
        </div>
        <div className="getposts">
          <span>Polls</span>
          <Polls polls={polls} />
        </div>
      </div>
    </div>
  );
}

export default Search;
