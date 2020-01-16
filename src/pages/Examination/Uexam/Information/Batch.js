import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import { formatMonthDay } from '@/utils/utils';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import TaskInfo from './Components/TaskInfo';
import BatchList from './Components/BatchList';
import FinishUnstartBatchModal from './Components/FinishUnstartBatchModal';
import styles from './index.less';

/**
 * 考务信息
 * @author tina.zhang
 * @date   2019-8-19 17:47:52
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, loading }) => ({
  taskInfo: uexam.taskInfo,
  campusInfo: uexam.campusInfo,
  batchInfos: uexam.batchInfos, // 批次信息
  taskInfoLoading: loading.effects['uexam/getTaskInfo'],
}))
class Batch extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unStartBatches: [], // 是否存在未开始批次
      showFinishUnStartBatchesModal: false, // 显示结束批次弹窗
    };
  }

  componentDidMount() {
    this.loadTaskInfo();
    this.loadBatchInfos();
  }

  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getTaskInfo',
      payload: { taskId: match.params.taskId },
    });
  };

  // 加载校区-考点考场批次
  loadBatchInfos = () => {
    const { dispatch, match } = this.props;
    const params = {
      ueTaskId: match.params.taskId,
      campusId: localStorage.campusId,
    };
    if (localStorage.isSubjectAdmin !== 'true' && localStorage.isAdmin !== 'true') {
      params.teacherId = localStorage.teacherId;
    }
    dispatch({
      type: 'uexam/getBatchInfos',
      payload: params,
    }).then(res => {
      const { data } = res;
      if (res.responseCode !== '200' || data.length === 0) {
        return;
      }
      const batches = [];
      data.forEach(bts => {
        const examDate = formatMonthDay(bts.examDate);
        bts.batchList.forEach(bt => {
          const filterUnstart = bt.roomList.filter(r => r.status === 'TS_0' || r.status === 'TS_1');
          if (filterUnstart && filterUnstart.length > 0) {
            const rooms = filterUnstart.map(room => {
              return {
                examBatchTime: `${examDate} ${bt.examBatchTime}`,
                examBatchName: bt.examBatchName,
                ...room,
              };
            });
            batches.push(...rooms);
          }
        });
      });
      this.setState({
        unStartBatches: batches,
      });
    });
  };

  // 结束未开始批次
  handleFinishUnstartBatches = () => {
    const { unStartBatches } = this.state;
    if (unStartBatches && unStartBatches.length > 0) {
      this.setState({
        showFinishUnStartBatchesModal: true,
      });
    }
  };

  // 提交结束未开始批次
  handleFinishModalClose = submit => {
    const { dispatch } = this.props;
    const { unStartBatches } = this.state;
    if (submit) {
      const subTaskIds = unStartBatches.map(v => v.subTaskId);
      dispatch({
        type: 'uexam/finishUnstartBatches',
        payload: {
          ueTaskId: subTaskIds.join(','),
        },
      }).then(res => {
        if (res.responseCode === '200') {
          this.setState(
            {
              showFinishUnStartBatchesModal: false,
            },
            () => {
              this.loadBatchInfos();
            }
          );
        }
      });
    } else {
      this.setState({
        showFinishUnStartBatchesModal: false,
      });
    }
  };

  render() {
    const { taskInfoLoading, taskInfo, campusInfo, batchInfos } = this.props;
    const { unStartBatches, showFinishUnStartBatchesModal } = this.state;

    // 学科管理员：添加功能【结束未开始场次】
    let showFinishButton = false;
    if (
      (localStorage.isSubjectAdmin === 'true' || localStorage.isAdmin === 'true') &&
      unStartBatches &&
      unStartBatches.length > 0
    ) {
      showFinishButton = true;
    }

    return (
      <div className={styles.information}>
        <h1 className={styles.menuName}>
          <Link to="/examination/uexam">
            <span>
              {formatMessage({
                id: 'app.title.examination.uexam.tasklist',
                defaultMessage: '统考',
              })}
              <i>/</i>
            </span>
          </Link>
          {formatMessage({
            id: 'app.title.examination.uexam.batchInfo',
            defaultMessage: '批次信息',
          })}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {taskInfoLoading && (
            <NoData
              tip={formatMessage({
                id: 'app.message.registration.taskinfo.loading.tip',
                defaultMessage: '信息加载中，请稍等...',
              })}
              onLoad={taskInfoLoading}
            />
          )}
          {!taskInfoLoading && taskInfo && (
            <>
              <TaskInfo
                taskInfo={taskInfo}
                studentNum={campusInfo.studentNum}
                onFinishUnstartBatches={showFinishButton ? this.handleFinishUnstartBatches : null}
              />
              {batchInfos && batchInfos.length > 0 && <BatchList data={batchInfos} />}
            </>
          )}
          {showFinishUnStartBatchesModal && (
            <FinishUnstartBatchModal
              batchList={unStartBatches}
              onModalClose={this.handleFinishModalClose}
            />
          )}
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default Batch;
