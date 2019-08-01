import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import compose from 'recompose/compose';
import get from 'lodash/get';
import moment from 'moment';
import classnames from 'classnames';
import Icon from 'components/icon';
import style from './style.module.css';
import i18n from 'i18next';

const cx = classnames.bind(style);

const Information = props => {
  const creator = get(props, 'tournament.creator');
  const createdAt = moment(get(props, 'tournament.createdAt', '')).format('MMM DD, h:mm');
  const description = get(props, 'tournament.description');
  const price = get(props, 'tournament.price');
  const url = get(props, 'tournament.url');

  const isCurrentUserCreator = props.currentUser && props.currentUser._id === creator._id;

  const isEmpty = get(props, 'tournament.isEmpty');
  const isApplicationsAvailable = get(props, 'tournament.isApplicationsAvailable');
  const isReadyForForecasts = get(props, 'tournament.isReadyForForecasts');
  const isStarted = get(props, 'tournament.isStarted');
  const isFinalized = get(props, 'tournament.isFinalized');

  const className = get(props, 'className');

  const getTournamentStatus = () => {
    if (isCurrentUserCreator) {
      if (isEmpty) {
        return i18n.t('add_rules_matches_rewards');
      }

      if ((!isReadyForForecasts && !isEmpty) && isApplicationsAvailable) {
        return i18n.t('add_summoners_applicants');
      }

      if ((!isApplicationsAvailable && !isFinalized) && isReadyForForecasts) {
        return i18n.t('let_viewers_make_forecastsadd_summoners_applicants');
      }
    }

    if ((!isReadyForForecasts && !isEmpty) && isApplicationsAvailable) {
      return i18n.t('waiting_applicants');
    }

    if (isReadyForForecasts) {
      return i18n.t('waiting_viewers');
    }

    if (isStarted) {
      return i18n.t('tournament_go');
    }
  };

  const isPrice = price === 0 ? i18n.t('free') : `$ ${price}`;

  return (
    <div className={cx(style.information, className)}>
      <div className={style.header}>
        <h3 className={style.subtitle}>Information</h3>
        {isCurrentUserCreator && (
          <button
            type="button"
            className={style.button}
            onClick={props.editTournament}
          >
            {i18n.t('edit')}
          </button>
        )}
      </div>

      <div className={style.content}>
        <div className={style.info}>
          <div className={style.item}>
            <div className={style.key}>{i18n.t('created_at')}:</div>
            <div className={style.value}>{createdAt}</div>
          </div>

          <div className={style.item}>
            <div className={style.key}>{i18n.t('creator')}: </div>
            <div className={style.value}>
              <Link className={style.creator} to={`/user/${creator._id}`}>
                {creator.username}<Icon name="star"/>
              </Link>
            </div>
          </div>

          <div className={style.item}>
            <div className={style.key}>{i18n.t('stream_link')}:</div>
            <div className={style.value}>
              <a target="blank" href={url}>{i18n.t('link')}</a>
            </div>
          </div>

          <div className={style.item}>
            <div className={style.key}>{i18n.t('price')}:</div>
            <div className={style.value}>{isPrice}</div>
          </div>

          <div className={style.item}>
            <div className={style.key}>{i18n.t('status')}:</div>
            <div className={style.value}>{getTournamentStatus()}</div>
          </div>
        </div>

        <div className={style.description}>
          <p className={style.text}>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default compose(
  connect(
    (state, props) => ({
      currentUser: state.currentUser,
      tournament: state.tournaments.list[props.id],
    }),
  ),
)(Information);
