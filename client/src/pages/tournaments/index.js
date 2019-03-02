import React, { Component } from 'react';

import Input from '../../components/input';
import NewTournament from '../../components/newTournament';
import Preloader from '../../components/preloader';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import AuthService from '../../services/authService';
import UserService from '../../services/userService';
import http from '../../services/httpService';
import TournamentService from '../../services/tournamentService';
import style from './tournaments.module.css';

class App extends Component {
  constructor() {
    super();
    this.AuthService = new AuthService();
    this.UserService = new UserService();
    this.TournamentService = new TournamentService();
    this.state = {
      newTournament: false,
      tournaments: [],
      fantasyTournaments: [],
      rules: [],
      entryFilter: '',
      dateFilter: '',
      loader: true,
    };
  }

  preloader = () =>
    this.setState({
      loader: false,
    })
  createTournament = () =>
    this.setState({
      newTournament: true,
    })

  closeTournament = () =>
    this.setState({
      newTournament: false,
    })

  filterByDate = async e => {
    if (e.target.value === '') {
      let fantasyTournaments = await this.TournamentService.getFantasyTournaments();
      this.setState({
        fantasyTournaments: fantasyTournaments.tournaments,
        dateFilter: '',
      });
      return;
    }

    this.setState(
      {
        dateFilter: e.target.value,
      },
      async () => {
        let filteredTournaments = await this.TournamentService.filterTournamentsByDate(this.state.dateFilter);
        this.setState({ fantasyTournaments: filteredTournaments });
      },
    );
  }

  filterByEntry = async e => {
    if (e.target.value <= 0) {
      let fantasyTournaments = await this.TournamentService.getFantasyTournaments();
      this.setState({
        fantasyTournaments: fantasyTournaments.tournaments,
        entryFilter: '',
      });
      return;
    }

    this.setState(
      {
        entryFilter: e.target.value,
      },
      async () => {
        let filteredTournaments = await this.TournamentService.filterTournamentsByEntry(this.state.entryFilter);
        this.setState({ fantasyTournaments: filteredTournaments });
      },
    );
  }

  updateTournaments = async() => {
    const fantasyTournaments = await this.TournamentService.getFantasyTournaments();
    const rulesQuery = await http('/api/rules');
    const rules = await rulesQuery.json();
    
    this.setState({
      fantasyTournaments: fantasyTournaments.tournaments,
      rules: rules.rules,
    });
  }

  async componentDidMount() {
    const realTournaments = await this.TournamentService.getRealTournaments();
    const fantasyTournaments = await this.TournamentService.getFantasyTournaments();

    // const actualTournaments = realTournaments.tournaments.filter(item => moment(item.date).isAfter(moment()))
    const actualTournaments = realTournaments.tournaments;

    const user = await this.UserService.getMyProfile();

    const rulesQuery = await http('/api/rules');
    const rules = await rulesQuery.json();

    this.setState({
      realTournaments: actualTournaments,
      fantasyTournaments: fantasyTournaments.tournaments,
      rules: rules.rules,
      user: user.user,
    });
    this.preloader();
    
  }

  render() {

    const isFreeTournament = entry => entry === 0 ? 'Free' : `$${entry}`;

    return (
      <div className={style.home_page}>
        <div className={style.bg_wrap} />
        {this.state.loader && <Preloader />}
        <div className={style.filters}>
          <h2>Tournaments</h2>

          <div className={style.block_filters}>
            <form>
              <Input type="date" value={this.state.filterByDate} action={this.filterByDate} label="End date" name="date" min="2019-01-01" max="2020-12-31"/>
              <Input type="number" value={this.state.entryFilter} action={this.filterByEntry} label="Minimal entry" placeholder="$ 0.1" name="entry" min="0" />
            </form>

            <div className={style.create_tournament}>
              <p>Not satisfied?</p>

              <button onClick={this.createTournament} type="submit">
                Create a new tournament
              </button>
            </div>
          </div>
        </div>

        {this.state.newTournament && <NewTournament
          rules={this.state.rules}
          user={this.state.user}
          tournamentsData={this.state.realTournaments}
          updateTournaments={this.updateTournaments}
          closeTournament={this.closeTournament}
        />}

        <div className={style.tournaments_block}>
          <div className={style.header_tournaments}>
            <p>Tournament Name</p>
            <p>End Date</p>
            <p>Users</p>
            <p>Entry</p>
          </div>

          {this.state.fantasyTournaments.map(item => (
            <NavLink key={item._id} to={`/tournaments/${item._id}`}>

              <div className={style.card_tournament}>
                <p>{item.name}</p>
                <p>{moment(item.tournament.date).format('MMM DD')}</p>
                <p>{item.users.length}</p>
                <p>{isFreeTournament(item.entry)}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
