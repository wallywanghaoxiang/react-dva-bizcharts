import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import FlowChart from '../Components/FlowChart';
import TaskInfo from "../Components/TaskInfo";
import InvigilationTable from './Components/InvigilationTable';
import styles from './index.less';

/**
 * 查看监考安排
 * @author tina.zhang
 * @date   2019-8-16 16:23:53
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, invigilation, loading }) => ({
  taskInfo: uexam.taskInfo,
  taskInfoLoading: loading.effects['uexam/getTaskInfo'],
  invigilationList: invigilation.invigilationList,  // 校区监考安排详情
  invigilationListLoading: loading.effects['invigilation/getCampusInvigilations']  // 校区监考安排详情
}))
class Manage extends PureComponent {

  componentDidMount() {
    this.loadTaskInfo();
    this.loadCampusInvigilations();
  }

  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getTaskInfo',
      payload: { taskId: match.params.taskId }
    })
  }

  // 加载监考安排信息
  loadCampusInvigilations = () => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'invigilation/getCampusInvigilations',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId
      }
    })
  }

  render() {

    const { match, taskInfo, taskInfoLoading, invigilationListLoading, invigilationList } = this.props

    return (
      <div className={styles.invigilation}>
        <h1 className={styles.menuName}>
          <Link to="/examination/uexam">
            <span>{formatMessage({ id: "app.title.examination.uexam.tasklist", defaultMessage: "统考" })}
              <i>/</i>
            </span>
          </Link>
          {formatMessage({ id: "app.text.uexam.examination.inspect.invigilation", defaultMessage: "监考安排" })}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {taskInfoLoading && <NoData tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad={taskInfoLoading} />}
          {!taskInfoLoading && taskInfo &&
            <div className={styles.invContent}>
              <div className={styles.left}>
                <TaskInfo taskInfo={taskInfo} />
                <div className={styles.innerTitle}>
                  {formatMessage({ id: "app.text.uexam.examination.inspect.invigilation", defaultMessage: "监考安排" })}
                </div>
                {invigilationListLoading && !invigilationList && <NoData tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad={invigilationListLoading} />}
                {!invigilationListLoading && <InvigilationTable dataSource={invigilationList} pageSize={17} />}
              </div>
              <div className={styles.right}>
                <FlowChart taskId={match.params.taskId} status={taskInfo.status} taskInfo={taskInfo} />
              </div>
            </div>
          }
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default Manage;
