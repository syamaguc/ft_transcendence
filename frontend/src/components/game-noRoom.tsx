import React from 'react'
import style from '../styles/game.module.css'

type Props = {
  status: number
}

const DisplayNoRoom = ({ status }: Props) => {
  return (
    <div className={status == -2 ? style.startBox : style.boxNonActive}>
      <p>no room</p>
    </div>
  )
}

export default DisplayNoRoom
