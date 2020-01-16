import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import TaskInfo from '../Components/TaskInfo';
import Toolbar from './Components/Toolbar';
import RegistrationResult from './Components/RegistrationResult';
import FlowChart from '../Components/FlowChart';
import styles from './index.less';

/**
 * 报名管理
 * @author tina.zhang
 * @date   2019-8-29
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, registration, loading }) => ({
  taskInfo: uexam.taskInfo,                           // 任务详情
  registrationCount: registration.registrationCount,  // 校区、学生数量已导入数量统计信息
  taskInfoLoading: loading.effects['registration/getTaskInfo'],
}))
class Result extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {
    this.loadTaskInfo();
    this.loadRegistrationCount();
  }

  // #region 加载任务信息、报名数量统计
  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getTaskInfo',
      payload: { taskId: match.params.taskId }
    })
  }

  // 加载报名数量统计
  loadRegistrationCount = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'registration/getRegistrationCount',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId
      }
    })
  }
  // #endregion

  render() {
    const { match, taskInfoLoading, taskInfo, registrationCount } = this.props;

    return (
      <div className={styles.registration}>
        <h1 className={styles.menuName}>
          <Link to="/examination/inspect">
            <span>{formatMessage({ id: "app.menu.examination.inspect", defaultMessage: "检查" })}
              <i>/</i>
            </span>
          </Link>
          {formatMessage({ id: "app.text.uexam.examination.inspect.registration", defaultMessage: "报名" })}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {taskInfoLoading && <NoData tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad={taskInfoLoading} />}
          {!taskInfoLoading && taskInfo &&
            <div className={styles.regContent}>
              <div className={styles.left}>
                <TaskInfo taskInfo={taskInfo} />
                <Toolbar
                  page="result"
                  {...registrationCount}
                />
                <RegistrationResult taskId={match.params.taskId} />
              </div>
              <div className={styles.right}>
                <FlowChart taskInfo={taskInfo} key={`registerManage${new Date().getTime()}`} taskId={match.params.taskId} status={taskInfo.status} />
              </div>
            </div>
          }
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default Result;
