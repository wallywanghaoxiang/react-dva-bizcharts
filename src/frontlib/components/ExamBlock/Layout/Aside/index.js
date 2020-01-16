import React, { PureComponent } from 'react';
import {connect} from 'dva';
import ExamAside from './examAside';       // 学生展示模式
import PracticeAside from "./practiceAside"; // 选题模式

@connect(({examBlock})=>{
  const {taskType} = examBlock;
  return {
    taskType,     // 考试模式还是练习模式
  }
})
class Aside extends PureComponent {

  render() {
    const { taskType } = this.props;
    if( !taskType ){
      return null;
    }
    return <ExamAside />;
  }
}

export default Aside;
