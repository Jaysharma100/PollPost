import React, { useContext, useEffect, useState } from 'react';
import Poll from './poll.js';
import { Datacontext } from '../Context/Dataprovider.js';

const Polls = (props) => {
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [followStatus, setFollowStatus] = useState({});
  const { account } = useContext(Datacontext);

  useEffect(() => {
    const fetchPollsAndFollowedUsers = async () => {
      try {
        const response = await fetch('https://pollpost.onrender.com/api/polls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': sessionStorage.getItem('accessToken')
          },
          body: JSON.stringify({ place: props.place, username: account.username, followuser: props.followuser }),
        });
        const data = await response.json();
        if (Array.isArray(data.polls)) {
          setPolls(data.polls);
          setFilteredPolls(data.polls); // Set initial filtered polls

          // Fetch follow status for each poll
          const initialFollowStatus = {};
          for (const poll of data.polls) {
            const followResponse = await fetch('https://pollpost.onrender.com/api/check_follow', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'authorization': sessionStorage.getItem('accessToken')
              },
              body: JSON.stringify({ currentUser: account.username, username: poll.username }),
            });
            const followData = await followResponse.json();
            initialFollowStatus[poll.username] = followData.isFollowing;
          }
          setFollowStatus(initialFollowStatus);
        } else {
          console.error('Unexpected response structure:', data);
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      }
    };

    fetchPollsAndFollowedUsers();
  }, [props.place, account.username, props.followuser]);

  useEffect(() => {
    const filtered = polls.filter(poll => {
      const title = poll.title ? poll.title.toLowerCase() : '';
      const content = poll.content ? poll.content.toLowerCase() : '';
      const username = poll.username ? poll.username.toLowerCase() : '';

      return title.includes(searchQuery.toLowerCase()) ||
             content.includes(searchQuery.toLowerCase()) ||
             username.includes(searchQuery.toLowerCase());
    });
    setFilteredPolls(filtered);
  }, [searchQuery, polls]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFollowToggle = (username) => {
    setFollowStatus((prevStatus) => ({
      ...prevStatus,
      [username]: !prevStatus[username],
    }));
  };

  return (
    <div className='polls-container'>
      <div className="searchbar">
        <input
        type='text'
        className='search-input'
        placeholder='Search by title/username'
        value={searchQuery}
        onChange={handleSearchChange}
        />
      </div> 
      <div className='polls'>
        {filteredPolls.map((poll) => (
          <Poll
            key={poll._id}
            pollid={poll._id}
            title={poll.title}
            content={poll.content}
            options={poll.options}
            username={poll.username}
            likedusers={poll.likes ? poll.likes.usernames : []} // Check if poll.likes is defined
            totallikes={poll.likes ? poll.likes.totallikes : 0} // Check if poll.likes is defined
            isFollowing={followStatus[poll.username]}
            onFollowToggle={handleFollowToggle}
            place={props.place}
          />
        ))}
      </div>
    </div>
  );
};

export default Polls;
