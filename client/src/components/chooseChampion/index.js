import React from 'react'
import './chooseChampion.css'
import avatarPlayer from '../../assets/avatarPlayer.png'
const plays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const chooseChampion = ({ closeChoose }) => {
  return (
    <div>
      <div className="fade" />
      <div className="add-champion">
        <h2>Choose your champion</h2>
        <button className="close-block" onClick={closeChoose} />
        <form>
          <div className="players">
            {plays.map(item => (
              <div className="player-item">
                <img src={avatarPlayer} alt="avatar player" />
                <p>item.name</p>
              </div>
            ))}
          </div>
          <button onClick="">Add player</button>
        </form>
      </div>
    </div>
  )
}

export default chooseChampion
