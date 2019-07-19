import React from 'react';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';
import Table from 'components/table';
import Button from 'components/button';
import { withCaptions } from 'hoc';
import style from './style.module.css';

const cx = classnames.bind(style);

const tableCaptions = ({ t, isMobile }) => ({
  number: {
    text: t('number'),
    width: isMobile ? 35 : 60,
  },

  name: {
    text: t('name'),
    width: isMobile ? 150 : 300,
  },
});

const renderRow = ({ className, itemClass, textClass, index, item, captions }) => {
  const numberStyle = { '--width': captions.number.width };
  const nameStyle = { '--width': captions.name.width };

  return (
    <div key={item._id} className={cx(className, style.row)}>
      <div className={cx(itemClass, style.number)} style={numberStyle}>
        <span className={textClass}>{index + 1}</span>
      </div>

      <div className={itemClass} style={nameStyle}>
        <span className={textClass}>{item.summonerName}</span>
      </div>
    </div>
  );
};

const Summoners = ({ summoners, addSummoners, captions }) => (
  <div className={style.summoners}>
    <div className={style.header}>
      <h3 className={style.subtitle}>Summoners</h3>
      {summoners.length > 0 && (
        <button
          type="button"
          className={style.button}
          onClick={addSummoners}
        >
          Edit
        </button>
      )}
    </div>

    {summoners.length === 0 && (
      <p className={style.empty}>You can choose summoners</p>
    )}

    <div className={style.content}>
      {summoners.length === 0 && (
        <Button
          appearance="_circle-accent"
          icon="plus"
          className={style.button}
          onClick={addSummoners}
        />
      )}

      {summoners.length > 0 && (
        <Table
          noCaptions
          captions={captions}
          items={summoners}
          renderRow={renderRow}
          isLoading={false}
          className={style.table}
        />
      )}
    </div>
  </div>
);

export default compose(
  connect(
    (state, props) => ({
      users: state.users.list,
      tournament: state.tournaments.list[props.id],
    }),
  ),
  withCaptions(tableCaptions),
  withProps(props => {
    const users = Object.values(props.users);

    const summoners = props.tournament.summoners.map(summonerId => {
      const summoner = users.find(summoner => summoner._id === summonerId);

      return summoner;
    });

    return {
      ...props,
      summoners,
    };
  }),
)(Summoners);
