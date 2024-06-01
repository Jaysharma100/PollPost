import React from 'react'
import User from './user'

const users = (props) => {
  return (
    <div>
      <User name="jay" func={props.func} username="myloarmy"/>
      <User name="jay" func={props.func} username="myloarmy"/>
    </div>
  )
}

export default users
