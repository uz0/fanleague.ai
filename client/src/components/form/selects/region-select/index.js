import classnames from 'classnames';
import React from 'react';
import Select from 'react-select/async';
import compose from 'recompose/compose';

import { REGIONS } from 'constants/index';

import i18n from 'i18n';

import withStyles from '../hoc/with-styles';
import style from './style.module.css';

const cx = classnames.bind(style);

const enhance = compose(
  withStyles,
);

const regionsSelectConfig = REGIONS.map(region => ({
  value: region,
  label: region,
}));

const RegionSelect = props => {
  const setField = ({ label, value }) => {
    props.form.setFieldValue('regionId', { label, value });
  };

  return (
    <div className={cx(style.wrapper, { [style.alignLeft]: props.labelPosition === 'left' }, props.className)}>
      <label className={style.caption}>{props.label}</label>
      <Select
        {...props}
        {...props.field}
        menuPlacement="auto"
        defaultOptions={regionsSelectConfig}
        defaultInputValue={props.field.value}
        className={style.select}
        placeholder={i18n.t('choose_region')}
        onChange={setField}
      />
    </div>
  );
};

export default enhance(RegionSelect);
