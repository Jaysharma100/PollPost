import React, { useContext, useEffect, useState } from 'react';
import { Datacontext } from '../Context/Dataprovider.js';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:8000', { transports: ['websocket', 'polling', 'flashsocket'], withCredentials: true, path: "/socket.io" });

const Poll = (props) => {
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(props.totallikes);
  const [isLiked, setIsLiked] = useState(false);
  const { account } = useContext(Datacontext);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voteCounts, setVoteCounts] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      await checkLikeStatus();
      await fetchComments();
      await checkUserVote();
    };

    const checkLikeStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/check_like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': sessionStorage.getItem('accessToken')
          },
          body: JSON.stringify({ pollid: props.pollid, username: account.username }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          return;
        }

        const data = await response.json();
        setIsLiked(data.isLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/comments/${props.pollid}`, {
          headers: {
            'authorization': sessionStorage.getItem('accessToken')
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          return;
        }

        const data = await response.json();
        setComments(data.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    const checkUserVote = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/check_vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': sessionStorage.getItem('accessToken')
          },
          body: JSON.stringify({ pollId: props.pollid, username: account.username }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          return;
        }

        const data = await response.json();
        if (data.hasVoted) {
          setSelectedOption(data.optionIndex);
        }
      } catch (error) {
        console.error('Error checking user vote:', error);
      }
    };

    fetchInitialData();
  }, [account.username, props.pollid, props.username]);

  useEffect(() => {
    if (props.options && Array.isArray(props.options)) {
      setVoteCounts(props.options.map(option => option.votes));
    }
  }, [props.options]);

  const handleFollowClick = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': sessionStorage.getItem('accessToken')
        },
        body: JSON.stringify({ currentUser: account.username, username: props.username }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return;
      }

      const data = await response.json();
      if (props.onFollowToggle) {
        props.onFollowToggle(props.username);
      }
    } catch (error) {
      toast.error("Failed follow request! Try Again");
    }
  };

  const handleLikeClick = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/update_likes/${props.pollid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': sessionStorage.getItem('accessToken')
        },
        body: JSON.stringify({ username: account.username }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return;
      }

      const data = await response.json();
      setLikes(data.likes.totallikes);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating poll likes:', error);
    }
  };

  const handleCommentClick = () => {
    setIsCommentSectionVisible(!isCommentSectionVisible);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': sessionStorage.getItem('accessToken')
        },
        body: JSON.stringify({
          pollId: props.pollid,
          username: account.username,
          text: comment,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return;
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      socket.emit('comments', data.comment);
      setComment('');
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleOptionSelect = async (index) => {
    try {
      const deselect = selectedOption === index; // Check if the option is being deselected
      const response = await fetch('http://localhost:8000/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem('accessToken') // Add token if needed
        },
        body: JSON.stringify({
          pollId: props.pollid,
          optionIndex: index,
          username: account.username,
          deselect: deselect, // Send deselect flag
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return;
      }

      const data = await response.json();
      if (data.message === 'Vote registered successfully') {
        if (deselect) {
          setSelectedOption(null); // Deselect option
        } else {
          setSelectedOption(index);
        }
        if (data.poll && data.poll.options) {
          const updatedVotes = data.poll.options.map(option => option.votes);
          setVoteCounts(updatedVotes);
          socket.emit('votes', updatedVotes);
        }
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  };

  socket.on('comment', (data) => {
    setComments([data, ...comments]);
  });

  socket.on('vote', (votes) => {
    setVoteCounts(votes);
  });

  const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

  return (
    <>
    <div className='polldiv'>
      <div className="poll_user_container">
        <div className="poll_user">by {props.username}</div>
        {props.username !== account.username && (
          <button className="follow_button" onClick={handleFollowClick}>
            {props.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
        {props.place === "mypolls" && (
          <Link className="edit_button" to={`/editpoll/${props.pollid}`}>Edit</Link>
        )}
      </div>
      <div className="poll_title">{props.title}</div>
      <div className="poll_content">{props.content}</div>
      <div className="poll_option">
        <ul className="poll_optionlist">
          {props.options && props.options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionSelect(index)}
              style={{
                backgroundColor: selectedOption === index ? 'lightblue' : 'transparent',
                cursor: selectedOption === null ? 'pointer' : 'default',
              }}
            >
              {option.image && <img src={`http://localhost:8000/uploads/${option.image}`} alt={`Option ${index + 1}`} />}
              {option.text}
              {selectedOption !== null && (
                <div className="progress_container">
                  <div
                    className="progress"
                    style={{ width: `${totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0}%`, backgroundColor: selectedOption === index ? 'rgb(111, 4, 211)' : 'gray' }}
                  >
                  </div>
                  {totalVotes > 0 ? `${Math.round((voteCounts[index] / totalVotes) * 100)}%` : '0%'}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="poll_actions">
        <button className="action_button" onClick={handleLikeClick}>
          {isLiked ? 'Unlike' : 'Like'}
        </button>
        <p>{likes}</p>
        <button className="action_button" onClick={handleCommentClick}>Comment</button>
      </div>
      {isCommentSectionVisible && (
        <div className="comment_section">
          <span>Comments...</span>
          <div className="comments">
            {comments.map((c, index) => (
              <div key={index} className="comment">
                <p><h3>{c.username}</h3> <p>{new Date(c.time).toLocaleString()}</p></p>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <textarea
            className="comment_input"
            value={comment}
            onChange={handleCommentChange}
            placeholder="Type your comment here..."
          />
          <button className="submit_comment_button" onClick={handleCommentSubmit}>Submit</button>
        </div>
      )}
    </div>
    <ToastContainer />
    </>
  );
};

Poll.defaultProps = {
  onFollowToggle: () => {}, // Provide a default empty function
};

export default Poll;
