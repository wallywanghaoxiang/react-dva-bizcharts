import React, { PureComponent } from 'react';
import { Modal, Button, message } from 'antd'
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import TaskInfo from '../Components/TaskInfo';
import Toolbar from './Components/Toolbar';
import RegistrationList from './Components/RegistrationList';
import RegistrationSearch from './Components/RegistrationSearch';
import ImportModal from './Components/ImportModal';
import ClearModal from './Components/ClearModal';
import LoadingModal from './Components/LoadingModal';
import GenerateResultModal from './Components/GenerateResultModal';
import FinishModal from './Components/FinishModal';
import FlowChart from '../Components/FlowChart';
import styles from './index.less';

const { confirm } = Modal;

/**
 * 报名
 * @author tina.zhang
 * @date   2019-7-26 10:30:17
 * @param {string} taskId - 任务ID
 */
@connect(({ uexam, registration, loading }) => ({
  taskInfo: uexam.taskInfo,                           // 任务详情
  campusInfo: uexam.campusInfo,                       // 当前校区状态信息
  registrationCount: registration.registrationCount,  // 校区、学生数量已导入数量统计信息
  activeClassId: registration.activeClassId,          // 当前正在操作的班级ID
  taskInfoLoading: loading.effects['uexam/getTaskInfo'],
}))
class Manage extends PureComponent {

  // 报名状态
  UE_STATUS = {
    TS_0: 'TS_0', // 准备中
    TS_1: 'TS_1', // 报名中
  }

  // 任务报名方式
  UE_ENROLL_TYPE = {
    UET_1: 'UET_1', // 各校自行报名
    UET_2: 'UET_2'  // 区统一报名
  }

  constructor(props) {
    super(props);
    this.state = {
      showImport: false,           // 是否显示导入考试弹窗
      showClearModal: false,       // 是否显示清空名单弹窗
      showSearch: false,           // 是否切换搜索界面
      searchText: null,            // 搜索关键字
      refreshResult: false,        // 【导入、生成考号、删除、清空操作后】用于标记校区、学生列表是否需要重新加载
      showGenerateLoading: false,  // 生成考号 loading 状态
      showGenerateResult: false,   // 生成结果弹窗
      finishBtnLoading: false,     // 完成报名按钮执行中
      showFinishModal: false,      // 完成报名弹窗
      noStudentClassList: null,    // 未导入学生的班级列表
    }
  }

  componentDidMount() {
    this.loadTaskInfo();
    this.loadRegistrationCount();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'registration/clearCache' })
    dispatch({ type: 'uexam/clearTaskInfo' })
  }

  // #region 加载任务信息、报名数量统计
  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'uexam/getTaskInfo',
      payload: { taskId: match.params.taskId }
    }).then(res => {
      const { task, taskCampusList } = res.data;
      const campusInfo = taskCampusList.find(v => v.campusId === localStorage.campusId);
      if (task.status !== this.UE_STATUS.TS_1 || campusInfo.enrollStatus !== 'N') {
        router.push(`/examination/uexam/registration/result/${match.params.taskId}`);
      }
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
    });
  }
  // #endregion

  // #region 导入考生
  // 导入考生点击事件
  handleBtnImportClick = () => {
    this.setState({
      showImport: true,
    })
  }

  // 导入学生弹窗关闭, hasSubmit 是否有新导入
  handleImportClose = (hasSubmit) => {
    const { refreshResult } = this.state
    this.setState({
      showImport: false,
      refreshResult: hasSubmit ? !refreshResult : refreshResult
    });
    if (hasSubmit) {
      // 刷新报名数量统计
      this.loadRegistrationCount();
    }
  }
  // #endregion

  // #region 清空名单
  // 清空名单按钮事件
  handleBtnClearClick = () => {
    this.setState({
      showClearModal: true
    })
  }

  // 关闭清空弹窗  type:清空方式
  handleCloseClearModal = (type) => {
    this.setState({
      showClearModal: false
    })
    if (!type) {
      return;
    }
    const { match, dispatch, activeClassId } = this.props
    const payload = { taskId: match.params.taskId, campusId: localStorage.campusId };
    if (type === 'class') {
      payload.classId = activeClassId;
    }

    dispatch({
      type: 'registration/clearStudentList',
      payload
    }).then(res => {
      if (res.responseCode === '200') {
        const { refreshResult } = this.state
        this.setState({
          refreshResult: !refreshResult
        });
        // 刷新报名数量统计
        this.loadRegistrationCount();
      } else {
        message.error(res.data);
      }
    });
  }
  // #endregion

  // #region 重新生成考号
  // 提交重新生成考号
  generateExamNo = () => {
    this.setState({
      showGenerateLoading: true
    })
    const { dispatch, match } = this.props;
    const { refreshResult } = this.state;
    dispatch({
      type: 'registration/generateExamNo',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId
      }
    }).then(resp => {
      if (resp.responseCode === '200') {
        this.setState({
          showGenerateLoading: false,
          refreshResult: !refreshResult,
          showGenerateResult: true,
        })
      } else {
        this.setState({
          showGenerateLoading: false
        })
        message.error(resp.data);
      }
    });
  }

  // 重新生成考号弹窗确认
  handleBtnRegenerateClick = () => {
    const that = this;
    confirm({
      title: formatMessage({ id: "app.message.uexam.examination.inspect.registration.generateConfirm", defaultMessage: "重新生成将覆盖之前已生成的考号，是否确认？" }),
      okText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.generateOK", defaultMessage: "确认" }),
      cancelText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.generateCancel", defaultMessage: "取消" }),
      className: styles.clearConfirm,
      onOk() {
        that.generateExamNo();
      },
      onCancel() { },
    });
  }

  // 生成考号结果弹窗关闭回调
  handleGenerateResultModalClose = () => {
    this.setState({
      showGenerateResult: false,
    })
  }
  // #endregion

  // #region 搜索
  // 搜索切换
  handleSearchSwitch = (isOpen) => {
    this.setState({
      showSearch: isOpen,
      searchText: null
    })
  }

  // 搜索
  handleOnSearch = (value) => {
    this.setState({
      searchText: value
    })
  }
  // #endregion

  // #region 删除学生
  // 删除学生回调
  handleDeleteStudent = (studentId) => {
    const that = this;
    confirm({
      title: formatMessage({ id: "app.message.uexam.examination.inspect.registration.deleteConfirm", defaultMessage: "确定删除该考生？" }),
      okText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.delete", defaultMessage: "删除" }),
      cancelText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.canceldelete", defaultMessage: "取消" }),
      className: styles.clearConfirm,
      onOk() {
        const { dispatch, match } = that.props;
        const { refreshResult } = that.state
        dispatch({
          type: 'registration/removeStudent',
          payload: {
            taskId: match.params.taskId,
            studentId
          }
        }).then(resp => {
          if (resp.responseCode === '200') {
            that.setState({
              refreshResult: !refreshResult
            })
            that.loadRegistrationCount();
          } else {
            message.error(resp.data);
          }
        });
      },
      onCancel() { },
    });
  };
  // #endregion

  // #region 上报名单
  // 上报名单按钮
  handleFinish = () => {
    const { finishBtnLoading } = this.state;
    const { match, dispatch } = this.props
    if (finishBtnLoading) {
      return;
    }
    this.setState({
      finishBtnLoading: true
    });
    dispatch({
      type: 'registration/getLastCampusInfoList',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId
      }
    }).then(res => {
      // 如存在未导入学生的班级，弹窗确认
      const { data } = res;
      const campusInfo = data.find(v => v.campusId === localStorage.campusId);
      const classList = campusInfo.classList.filter(v => (v.studentNum || 0) <= 0);
      if (classList.length > 0) {
        this.setState({
          showFinishModal: true,
          noStudentClassList: classList
        });
      } else {
        const that = this;
        confirm({
          title: formatMessage({ id: "app.message.uexam.examination.inspect.registration.finishConfirm", defaultMessage: "完成后无法修改，是否确认？" }),
          okText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.generateOK", defaultMessage: "确认" }),
          cancelText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.generateCancel", defaultMessage: "取消" }),
          className: styles.clearConfirm,
          onOk() {
            that.submitFinishRegistration();
          },
          onCancel() {
            that.setState({
              finishBtnLoading: false
            });
          },
        });
      }
    })
  }

  // 完成弹窗关闭回调 type可选值：[submit:完成、goto:去报名]
  handleFinishModalClose = (type) => {
    this.setState({
      showFinishModal: false,
      noStudentClassList: null
    });
    if (type === 'submit') {
      const that = this;
      confirm({
        title: formatMessage({ id: "app.message.uexam.examination.inspect.registration.finishConfirm", defaultMessage: "完成后无法修改，是否确认？" }),
        okText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.generateOK", defaultMessage: "确认" }),
        cancelText: formatMessage({ id: "app.button.uexam.examination.inspect.registration.generateCancel", defaultMessage: "取消" }),
        className: styles.clearConfirm,
        onOk() {
          that.submitFinishRegistration();
        },
        onCancel() {
          that.setState({
            finishBtnLoading: false
          });
        },
      });
    } else {
      this.setState({
        finishBtnLoading: false
      });
      // message.warn('//TODO goto?')
    }
  }

  // 提交完成报名
  submitFinishRegistration = () => {
    const { match, dispatch } = this.props;
    this.setState({
      finishBtnLoading: false
    });
    dispatch({
      type: 'registration/finishRegistration',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.campusId
      }
    }).then(res => {
      if (res.responseCode === '200') {
        router.push(`/examination/uexam/registration/result/${match.params.taskId}`)
      } else {
        message.error(res.data);
      }
    })
  }
  // #endregion

  render() {
    const { showImport, showClearModal, showSearch, searchText, refreshResult, showGenerateLoading, showGenerateResult, showFinishModal, noStudentClassList } = this.state;
    const { match, taskInfoLoading, taskInfo, campusInfo, registrationCount } = this.props;

    // 上报名单按钮禁用状态
    let btnFinishDisabled = true;
    let showCountDown = false;
    if (taskInfo && registrationCount) {
      const { enrollType, enrollEndTime, status } = taskInfo;
      const { enrollStatus } = campusInfo;
      const { classNum, studentNum } = registrationCount;

      if (status === this.UE_STATUS.TS_1 && enrollStatus !== 'Y' && enrollType === this.UE_ENROLL_TYPE.UET_1 && (+classNum) > 0 && (+studentNum) > 0) {
        // const nowUnix = (new Date()).getTime();
        // if (nowUnix <= enrollEndTime) {
        //   btnFinishDisabled = false;
        //   showCountDown = true;
        // }
        btnFinishDisabled = false;
        showCountDown = true;
      }
    }

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
                <TaskInfo showCountDown={showCountDown} taskInfo={taskInfo} />
                <Toolbar
                  page="manage"
                  {...registrationCount}
                  onBtnImportClick={this.handleBtnImportClick}
                  onBtnClearClick={this.handleBtnClearClick}
                  onBtnRegenerateClick={this.handleBtnRegenerateClick}
                  onSearchSwitch={this.handleSearchSwitch}
                  onSearch={this.handleOnSearch}
                />
                {!showSearch && <RegistrationList taskId={match.params.taskId} refreshResult={refreshResult} onDeleteStudent={this.handleDeleteStudent} />}
                {showSearch && <RegistrationSearch taskId={match.params.taskId} searchText={searchText} onDeleteStudent={this.handleDeleteStudent} refreshResult={refreshResult} />}
                <div className={styles.footerbtn}>
                  <Button className={styles.btnFinish} onClick={() => this.handleFinish()} disabled={btnFinishDisabled}>
                    {formatMessage({ id: "app.button.uexam.examination.inspect.registration.submit", defaultMessage: "上报名单" })}
                  </Button>
                </div>
              </div>
              <div className={styles.right}>
                <FlowChart taskInfo={taskInfo} key={`registerResult${new Date().getTime()}`} taskId={match.params.taskId} status={taskInfo.status} />
              </div>
            </div>
          }

          {showImport && <ImportModal taskId={match.params.taskId} onModalClose={this.handleImportClose} />}
          {showClearModal && <ClearModal onModalClose={this.handleCloseClearModal} />}
          {showGenerateLoading &&
            <LoadingModal>
              {formatMessage({ id: "app.text.uexam.examination.inspect.registration.generate.submitting", defaultMessage: "考号生成中…请稍候" })}
            </LoadingModal>
          }
          {showGenerateResult && registrationCount &&
            <GenerateResultModal {...registrationCount} onModalClose={this.handleGenerateResultModalClose} />
          }
          {showFinishModal && noStudentClassList &&
            <FinishModal classList={noStudentClassList} onModalClose={this.handleFinishModalClose} />
          }
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default Manage;
