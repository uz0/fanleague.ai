import React from 'react';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import { connect } from 'react-redux';
import classnames from 'classnames';
import Button from 'components/button';
import RewardPlaceholder from 'assets/trophy.svg';
import { withCaptions } from 'hoc';
import { REWARD_POSITIONS } from '../../constants';

import style from './style.module.css';
import i18n from 'i18next';

const cx = classnames.bind(style);

const tableCaptions = ({ t, isMobile }) => ({
  number: {
    text: t('number'),
    width: isMobile ? 55 : 35,
  },

  name: {
    text: t('name'),
    width: isMobile ? 150 : 300,
  },
});

const Rewards = ({
  tournament,
  isAddButtonVisible,
  isActionsAvailable,
  addRewards,
  editRewards,
  className,
}) => (
  <div className={cx(style.rewards, className)}>
    <div className={style.header}>
      <h3 className={style.subtitle}>{i18n.t('rewards')}</h3>
      {isAddButtonVisible && (
        <button
          type="button"
          className={style.button}
          onClick={editRewards}
        >
          {Object.keys(tournament.rewards).length === 0 ? i18n.t('add') : i18n.t('edit')}
        </button>
      )}
    </div>

    {isActionsAvailable && (
      <p className={style.empty}>{i18n.t('add_rewards')}</p>
    )}

    <div className={style.content}>
      {isActionsAvailable && (
        <Button
          appearance="_circle-accent"
          icon="plus"
          className={style.button}
          onClick={addRewards}
        />
      )}

      {tournament.unfoldedRewards && tournament.unfoldedRewards.length !== 0 && (
        <div className={style.prizes}>
          <div className={style.list}>
            {tournament.unfoldedRewards.map(reward => {
              return (
                <div key={reward._id} className={style.item}>
                  <div className={style.avatar}>
                    <img
                      src={reward.image}
                      onError={e => {
                        e.currentTarget.src = RewardPlaceholder;
                      }}
                    />
                  </div>
                  <div className={style.info}>
                    <div className={style.name}>
                      {reward.description}
                    </div>
                    <div className={style.position}>
                      {
                        `${i18n.t('for')} ${REWARD_POSITIONS[tournament.rewards[reward._id]].role} ${i18n.t('and')}
                        ${REWARD_POSITIONS[tournament.rewards[reward._id]].place} ${i18n.t('place')}`
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default compose(
  connect(
    (state, props) => ({
      users: state.users.list,
      currentUser: state.currentUser,
      tournament: state.tournaments.list[props.id],
    }),
  ),
  withProps(props => {
    const isCurrentUserCreator = props.currentUser && props.currentUser._id === props.tournament.creator._id;
    const isAddButtonVisible = isCurrentUserCreator &&
      !props.tournament.isStarted &&
      props.tournament.unfoldedRewards.length > 0;

    const isActionsAvailable = isCurrentUserCreator &&
      props.tournament.unfoldedRewards &&
      props.tournament.unfoldedRewards.length === 0;

    return {
      ...props,
      isAddButtonVisible,
      isActionsAvailable,
      isCurrentUserCreator,
    };
  }),
  withCaptions(tableCaptions),
)(Rewards);
