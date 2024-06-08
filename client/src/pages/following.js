import React, { useState, useEffect, useContext } from 'react';
import Polls from '../components/polls';
import Navbar from '../components/Navbar';
import Users from '../components/users';
import { Datacontext } from '../Context/Dataprovider';

const Following = () => {
  const [clicked, setClicked] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [following, setFollowing] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const { account } = useContext(Datacontext);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/users-i-follow/${account.username}`, {
          method: 'POST'
        });
        if (response.ok) {
          const data = await response.json();
          setFollowing(data);
          setFilteredFollowing(data);
        } else {
          console.error('Error fetching following users:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching following users:', error);
      }
    };

    fetchFollowing();
  }, [account.username,clicked]);

  const display = clicked ? "" : " not_display";
  const notdisplay = clicked ? " not_display" : "";

  const handleClick = async (e) => {
    const username = e.target.parentNode.querySelector(".usernameishere").innerHTML;
    setClicked(username);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = following.filter(user =>
      user.username.toLowerCase().includes(value) ||
      user.name.toLowerCase().includes(value)
    );
    setFilteredFollowing(filtered);
  };

  return (
    <>
      <Navbar />
      <div className='following'>
        <div className="followerlist">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search following users..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <div className="users">
            <Users users={filteredFollowing} func={handleClick} />
            {filteredFollowing.length === 0 &&
              <>
                <span>No such User exists..</span>
                <p className='mx-3'><b>Try checking correct name/username</b></p>
              </>
            }
          </div>
        </div>
        <div className="userpoll">
          <div className={`pollclicked${display}`}>
            <Polls place="following" followuser={clicked} />
          </div>
          <div className={`noclicked${notdisplay}`}>
            <span>Click a following user to view their posts</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Following;
