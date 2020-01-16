import React, { PureComponent } from 'react';
import { Button, message, Modal } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import FlowChart from '../Components/FlowChart';
import TaskInfo from '../Components/TaskInfo';
import Toolbar from './Components/Toolbar';
import DateList from './Components/DateList';
import ExamRoomList from './Components/ExamRoomList';
import ExamBatchList from './Components/ExamBatchList';
import InvigilateModal from './Components/InvigilateModal';
import AdjustMasterModal from './Components/AdjustMasterModal';
import FinishModal from './Components/FinishModal';
import TableModal from './Components/TableModal';
import styles from './index.less';

const { confirm } = Modal;

/**
 * 监考安排
 * @author tina.zhang
 * @date   2019-8-13 08:53:08
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, invigilation, loading }) => ({
  taskInfo: uexam.taskInfo,
  taskInfoLoading: loading.effects['uexam/getTaskInfo'],
  placeInfos: invigilation.placeInfos, // 考点信息
  placeInfosLoading: loading.effects['invigilation/getCampusPlaceInfos'],
  examDateList: invigilation.examDateList, // 日期列表
  examDateListLoading: loading.effects['invigilation/getExamDateList'],
  roomBatchStatis: invigilation.roomBatchStatis, // 考场批次统计
}))
class Manage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeExamPlaceId: null, // 考点
      activeDateId: null, // 默认选中时间
      activeRoomId: null, // 当前选中的考场
      batchList: [], // 批次列表数据源
      selectedBatchList: [], // 当前选中的批次
      showInvigilateModal: false, // 安排监考弹窗
      showAdjustMasterModal: false, // 调整主监考老师弹窗
      finishModalData: null, // 完成安排警告弹窗（未安排监考批次列表）
      confirmModalData: null, // 完成安排,确认监考安排信息弹窗
      detailModalData: null, // 查看详情,监考安排信息弹窗
    };
  }

  componentDidMount() {
    this.loadTaskInfo();
    this.loadPlaceInfos();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'invigilation/clearCache' });
  }

  // #region 加载任务信息、考点时间信息、考场批次统计
  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getTaskInfo',
      payload: { taskId: match.params.taskId },
    }).then(res => {
      const { task, taskCampusList } = res.data;
      if (task.status !== 'TS_3') {
        router.push(`/examination/uexam/invigilation/result/${match.params.taskId}`);
      }

      if (taskCampusList) {
        const curCampus = taskCampusList.find(v => v.campusId === localStorage.campusId);
        if (curCampus && curCampus.invigilateStatus === 'Y') {
          router.push(`/examination/uexam/invigilation/result/${match.params.taskId}`);
        }
      }
    });
  };

  // 加载考点信息
  loadPlaceInfos = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'invigilation/getCampusPlaceInfos',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId,
      },
    }).then(res => {
      const { examPlaceList } = res.data; // , examDateList
      this.setState(
        {
          activeExamPlaceId: examPlaceList[0].examPlaceId,
          // activeDateId: examDateList[0].id,
        },
        () => {
          this.loadExamDateList();
        }
      );
    });
  };

  // 加载日期列表
  loadExamDateList = () => {
    const { dispatch, match } = this.props;
    const { activeExamPlaceId } = this.state;
    dispatch({
      type: 'invigilation/getExamDateList',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId,
        examPlaceId: activeExamPlaceId,
      },
    }).then(res => {
      const [examDate] = res.data;
      const { activeDateId } = this.state;
      if (!activeDateId) {
        this.setState(
          {
            activeDateId: examDate.id,
          },
          () => {
            this.loadRoomBatchStatis();
          }
        );
      } else {
        this.loadRoomBatchStatis();
      }
    });
  };

  // 加载考场批次统计
  loadRoomBatchStatis = () => {
    const { dispatch, match, placeInfos } = this.props;
    const { activeExamPlaceId, activeDateId, activeRoomId } = this.state;

    const dateInfo = placeInfos.examDateList.find(v => v.id === activeDateId);

    dispatch({
      type: 'invigilation/getRoomBatchStatis',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId,
        examPlaceId: activeExamPlaceId,
        examDate: dateInfo.examDate,
      },
    }).then(res => {
      if (!res.data || res.data.length === 0) {
        return;
      }
      let roomId = activeRoomId;
      if (!activeRoomId || !res.data.some(v => v.examRoomId === activeRoomId)) {
        roomId = res.data[0].examRoomId;
      }
      this.setState(
        {
          activeRoomId: roomId,
          selectedBatchList: [],
        },
        () => {
          this.getBatchList();
        }
      );
    });
  };

  // #endregion

  // 考点切换
  handleExamPlaceChanged = value => {
    this.setState(
      {
        activeExamPlaceId: value,
        selectedBatchList: [],
      },
      () => {
        this.loadExamDateList();
      }
    );
  };

  // 日期切换
  handleExamDateChanged = value => {
    this.setState(
      {
        activeDateId: value,
        selectedBatchList: [],
      },
      () => {
        this.loadRoomBatchStatis();
      }
    );
  };

  // 考场切换
  handleExamRoomChanged = value => {
    this.setState(
      {
        activeRoomId: value,
        selectedBatchList: [],
      },
      () => {
        this.getBatchList();
      }
    );
  };

  // 筛选批次数据源
  getBatchList = () => {
    const { activeRoomId, selectedBatchList } = this.state;
    const { roomBatchStatis } = this.props;
    if (activeRoomId) {
      const { examBatchList } = roomBatchStatis.find(v => v.examRoomId === activeRoomId);
      const batchList = examBatchList.map(item => ({
        ...item,
        selected: selectedBatchList.indexOf(item.examBatchId) > -1,
      }));
      this.setState({
        batchList: [...batchList],
      });
    }
  };

  // 批次选中/取消
  handleExamBatchChanged = selectedValues => {
    this.setState(
      {
        selectedBatchList: selectedValues,
      },
      () => {
        this.getBatchList();
      }
    );
  };

  // 安排监考
  handleInvigilateClick = () => {
    const { batchList } = this.state;
    const selectedBatches = batchList.filter(v => v.selected);
    if (selectedBatches.length === 0) {
      return;
    }
    const hasTeachers = selectedBatches.some(v => v.teacherList && v.teacherList.length > 0);
    if (hasTeachers) {
      const that = this;
      confirm({
        title: formatMessage({
          id: 'app.message.uexam.examination.invigilation.reset.tip',
          defaultMessage: '您选中的批次中，有已安排的监考老师，是否重新安排？',
        }),
        okText: formatMessage({
          id: 'app.button.uexam.examination.invigilation.reset',
          defaultMessage: '重新安排',
        }),
        cancelText: formatMessage({ id: 'app.examination.publish.cancel', defaultMessage: '取消' }),
        className: styles.clearConfirm,
        onOk() {
          that.setState({
            showInvigilateModal: true,
          });
        },
        onCancel() {},
      });
    } else {
      this.setState({
        showInvigilateModal: true,
      });
    }
  };

  // 安排监考关闭回调
  handleInvigilateModelClose = refresh => {
    if (refresh) {
      this.loadExamDateList();
    }
    this.setState({
      showInvigilateModal: false,
    });
  };

  // 取消安排
  handleCancelInvigilateClick = () => {
    const { batchList } = this.state;
    const selectedBatches = batchList.filter(v => v.selected);
    if (selectedBatches.length === 0) {
      return;
    }
    const { dispatch } = this.props;
    const subTaskIdList = selectedBatches.map(v => v.subTaskId);
    const that = this;

    confirm({
      title: formatMessage({
        id: 'app.message.uexam.examination.invigilation.cancel.tip',
        defaultMessage: '确定取消已选中批次的监考安排信息？',
      }),
      okText: formatMessage({
        id: 'app.button.uexam.examination.invigilation.cancel.ok',
        defaultMessage: '取消安排',
      }),
      cancelText: formatMessage({ id: 'app.examination.publish.cancel', defaultMessage: '取消' }),
      className: styles.clearConfirm,
      onOk() {
        dispatch({
          type: 'invigilation/cancelInvigilations',
          payload: subTaskIdList,
        }).then(res => {
          if (res.responseCode !== '200') {
            message.error(res.data);
            return;
          }
          that.loadExamDateList();
        });
      },
      onCancel() {},
    });
  };

  // 调整主监考老师
  handleAdjustMasterClick = () => {
    const { batchList } = this.state;
    const selectedBatches = batchList.filter(v => v.selected);
    if (selectedBatches.length === 0) {
      return;
    }

    this.setState({
      showAdjustMasterModal: true,
    });
  };

  // 调整主监考老师关闭回调
  handleAdjustMasterModallClose = refresh => {
    if (refresh) {
      this.loadRoomBatchStatis();
    }
    this.setState({
      showAdjustMasterModal: false,
    });
  };

  // 加载最新监考安排信息
  loadLastCampusInvigilations = callback => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'invigilation/getLastCampusInvigilations',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId,
      },
    }).then(res => {
      if (res.responseCode === '200') {
        callback(res.data);
      } else {
        message.error(res.data);
      }
    });
  };

  // 查看详情
  handleShowDetail = () => {
    this.loadLastCampusInvigilations(data => {
      this.setState({
        detailModalData: data,
      });
    });
  };

  // 完成安排
  handleFinish = () => {
    this.loadLastCampusInvigilations(data => {
      // 未安排监考批次信息
      // // ! 添加是否已有学生字段，bug fixed：VB-7591     type=[STARDARD,BACKUP]
      // const noneTeacherData = data.filter(v => v.hasStu && !v.teacherName); // && v.type === 'STARDARD'
      const noneTeacherData = data.filter(v => v.isShow === true && !v.teacherName);
      if (noneTeacherData && noneTeacherData.length > 0) {
        this.setState({
          finishModalData: noneTeacherData,
        });
      } else {
        this.setState({
          confirmModalData: data,
        });
      }
    });
  };

  // 完成安排警告弹窗
  handleFinishModalClose = () => {
    this.setState({
      finishModalData: null,
    });
  };

  // 确认监考安排信息弹窗关闭回调 & 查看详情弹窗关闭回调
  handleConfirmModalClose = isSubmit => {
    if (isSubmit) {
      this.finishCampusInvigilation();
    }
    this.setState({
      confirmModalData: null,
      detailModalData: null,
    });
  };

  // 提交完成安排
  finishCampusInvigilation = () => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'invigilation/finishCampusInvigilation',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId,
      },
    }).then(res => {
      if (res.responseCode === '200') {
        router.push(`/examination/uexam/invigilation/result/${match.params.taskId}`);
      } else {
        message.error(res.data);
      }
    });
  };

  render() {
    const {
      match,
      taskInfo,
      taskInfoLoading,
      placeInfos,
      placeInfosLoading,
      roomBatchStatis,
      examDateListLoading,
      examDateList,
    } = this.props;
    const {
      activeExamPlaceId,
      activeDateId,
      activeRoomId,
      batchList,
      showInvigilateModal,
      showAdjustMasterModal,
      finishModalData,
      confirmModalData,
      detailModalData,
    } = this.state;

    return (
      <div className={styles.invigilation}>
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
            id: 'app.text.uexam.examination.inspect.invigilation',
            defaultMessage: '监考安排',
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
            <div className={styles.invContent}>
              <div className={styles.left}>
                <TaskInfo taskInfo={taskInfo} />
                {!placeInfosLoading && placeInfos && (
                  <>
                    {activeExamPlaceId && (
                      <Toolbar
                        examPlaceList={placeInfos.examPlaceList}
                        activeExamPlaceId={activeExamPlaceId}
                        onExamPlaceChanged={this.handleExamPlaceChanged}
                      />
                    )}
                    {examDateListLoading && (
                      <NoData
                        tip={formatMessage({
                          id: 'app.message.registration.taskinfo.loading.tip',
                          defaultMessage: '信息加载中，请稍等...',
                        })}
                        onLoad={examDateListLoading}
                      />
                    )}
                    {!examDateListLoading && examDateList && activeDateId && (
                      <DateList
                        dateList={examDateList}
                        activeDateId={activeDateId}
                        onDateChanged={this.handleExamDateChanged}
                      />
                    )}
                  </>
                )}
                {!examDateListLoading && roomBatchStatis && roomBatchStatis.length > 0 && (
                  <>
                    <div className={styles.examRoomBatchContainer}>
                      <div className={styles.roomList}>
                        <ExamRoomList
                          examRoomList={roomBatchStatis}
                          activeRoomId={activeRoomId}
                          onRoomChanged={this.handleExamRoomChanged}
                        />
                      </div>
                      <div className={styles.batchList}>
                        <ExamBatchList
                          batchList={batchList}
                          onBatchChanged={this.handleExamBatchChanged}
                          onInvigilateClick={this.handleInvigilateClick}
                          onCancelInvigilateClick={this.handleCancelInvigilateClick}
                          onSetMasterClick={this.handleAdjustMasterClick}
                        />
                      </div>
                    </div>
                    <div className={styles.footerbtn}>
                      <Button
                        icon="eye"
                        className={styles.btnShow}
                        onClick={() => this.handleShowDetail()}
                      >
                        {formatMessage({
                          id: 'app.button.uexam.examination.invigilation.showdetail',
                          defaultMessage: '查看安排详情',
                        })}
                      </Button>
                      <Button className={styles.btnFinish} onClick={() => this.handleFinish()}>
                        {formatMessage({
                          id: 'app.button.uexam.examination.invigilation.finish',
                          defaultMessage: '完成安排',
                        })}
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.right}>
                <FlowChart
                  taskId={match.params.taskId}
                  status={taskInfo.status}
                  taskInfo={taskInfo}
                />
              </div>
            </div>
          )}
          {showInvigilateModal && (
            <InvigilateModal batchList={batchList} onModalClose={this.handleInvigilateModelClose} />
          )}
          {showAdjustMasterModal && (
            <AdjustMasterModal
              batchList={batchList}
              onModalClose={this.handleAdjustMasterModallClose}
            />
          )}
          {finishModalData && (
            <FinishModal batchList={finishModalData} onModalClose={this.handleFinishModalClose} />
          )}
          {confirmModalData && (
            <TableModal
              batchList={confirmModalData}
              showFooter
              onModalClose={this.handleConfirmModalClose}
              title={formatMessage({
                id: 'app.title.uexam.examination.invigilation.modal.confirm',
                defaultMessage: '确认监考信息',
              })}
            />
          )}
          {detailModalData && (
            <TableModal
              batchList={detailModalData}
              closeable
              onModalClose={this.handleConfirmModalClose}
              title={formatMessage({
                id: 'app.title.uexam.examination.invigilation.modal.detal',
                defaultMessage: '安排详情',
              })}
            />
          )}
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default Manage;
