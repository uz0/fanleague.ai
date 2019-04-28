import React, { Component } from 'react';

import Input from 'components/input';
import Button from 'components/button';
import Modal from '../../dashboard-modal';

import NotificationService from 'services/notificationService';
import StreamerService from 'services/streamerService';

import classnames from 'classnames';
import style from './style.module.css';
import i18n from 'i18n';

import uuid from 'uuid';

const cx = classnames.bind(style);

class MatchesStep extends Component {
  constructor() {
    super();

    this.notificationService = new NotificationService();
    this.streamerService = new StreamerService();
  }

  state = {
    matches: [],
    matchData: {
      id: '',
      name: '',
      startTime: ''
    },
    isMatchCreating: false,
    isMatchEditing: false,
  }

  showMatchCreatingModal = () => this.setState({
    isMatchCreating: true
  });

  closeMatchCreatingModal = () => this.setState({
    matchData: {
      id: '',
      name: '',
      startTime: ''
    },
    isMatchCreating: false,
  });

  handleInputChange = (event) => {
    this.setState({
      matchData: {
        ...this.state.matchData,
        [event.target.name]: event.target.value,
      },
    });
  };

  addMatch = () => {
    let { matches, matchData } = this.state;

    if (matchData.name.length === 0) {
      this.notificationService.showSingleNotification({
        type: 'error',
        shouldBeAddedToSidebar: false,
        message: 'Match field can not be empty',
      });

      return;
    }

    if (matchData.startTime.length === 0) {
      this.notificationService.showSingleNotification({
        type: 'error',
        shouldBeAddedToSidebar: false,
        message: 'Date field can not be empty',
      });

      return;
    }

    matches.push(matchData);

    this.setState({
      matches,
      matchData: {
        id: uuid(),
        name: '',
        startTime: ''
      },
      isMatchCreating: false,
    });
  }

  removeMatch = (matchId) => {
    const matches = this.state.matches.filter(item => item.id !== matchId);

    this.setState({ matches });
  }

  editMatch = (match) => {
    this.setState({
      matchData: {
        ...match,
      },
      isMatchEditing: true,
    });
  }

  updateMatch = () => {
    let { matches, matchData } = this.state;

    if (matchData.name.length === 0) {
      this.notificationService.showSingleNotification({
        type: 'error',
        shouldBeAddedToSidebar: false,
        message: 'Match field can not be empty',
      });

      return;
    }

    if (matchData.startTime.length === 0) {
      this.notificationService.showSingleNotification({
        type: 'error',
        shouldBeAddedToSidebar: false,
        message: 'Date field can not be empty',
      });

      return;
    }

    matches.forEach(item => {
      if(item.id === matchData.id) {
        item.name = matchData.name;
        item.startTime = matchData.startTime;
      }
    });

    this.setState({
      matches,
      matchData: {
        id: '',
        name: '',
        startTime: ''
      },
      isMatchEditing: false,
    });
  }

  // this.submitTournament
  submitTournament = () => {
    const { matches } = this.state;

    if(this.state.matches.length === 0){
      this.notificationService.showSingleNotification({
        type: 'error',
        shouldBeAddedToSidebar: false,
        message: 'Tournament must have at least one match',
      });

      return;
    }

    this.props.createTournament(matches);
  }

  renderMatch = (match, index) => {
    return <div className={style.match}>
      <div className={style.info_item}>
        {`${index + 1}. ${match.name}`}
      </div>
      <div className={style.info_item}>
        {match.startTime}
      </div>
      <button className={style.delete} onClick={() => this.removeMatch(match.id)}>
        <i className="material-icons">delete_forever</i>
      </button>
      <button className={style.edit} onClick={() => this.editMatch(match)}>
        <i className="material-icons">edit</i>
      </button>
    </div>
  }


  render() {
    const { isMatchEditing, isMatchCreating } = this.state;
    
    const isModalActive = isMatchEditing || isMatchCreating;
    const modalAction = isMatchCreating ? this.addMatch : this.updateMatch;
    const modalActionText = isMatchCreating ? 'Create match' : 'Edit match';

    return (
      <div className={style.matches}>
        <h3>Tournament matches</h3>
        <div>
          {this.state.matches.map((item, index) => this.renderMatch(item, index))}
          <Button
            appearance={'_circle-accent'}
            icon={<i className="material-icons">add</i>}
            onClick={this.showMatchCreatingModal}
          />
        </div>

        {isModalActive && <Modal
          title={'Add match'}
          close={this.closeMatchCreatingModal}
          wrapClassName={style.create_player_modal}
          actions={[{
            text: modalActionText,
            onClick: modalAction,
            isDanger: true
          }]}
        >
          <Input
            label="Match name"
            name="name"
            value={this.state.matchData.name}
            onChange={this.handleInputChange}
          />

          <Input
            type="time"
            label="Start time"
            name="startTime"
            value={this.state.matchData.startTime}
            onChange={this.handleInputChange}
          />
        </Modal>
        }

        <div className={style.controls}>
          <Button
              className={style.prev}
              appearance={'_basic-accent'}
              text='prev'
              icon={<i className="material-icons">arrow_back</i>}
              onClick={this.prevStep}
            />
          <Button
              className={style.next}
              appearance={'_basic-accent'}
              text='Create tournament'
              // icon={<i className="material-icons">arrow_forward</i>}
              onClick={this.submitTournament}
            />
        </div>
      </div>
    );
  }
}

export default MatchesStep;