import React, { useContext, useEffect, useState } from 'react';
import { Datacontext } from '../Context/Dataprovider.js';

const Poll = (props) => {
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(props.totallikes);
  const [isLiked, setIsLiked] = useState(false);
  const { account } = useContext(Datacontext);

  useEffect(() => {
    const fetchInitialData = async () => {
      await checkLikeStatus();
      await fetchComments();
    };

    const checkLikeStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/check_like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
        const response = await fetch(`http://localhost:8000/api/comments/${props.pollid}`);

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

    fetchInitialData();
  }, [account.username, props.pollid, props.username]);

  const handleFollowClick = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentUser: account.username, username: props.username }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return;
      }

      const data = await response.json();
      alert(data.message);
      props.onFollowToggle(props.username); // Update follow status in parent component
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleLikeClick = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/update_likes/${props.pollid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      alert(`Comment added: ${data.comment.text}`);
      setComments([data.comment, ...comments]);
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className='polldiv'>
      <div className="poll_user_container">
        <div className="poll_user"> by {props.username}</div>
        {props.username !== account.username && (
          <button className="follow_button" onClick={handleFollowClick}>
            {props.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
      <div className="poll_title">{props.title}</div>
      <div className="poll_content">{props.content}</div>
      <div className="poll_option">
        <ul className="poll_optionlist">
          {props.options.map((option, index) => (
            <li key={index}>
              {option.image && <img src={`http://localhost:8000/uploads/${option.image}`} alt={`Option ${index + 1}`} />}
              {option.text}
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
  );
};

export default Poll;
