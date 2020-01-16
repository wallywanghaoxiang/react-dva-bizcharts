import React, { PureComponent } from 'react';
import ExamCheck from './ExamCheck';
import PracticeCheck from "./PracticeCheck";


class DeviceCheck extends PureComponent {

  render() {
    const { taskType, ...params } = this.props;
    if( !taskType ){
      return null;
    }
    return taskType === "exam" ? <ExamCheck {...params} /> : <PracticeCheck {...params} />;
  }
}

export default DeviceCheck;
