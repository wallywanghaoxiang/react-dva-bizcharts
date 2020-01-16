import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

// const { Step } = Steps;

const messages = defineMessages({
  class: { id: 'app.examination.publish.class', defaultMessage: '班级' },
  paper: { id: 'app.examination.publish.paper', defaultMessage: '试卷' },
  publish: { id: 'app.examination.publish.publish', defaultMessage: '发布' },
});

@connect(({ release }) => ({
  taskType: release.taskType,
}))
class inspect extends Component {
  state = {};

  componentWillMount() {
    this.getCurrentStep();
  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');

    const step = pathList[pathList.length - 2];

    if (step === 'publish') {
      return step;
    }
    switch (step) {
      case 'configuration':
        return 0;
      case 'selectpaper':
        return 1;
      case 'confirm':
        return 2;
      default:
        return 0;
    }
  }

  render() {
    const { children } = this.props;
    // const step = this.getCurrentStep();
    return (
      <div className="examination">
        <div className="top">
          <div className={styles.outside_title}>{formatMessage(messages.publish)}</div>
          {/* {step === "publish" || taskType==='TT_5' ? <div /> :
          <Steps current={step} className={styles.steps}>
            <Step title={formatMessage(messages.class)} />
            <Step title={formatMessage(messages.paper)} />
            <Step title={formatMessage(messages.publish)} />
          </Steps>} */}
        </div>
        {children}
      </div>
    );
  }
}

export default inspect;
