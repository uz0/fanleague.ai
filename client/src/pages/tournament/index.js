import React, { Component } from 'react'
import style from './tournament.module.css'
import ChooseChamp from '../../components/chooseChampion'

import AuthService from '../../services/authService'
const addCards = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
const matchesItems = [{ id: '1', time: '10:30', nameMatch: 'First Match' }, { id: '2', time: '12:40', nameMatch: 'Second Match' }, { id: '3', time: '15:00', nameMatch: 'Third Match' }, { id: '4', time: '18:20', nameMatch: 'Fourth Match' }, { id: '5', time: '20:00', nameMatch: 'Final Grand Match' }]
const leaders = [{ number: '1', name: 'DiscoBoy', points: 376 }, { number: '2', name: 'JonhWick', points: 323 }, { number: '3', name: 'Terminator', points: 290 }, { number: '4', name: 'MIB', points: 254 }, { number: '5', name: 'Wolverine', points: 206 }]
class App extends Component {
  constructor() {
    super()
    this.AuthService = new AuthService()
    this.state = {
      chooseChamp: false,
    }
  }

  showChoose = () =>
    this.setState({
      chooseChamp: true,
    })

  closeChoose = () =>
    this.setState({
      chooseChamp: false,
    })

  calcWidth = item => {
    const logs = leaders.map(item => item.points)
    const maxPoint = Math.max.apply(Math, logs)
    return (item / maxPoint) * 100
  }

  render() {
    return (
      <div className={style.homePage}>
        <div className={style.bgWrap} />
        <div className={style.tournamentContent}>
          <div className={style.tournamentHeader}>
            <h2>Tournament Name</h2>
            <div className={style.tournamentInfo}>
              <p>Feb 27</p>
              <p>$ 3.97</p>
            </div>
          </div>
          {this.state.chooseChamp && <ChooseChamp closeChoose={this.closeChoose} />}
          <div className={style.teamBlock}>
            <h3>Team</h3>
            <div className={style.tournamentTeam}>
              {addCards.map(item => (
                <div key={item.id} onClick={this.showChoose} className={style.item}>
                  <p>Add Player</p>
                </div>
              ))}
            </div>
          </div>
          <div className={style.tournamentBottom}>
            <div className={style.tournamentMatches}>
              <h3>Matches</h3>
              {matchesItems.map(item => (
                <p key={item.id}>
                  <span>{item.time}</span>
                  {item.nameMatch}
                </p>
              ))}
            </div>
            <div className={style.tournamentLeader}>
              <div className={style.headerLeader}>
                <h3>Leaderboard</h3>
                <p>2019 users</p>
              </div>
              <div className={style.tableLeader}>
                <div className={style.topFive}>
                  {leaders.map(item => (
                    <div key={item.number} className={style.leader}>
                      <p className={style.number}>{item.number}</p>
                      <p className={style.nameLeader}>{item.name}</p>
                      <div className={style.scale}>
                        <span style={{ width: `${this.calcWidth(item.points)}%` }}>{item.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={style.myNumber}>
                  <p className={style.number}>211</p>
                  <p className={style.nameLeader}>Me</p>
                  <div className={style.scale}>
                    <span style={{ width: `${(19 / 376) * 100}%` }}>19</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App
