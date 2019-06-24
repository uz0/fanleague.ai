import React, { Component } from 'react';
import Button from 'components/button';
import Notification from 'components/old-notification';
import { ReactComponent as TrophyIcon } from 'assets/trophy.svg';
import { ReactComponent as CloseIcon } from 'assets/close.svg';
import { ReactComponent as MatchIcon } from 'assets/battle.svg';
import { ReactComponent as WarningIcon } from 'assets/warning.svg';
import { ReactComponent as SuccessIcon } from 'assets/success.svg';
import { ReactComponent as ErrorIcon } from 'assets/error.svg';

import NotificationService from '../../../services/notificationService';

import style from './style.module.css';
import i18n from 'i18n';
import uuid from 'uuid';

class NotificationSidebar extends Component {
  constructor() {
    super();
    this.notificationService = new NotificationService({
      showNotificationSidebar: this.showNotificationSidebar,
      pushNotificationToSidebar: this.pushNotificationToState,
    });

    this.state = {
      isShown: false,
      notifications: [],
    };
  }

  pushNotificationToState = notification => {
    this.notificationService.incrementNotificationCounter();

    this.setState({
      notifications: [...this.state.notifications, notification],
    });
  }

  pullNotificationFromState = id => {
    const notificationsList = this.state.notifications.filter(item => item.id !== id);

    this.notificationService.decrementNotificationCounter();

    this.setState({
      notifications: notificationsList,
    });
  }

  pullNotificationAndCloseSidebar = id => {
    this.pullNotificationFromState(id);
    this.hideNotificationSidebar();
  }

  showNotificationSidebar = () => this.setState({ isShown: true });

  hideNotificationSidebar = () => this.setState({ isShown: false });

  renderNotification = ({ id, link, type, message }) => {
    let icon = '';

    switch (type) {
      case 'success':
        icon = <SuccessIcon/>;
        break;
      case 'warning':
        icon = <WarningIcon/>;
        break;
      case 'error':
        icon = <ErrorIcon/>;
        break;
      case 'match':
        icon = <MatchIcon/>;
        break;
      case 'winning':
        icon = <TrophyIcon/>;
        break;
      default:
        icon = <SuccessIcon/>;
        break;
    }

    return (
      <Notification
        key={uuid()}
        message={message}
        image={icon}
        link={link}
        wrapperStyle={style.wrapper_n}
        notificationStyle={style.notification}
        onClose={() => this.pullNotificationFromState(id)}
        onLinkRedirect={() => this.pullNotificationAndCloseSidebar(id)}
      />
    );
  }

  render() {
    const { isShown, notifications } = this.state;

    return (
      <>
        {isShown && (
          <div className={style.overlay}>
            <div className={style.sidebar}>
              <div className={style.header}>
                <h4 className={style.title}>{i18n.t('notification_sidebar_header')}</h4>

                <Button
                  appearance="_icon-transparent"
                  icon={<CloseIcon/>}
                  className={style.close}
                  onClick={this.hideNotificationSidebar}
                />
              </div>
              <div className={style.content}>
                {notifications.length === 0 &&
                  <p className={style.notifications_empty}>{i18n.t('notification_sidebar_empty')}</p>
                }
                {notifications.map(notification => this.renderNotification(notification))}
              </div>
            </div>
          </div>
        )
        }
      </>
    );
  }
}
export default NotificationSidebar;