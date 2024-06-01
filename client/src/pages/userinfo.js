import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import Navbar from '../components/Navbar';

const Userinfo = (props) => {
  const [btnstate, setBtnstate] = useState(false);
  const [btnstateName, setBtnstateName] = useState(false);
  const [btnstateEmail, setBtnstateEmail] = useState(false);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [file, setfile] = useState(null);

  // Use useNavigate hook
  const navigate = useNavigate();

  function handlechange4Name(e) {
    setname(name => e.target.value);
  }
  function handlechange4Email(e) {
    setemail(email => e.target.value);
  }
  function handlechange4file(e) {
    setfile(file => e.target.value);
  }

  function changeclass() {
    setBtnstate(btnstate => !btnstate);
    setfile(file => null);
  }
  function handlechange1() {
    setBtnstateName(btnstateName => !btnstateName);
    setname(name => "");
  }
  function handlechange2() {
    setBtnstateEmail(btnstateEmail => !btnstateEmail);
    setemail(email => "");
  }

  let classadd = btnstate ? "" : " not_display";
  let removeclass = btnstate ? " not_display" : "";
  let classaddName = btnstateName ? "" : " not_display";
  let removeclassName = btnstateName ? " not_display" : "";
  let classaddEmail = btnstateEmail ? "" : " not_display";
  let removeclassEmail = btnstateEmail ? " not_display" : "";

  return (
    <>
      <Navbar />
      <div className='userinfoparent'>
        <h1>Here's your UserInfo</h1>
        <div className="userinfo">
          <div className="avatar">
            <img className='avatarimg' src="https://www.lifewire.com/thmb/QHQ6bozSxK457Zhogqdo-zXnKos=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/ScreenShot2020-04-20at10.06.28AM-69855f4797cb4be4bbed72f51dff1ab5.jpg" alt="" />
            <button className={`${removeclass}`} onClick={changeclass}>✏️ change profile</button>
            <div className={`avatarchange${classadd}`}>
              <input type="file" value={file} onChange={handlechange4file} />
              <button className='avatarsubmit' >change!</button>
              <button className='avatarnochange' onClick={changeclass}>go back</button>
            </div>
          </div>
          <div className="info">
            <div className="username same1">
              <span>Username</span>
              <p>{props.username}</p>
            </div>
            <div className="name same1">
              <span>Name</span>
              <button className={`changeinfo${removeclassName}`} onClick={handlechange1}>✏️</button>
              <div className={`${classaddName}`}>
                <input className="changemade" type="text" placeholder='New Name?' value={name} onChange={handlechange4Name} />
                <button className="changemade" >Change</button>
                <button className="changemade" onClick={handlechange1}>⬅️</button>
              </div>
              <p>{props.name}</p>
            </div>
            <div className="email same1">
              <span>Email</span>
              <button className={`changeinfo${removeclassEmail}`} onClick={handlechange2}>✏️</button>
              <div className={`${classaddEmail}`}>
                <input className='changemade' type="email" placeholder='New Email?' value={email} onChange={handlechange4Email} />
                <button className='changemade'>Change</button>
                <button className="changemade" onClick={handlechange2}>⬅️</button>
              </div>
              <p>{props.email}</p>
            </div>
            <div className="navigate same1">
              <div className="followingnav">
                {/* Use navigate function to navigate to desired routes */}
                <button onClick={() => navigate('/following')}>Following ↗️</button>
              </div>
              <div className="mypollsnav">
                {/* Use navigate function to navigate to desired routes */}
                <button onClick={() => navigate('/mypolls')}>My-polls ↗️</button>
              </div>
            </div>
          </div>
        </div>
        <div className="stats">
          <span className='statspan'>Liked Posts: {props.likedpost}</span>
          <span className='statspan'>Time spent on App! : {props.timespent}</span>
          <span className='statspan'>Total Comments: {props.comments}</span>
          <span className='statspan'>Following: {props.following}</span>
          <span className='statspan'>Followers: {props.followers}</span>
        </div>
      </div>
    </>
  )
}

export default Userinfo;
