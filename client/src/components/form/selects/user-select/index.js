import classnames from 'classnames';
import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import AsyncSelect from 'react-select/async';
import compose from 'recompose/compose';

import { http } from 'helpers';

import withStyles from '../hoc/with-styles';
import style from './style.module.css';

const cx = classnames.bind(style);

const enhance = compose(
  withStyles,
);

class Select extends Component {
  async componentDidMount() {
    const { userId } = this.props.form.values;

    if (!userId) {
      return;
    }

    const currentUserRequest = await http(`/api/admin/user/${userId}`);
    const user = await currentUserRequest.json();

    this.props.form.setFieldValue('userId', {
      label: user.username,
      userId,
    });
  }

  normalizeUsers = users => users.map(({ username, _id }) => ({
    label: username,
    value: _id,
  }));

  getSuggestions = debounce(async inputValue => {
    if (!inputValue) {
      return;
    }

    const usersSuggestions = await http(`/api/admin/user/name/${inputValue}`);
    const { users } = await usersSuggestions.json();

    return this.normalizeUsers(users);
  }, 300);

  debouncedOnChange = ({ label, value }) => {
    this.props.form.setFieldValue('userId', { label, value });
  };

  render() {
    const { errors } = this.props.form;

    return (
      <div className={cx('wrapper', this.props.className)}>
        <label className={style.caption}>UserId</label>
        <AsyncSelect
          {...this.props}
          {...this.props.field}
          loadOptions={this.getSuggestions}
          onChange={this.debouncedOnChange}
          onInputChange={this.handleInputChange}
        />

        {errors && errors.userId &&
          <p className={style.error}>{errors.userId}</p>
        }
      </div>
    );
  }
}

export default enhance(Select);
