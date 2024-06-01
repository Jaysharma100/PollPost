import React from 'react'
import Poll from './poll.js'

const polls = (props) => {
  return (
    <div className='polls'>
    <Poll title={props.title}/>
    <Poll/>
    </div>
  )
}

export default polls
