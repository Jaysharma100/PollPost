import React from 'react'

const Poll = (props) => {
  return (
    <>
    <div className='polldiv'>
        <div className="poll_user"></div>
        <div className="poll_title">{props.title}</div>
        <div className="poll_content">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aut illum amet ea beatae repellendus nemo, magnam magni maxime expedita dolor velit qui in, itaque minima, at praesentium porro ullam? Tempora, tempore officia! Fugiat, aliquam eaque.
        </div>
        <div className="poll_option">
            <li className="poll_optionlist">
                <ul>option1</ul>
                <ul>option2</ul>
                <ul>option3</ul>
            </li>
        </div>
    </div>
    </>
  )
}

export default Poll
