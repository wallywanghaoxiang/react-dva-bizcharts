import React, { Component } from 'react';
import { connect } from "dva";
import { formatMessage, defineMessages } from 'umi/locale';
import ExamTaskDetail from '../Components/ExamTaskDetail/index';
import styles from './index.less';


const messages = defineMessages({
    inspect:{id:'app.menu.examination.inspect',defaultMessage:'检查'},
    detail:{id:'app.examination.inspect.task.detail',defaultMessage:'详情'},

})
@connect(({ inspect }) => ({
  records:inspect.taskData.records,
}))
class TaskDetail extends Component {
    state = {
      taskData:null
      };

      componentWillMount() {
        this.getTaskDetail();
    }

    getTaskDetail = () => {
      const { dispatch,match } = this.props;
      const { params } = match;
      const { taskId } = params;
      const params1 = {
        taskId
      }
      dispatch({
        type    : 'inspect/taskDetail',
        payload : params1,
        callback:(res) => {
          this.setState({
            taskData:res.data
          })
        }
      });
    }



    render() {
       const { taskData } = this.state;
        return (
          <div className={styles.taskDetail}>
            <h1 className={styles.tit}>
              {formatMessage(messages.inspect)}
              <span className={styles.division}>/</span>
              <span className={styles.subTit}>{formatMessage(messages.detail)}</span>
            </h1>
            {taskData && <ExamTaskDetail parentProps={this.props} type="inspect" data={taskData} />}

          </div>
        )
    }
}

export default TaskDetail
