import React, { Component } from 'react'
import Input from '../../components/input'
import NewTournament from '../../components/newTournament'
import { NavLink } from 'react-router-dom'
import arrow from '../../assets/arrow.svg'
import moment from 'moment';
import AuthService from '../../services/authService'
import http from '../../services/httpService';
import style from './home.module.css'

// const items = [
//   { id: '1', title: 'My Crazy League', date: 'Feb 02', users: '2023', entry: '3.97' },
//   { id: '2', title: 'Mamkin tiger wanna play', date: 'Feb 02', users: '3052', entry: '10.00' },
//   { id: '3', title: 'Only for hardcore fans', date: 'Feb 02', users: '1233', entry: '2.17' },
//   { id: '4', title: 'Crazy camp', date: 'Feb 02', users: '1652', entry: '1.00' },
//   { id: '5', title: 'Lvl up', date: 'Feb 03', users: '1054', entry: '5.35' },
//   { id: '6', title: 'Super win tonight', date: 'Feb 03', users: '2582', entry: '4.70' },
//   { id: '7', title: 'Mega HARDDD', date: 'Feb 03', users: '1629', entry: '1.30' },
//   { id: '8', title: 'Whats happened? AAAA!', date: 'Feb 03', users: '254', entry: '9.09' },
//   { id: '9', title: 'AAAAAAAAAAAAA!!!', date: 'Feb 03', users: '4346', entry: '7.77' },
// ]

class App extends Component {
  constructor() {
    super()
    this.AuthService = new AuthService()
    this.state = {
      newTournament: false,
      tournaments: [],
      rules: []
    }
  }
  createTournament = () =>
    this.setState({
      newTournament: true,
    })

  closeTournament = () =>
    this.setState({
      newTournament: false,
    })

  async componentDidMount(){
    let tournamentsQuery = await http('/api/tournaments');
    let rulesQuery = await http('/api/rules');

    let tournaments = await tournamentsQuery.json();
    let rules = await rulesQuery.json();

    this.setState({
      tournaments: tournaments.tournaments,
      rules: rules.rules,
    }, () => console.log(this.state))
  }

  render() {
    return (
      <div className={style.homePage}>
        <div className={style.bgWrap} />
        <div className={style.filters}>
          <h2>Tournaments</h2>
          <form>
            <Input label="End date" name="date" type="date" />
            <Input label="Minimal entry" name="entry" placeholder="$ 0.1" type="text" />
          </form>
          <div className={style.createTournament}>
            <p>Not satisfied?</p>
            <button onClick={this.createTournament} type="submit">
              Create a new tournament
            </button>
          </div>
        </div>
        {this.state.newTournament && <NewTournament rules={this.state.rules} closeTournament={this.closeTournament} />}
        <div className={style.tournamentsBlock}>
          <div className={style.headerTournaments}>
            <p>Tournament Name</p>
            <p>End Date</p>
            <p>Users</p>
            <p>Entry</p>
          </div>
          {this.state.tournaments.map(item => (
            <NavLink key={item._id} to="/tournament">
              <div className={style.cardTournament}>
                <p>{item.name}</p>
                <p>{moment(item.date).format('MMM DD')}</p>
                <p>{item.users.length}</p>
                <p>$ {item.entry}</p>
                <img className={style.arrowCard} src={arrow} alt="arrow icon" />
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    )
  }
}

export default App
