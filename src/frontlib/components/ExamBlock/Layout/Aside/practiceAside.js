import React, { PureComponent } from 'react';
import {connect} from 'dva';
import styles from './index.less';

@connect(({examBlock})=>{
  const {taskType} = examBlock;
  return {
    taskType,     // 考试模式还是练习模式
  }
})
class ExamAside extends PureComponent {

  render() {
    return null;
  }
}

export default ExamAside;
