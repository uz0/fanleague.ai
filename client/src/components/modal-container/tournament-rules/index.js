import React, { useState } from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import isEmpty from 'lodash/isEmpty';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import { actions as tournamentsActions } from 'pages/tournaments';

import Modal from 'components/modal';
import TextArea from 'components/text-area';

import { http } from 'helpers';

import i18n from 'i18n';

import style from './style.module.css';
import * as LolRules from './lol';
import * as PubgRules from './pubg';
import { RULESTEMPLATE } from '../../../constants';

const AddRules = props => {
  const [rules, setRules] = useState({});

  const handleInputChange = e => {
    const { value } = e.target;
    setRules({ ruleString: value });
  };

  return (
    <Modal
      title={props.options.isEditing ? i18n.t('modal.edit_rules') : i18n.t('modal.add_rules')}
      close={props.close}
      className={style.modal_content}
      wrapClassName={style.wrapper}
      actions={[
        {
          text: props.options.isEditing ? i18n.t('edit') : i18n.t('add'),
          type: 'button',
          appearance: '_basic-accent',
          onClick: props.handleSubmit,
          disabled: props.isSubmitting,
        },
      ]}
    >
      <TextArea
        value={rules}
        onChange={handleInputChange}
      />
    </Modal>
  );
};

const enhance = compose(
  connect(
    (state, props) => ({
      tournament: state.tournaments.list[props.options.tournamentId],
    }),

    {
      updateTournament: tournamentsActions.updateTournament,
    }
  ),
  withFormik({
    mapPropsToValues: props => {
      console.log(props, 'popopopopo')
      if (isEmpty(props.tournament.rules)) {
        return '+kills*5';
      }

      return props.tournament.rules;
    },
    validate: props => {
      const errors = {};
      const rulesRegex = RULESTEMPLATE;
      const rules = [];
      console.log(props)
      if (!isEmpty(props)) {
        const rulesString = props.matchAll(rulesRegex);
        // There is a bug in chrome?? groups is undefined
        for (const item of rulesString) {
          // Const rule = Object.entries(item.groups).map(([key, value]) => ({ [key]: value }));
          rules.push({ [item[1] + item[2]]: item[3] });
        }
      }

      if (isEmpty(rules)) {
        errors.rules = 'FUCK';
        console.log('FU')
      }

      return errors;
    },
    handleSubmit: async (ruleString, { props }) => {
      const { tournamentId } = props.options;
      const { game } = props.tournament;

      try {
        await http(`/api/tournaments/${tournamentId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
          body: JSON.stringify({ rules: ruleString, game }),
        });

        props.updateTournament({
          _id: props.tournament._id,
          rules: ruleString,
        });

        props.close();
      } catch (error) {
        console.log(error);
      }
    },
  })
);

export default enhance(AddRules);
