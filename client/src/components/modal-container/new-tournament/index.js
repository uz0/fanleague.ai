import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ym from 'react-yandex-metrika';
import compose from 'recompose/compose';
import { Form, Field, withFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import Modal from 'components/modal';
import { FormInput } from 'components/form/input';
import { FormTextArea } from 'components/form/text-area';
import Select from 'components/form/selects/select';

import { GAMES } from 'constants/index';

import { http } from 'helpers';

import i18n from 'i18n';

import modalActions from '../actions';
import style from './style.module.css';

const date = new Date();
date.setDate(date.getDate() - 1);

const validationSchema = Yup.object().shape({
  game: Yup.string()
    .required(i18n.t('modal.required')),
  name: Yup.string()
    .min(4)
    .max(60)
    .required(i18n.t('modal.required')),
  description: Yup.string()
    .min(4)
    .max(2000)
    .required(i18n.t('modal.required')),
  dateDetails: Yup.string()
    .max(120)
    .required(i18n.t('modal.required')),
  startAt: Yup.date()
    .min(date, `${i18n.t('modal.date_after')}: ${moment(date).format('DD MMM')}`)
    .required(i18n.t('modal.required')),
});

const today = moment().format('YYYY-MM-DD');

const NewTournament = props => {
  const gamesSelectConfig = GAMES.map(game => ({
    value: game,
    label: game,
  }));

  return (
    <Modal
      title={i18n.t('modal.create_new_tournament')}
      close={props.close}
      wrapClassName="align-modal-center"
      className={style.modal_content}
      actions={[{
        type: 'submit',
        text: i18n.t('create_tournament'),
        appearance: '_basic-accent',
        disabled: props.isSubmitting,
        onClick: props.submitForm,
      }]}
    >
      <Form className={style.form}>
        <Field
          component={Select}
          name="game"
          placeholder={i18n.t('choose_game')}
          defaultOptions={gamesSelectConfig}
          label={i18n.t('game')}
          className={style.field}
          required="true"
        />

        <Field
          component={FormInput}
          label={i18n.t('name')}
          name="name"
          className={style.field}
        />

        <Field
          component={FormTextArea}
          label={i18n.t('modal.description')}
          name="description"
          className={style.field}
        />

        <Field
          component={FormInput}
          label={`${i18n.t('modal.tournament_image')} (500x150)`}
          name="imageUrl"
          className={style.field}
        />

        <Field
          component={FormInput}
          type="date"
          label={i18n.t('date')}
          name="startAt"
          min={today}
          className={style.field}
        />

        <Field
          component={FormInput}
          label={i18n.t('dateDetails')}
          name="dateDetails"
          className={style.field}
        />
      </Form>
    </Modal>
  );
};

const enhance = compose(
  withRouter,
  connect(
    null,

    {
      toggleModal: modalActions.toggleModal,
    }
  ),
  withFormik({
    validationSchema,
    mapPropsToValues: () => ({
      name: '',
      game: '',
      description: '',
      imageUrl: '',
      price: 0,
      startAt: today,
      dateDetails: '',
    }),
    handleSubmit: async (values, formikBag) => {
      const createTournamentRequest = async body => {
        try {
          const request = await http('/api/tournaments', {
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(body),
          });

          return request.json();
        } catch (error) {
          console.log(error);
        }
      };

      const { newTournament } = await createTournamentRequest(values);

      ym('reachGoal', 'tournament_created');

      formikBag.props.history.push(`/tournaments/${newTournament._id}`);

      formikBag.props.close();
    },
  }),
);

export default enhance(NewTournament);

