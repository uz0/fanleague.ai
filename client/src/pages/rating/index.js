import React, { Component } from 'react'
import { ReactComponent as AvatarPlaceholder } from '../../assets/avatar-placeholder.svg'
import AuthService from '../../services/authService'
import TournamentService from '../../services/tournamentService'
import UserService from '../../services/userService'
import { NavLink } from 'react-router-dom'
import uuid from 'uuid'
import style from './style.module.css'

class Rating extends Component {
  constructor() {
    super()
    this.AuthService = new AuthService()
    this.UserService = new UserService()
    this.TournamentService = new TournamentService()
    this.state = {
      playersList: [],
    }
  }

  componentDidMount = async() => {
    let playersList = await this.UserService.getAllUsers();

    //reverse list and add place prop
    let playersListWithPlaces = playersList.users.reverse().map((item, index) => {
      item.place = index + 1;
      return item;
    });

    this.setState({ playersList: playersListWithPlaces })
  }
  
  render() {

    let Avatar = () => this.props.avatar ? <img src={this.props.avatar} alt="userpic"/> : <AvatarPlaceholder />;

    return (
      <div className={style.home_page}>
        <div className={style.bg_wrap} />
        <main className={style.main_block}>
          <h1>Best Players rankings</h1>
          <div className={style.content}>
            <div className={style.header_table}>
              <div className={style.number_header}>#</div>
              <div className={style.name_header}>Name</div>
              <div className={style.percent_header}>%</div>
            </div>
            {this.state.playersList.map(item => (
              <NavLink key={uuid()} className={style.item_table} to={`/user/${item._id}`}>
                <div>{item.place}.</div>
                <div className={style.avatar_table}>
                  <Avatar avatar=""/>
                </div>
                <div className={style.name_table}>{item.username}</div>
              </NavLink>
            ))}
          </div>
        </main>
      </div>
    )
  }
}

export default Rating