import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import Navbar from '../components/Navbar';
import { Datacontext } from '../Context/Dataprovider';

const Userinfo = () => {
  const [btnstate, setBtnstate] = useState(false);
  const [btnstateName, setBtnstateName] = useState(false);
  const [btnstateEmail, setBtnstateEmail] = useState(false);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [file, setfile] = useState(null);
  const {account,setaccount}=useContext(Datacontext);

  // Use useNavigate hook
  const navigate = useNavigate();

  async function updateuser(e){
    e.preventDefault();
    
    const formData = new FormData();

    // Append fields to the FormData object
    formData.append('username', account.username);

    if (name !== "") {
        formData.append('field', 'name');
        formData.append('value', name);
    }

    if (email !== "") {
        formData.append('field', 'email');
        formData.append('value', email);
    }

    if (file) {
        // Append the file to FormData
        formData.append('avatar', file);
        // If you're updating the avatar, set the field name to 'avatar'
        formData.append('field', 'avatar');
    }

    try {
        const response = await fetch('http://localhost:8000/api/update_user', {
            method: 'POST',
            headers:{
              'authorization': sessionStorage.getItem('accessToken')
            },
            body: formData,
        });
  
      if (response.ok) {
        const data = await response.json();
        console.log('User updated successfully:', data);
        setaccount(data.user);
      } else {
        console.error('Failed to update user:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  function handlechange4Name(e) {
    setname(name => e.target.value);
  }
  function handlechange4Email(e) {
    setemail(email => e.target.value);
  }
  function handlechange4file(e) {
    const file = e.target.files[0];
        if (file) {
          setfile(file);
        }
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
            <img className='avatarimg' src={`http://localhost:8000/${account.avatar}`} alt="" />
            <button className={`${removeclass}`} onClick={changeclass}>✏️ change profile</button>
            <div className={`avatarchange${classadd}`}>
              <input type="file" accept="image/*" onChange={handlechange4file} />
              <button className='avatarsubmit' onClick={updateuser} >change!</button>
              <button className='avatarnochange' onClick={changeclass}>go back</button>
            </div>
          </div>
          <div className="info">
            <div className="username same1">
              <span>Username</span>
              <p>{account.username}</p>
            </div>
            <div className="name same1">
              <span>Name</span>
              <button className={`changeinfo${removeclassName}`} onClick={handlechange1}>✏️</button>
              <div className={`${classaddName}`}>
                <input className="changemade" type="text" placeholder='New Name?' value={name} onChange={handlechange4Name} />
                <button className="changemade" onClick={updateuser}>Change</button>
                <button className="changemade" onClick={handlechange1}>⬅️</button>
              </div>
              <p>{account.name}</p>
            </div>
            <div className="email same1">
              <span>Email</span>
              <button className={`changeinfo${removeclassEmail}`} onClick={handlechange2}>✏️</button>
              <div className={`${classaddEmail}`}>
                <input className='changemade' type="email" placeholder='New Email?' value={email} onChange={handlechange4Email} />
                <button className='changemade'onClick={updateuser}>Change</button>
                <button className="changemade" onClick={handlechange2}>⬅️</button>
              </div>
              <p>{account.email}</p>
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
          {/* <span className='statspan'>Liked Posts: {props.likedpost}</span>
          <span className='statspan'>Time spent on App! : {props.timespent}</span>
          <span className='statspan'>Total Comments: {props.comments}</span>
          <span className='statspan'>Following: {props.following}</span>
          <span className='statspan'>Followers: {props.followers}</span> */}
        </div>
      </div>
    </>
  )
}

export default Userinfo;
