import React, { Component } from 'react';
import compose from 'recompose/compose';
import moment from 'moment';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import { http } from 'helpers';
import i18n from 'i18n';
import Button from 'components/button';
import Icon from 'components/icon';
import TournamentInformation from 'components/tournament-information';
import TournamentMatches from 'components/tournament-matches';
import TournamentRewards from 'components/tournament-rewards';
import TournamentRules from 'components/tournament-rules';
import TournamentSummoners from 'components/tournament-summoners';
import TournamentViewers from 'components/tournament-viewers';
import TournamentApplicants from 'components/tournament-applicants';
import { actions as usersActions } from 'pages/dashboard/users';
import { actions as tournamentsActions } from 'pages/tournaments';
import { actions as modalActions } from 'components/modal-container';
import style from './style.module.css';

const cx = classnames.bind(style);

class Tournament extends Component {
  loadTournament = async () => {
    const response = await http(`/api/tournaments/${this.props.match.params.id}`);
    const tournament = await response.json();

    if (tournament) {
      this.props.addTournament(tournament);
    }
  };

  loadUsers = async () => {
    const response = await http('/api/admin/user');
    const { users } = await response.json();

    this.props.addUsers(users);
  };

  addRules = () => this.props.toggleModal({
    id: 'add-tournament-rules-modal',

    options: {
      tournamentId: this.props.match.params.id,
    },
  });

  addMatches = () => this.props.toggleModal({
    id: 'add-match-modal',

    options: {
      tournamentId: this.props.match.params.id,
    },
  });

  addSummoners = () => this.props.toggleModal({
    id: 'add-summoners-modal',

    options: {
      tournamentId: this.props.match.params.id,
      selectedSummoners: this.props.tournament.summoners,
      summoners: this.props.users,
    },
  });

  addRewards = () => this.props.toggleModal({
    id: 'add-tournament-rewards',

    options: {
      tournamentId: this.props.match.params.id,
    },
  });

  editTournament = () => this.props.toggleModal({
    id: 'edit-tournament-modal',

    options: {
      tournamentId: this.props.match.params.id,
    },
  });

  joinTournament = () => this.props.toggleModal({ id: 'join-tournament-players-modal' });

  attendTournament = async () => {
    const response = await http(`/api/tournaments/${this.props.match.params.id}/attend`, { method: 'PATCH' });
    const tournament = await response.json();
    this.props.updateTournament(tournament);
  };

  componentDidMount() {
    if (!this.props.tournament) {
      this.loadTournament();
    }

    if (isEmpty(this.props.users)) {
      this.loadUsers();
    }
  }

  render() {
    const name = get(this.props, 'tournament.name');
    const creator = get(this.props, 'tournament.creator');
    const currentUser = get(this.props, 'currentUser');
    const description = get(this.props, 'tournament.description');
    const price = get(this.props, 'tournament.price');
    const rules = get(this.props, 'tournament.rules');
    const rewards = get(this.props, 'tournament.rewards');
    const matches = get(this.props, 'tournament.matches');

    const isCurrentUserCreator = creator && creator._id === currentUser._id;
    const isTournamentReady = get(this.props, 'tournament.isReady');

    const isRulesAdded = rules && rules.length > 0;
    const isRewardsAdded = rewards && rewards.length > 0;
    const isMatchesAdded = matches && matches.length > 0;

    return (
      <div className={cx('tournament', 'container')}>
        <div className={style.inner_container}>

          <div className={style.tournament_section}>

            {/* <div className={style.actions}>
              <Button
                text={i18n.t('join_tournament')}
                appearance="_basic-accent"
                className={style.button}
                onClick={this.joinTournament}
              />

              <Button
                text={i18n.t('suggest_yourself')}
                appearance="_basic-accent"
                className={style.button}
                onClick={this.attendTournament}
              />
            </div> */}

          </div>

          <h2 className={style.title}>{name}</h2>

          {this.props.tournament && (
            <div className={cx(style.widgets, style.col_3)}>
              <TournamentInformation
                id={this.props.match.params.id}
                editTournament={this.editTournament}
              />
              <TournamentRules
                id={this.props.match.params.id}
                addRules={this.addRules}
              />
              <TournamentRewards
                id={this.props.match.params.id}
                addRules={this.addRules}
              />
            </div>
          )}

          {this.props.tournament && (
            <div className={style.widgets}>
              <TournamentApplicants id={this.props.match.params.id}/>
              <TournamentSummoners id={this.props.match.params.id}/>
              <TournamentViewers id={this.props.match.params.id}/>
              <TournamentMatches id={this.props.match.params.id}/>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default compose(
  connect(
    (state, props) => ({
      tournament: state.tournaments.list[props.match.params.id],
      users: state.users.list,
      currentUser: state.currentUser,
    }),

    {
      addTournament: tournamentsActions.addTournament,
      addUsers: usersActions.loadUsers,
      updateTournament: tournamentsActions.updateTournament,
      toggleModal: modalActions.toggleModal,
    },
  ),
)(Tournament);
