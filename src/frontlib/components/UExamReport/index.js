/* eslint-disable import/no-extraneous-dependencies */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import router from 'umi/router';
import Link from 'umi/link';
import { Modal, message, Divider, Radio } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import TaskInfo from './Components/TaskInfo';
import ReportTab from './Components/ReportTab';
//! TODO 动态引入组件方式 IE10 兼容性异常，暂时放弃 <https://github.com/umijs/umi/issues/3563>
import ExamPaperDetail from './ExamPaperDetail';
import ExamOverview from './ExamOverview';
import ExamAnalysis from './ExamAnalysis';
import ExamOverviewAffairs from './ExamOverviewAffairs';
import ExamStudentScore from './ExamStudentScore';
// import ExamPaperDetail from '../../register/ExamPaperDetail';
// import ExamOverview from '@/frontlib/register/ExamOverview';
// import ExamAnalysis from '@/frontlib/register/ExamAnalysis';
// import ExamOverviewAffairs from '@/frontlib/register/ExamOverviewAffairs';
// import ExamStudentScore from '@/frontlib/register/ExamStudentScore';
import constant from './constant';
import { delay } from '@/utils/utils';
import styles from './index.less';
import PublishSuccessModal from './Components/PublishSuccessModal';

const messages = defineMessages({
  inspect: { id: 'app.menu.examination.inspect', defaultMessage: '检查' },
  uexam: { id: 'app.title.examination.uexam', defaultMessage: '统考' },
  report: { id: 'app.menu.examination.report', defaultMessage: '分析报告' },
  reportLoadingTip: {
    id: 'app.examination.report.loading.tip',
    defaultMessage: '任务信息加载中，请稍等...',
  },
});

// const keys
const { SYS_TYPE, UEXAM_REPORT_TAB, FULL_CAMPUS_ID } = constant;

/**
 * 报告-入口
 * 加载任务信息，根据tab选中类型加载对应组件
 * @author tina.zhang
 * @date   2019-8-21
 * @param {string} taskId - 任务ID
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 * @param {React.JSXElement} FlowChart - 右侧流程图
 */
@connect(({ uexamReport, loading }) => ({
  taskInfo: uexamReport.taskInfo,
  uexamTaskInfo: uexamReport.uexamTaskInfo,
  publishLoading: loading.effects['uexamReport/publish'],
}))
class UExamReport extends PureComponent {
  constructor(props) {
    super(props);
    const { type } = this.props;
    this.state = {
      loading: false,
      activeTabKey: type === SYS_TYPE.CLASS ? UEXAM_REPORT_TAB.TAB_2 : UEXAM_REPORT_TAB.TAB_1, // 当前选项卡
      showPublishResult: false,
      displayUExamInfo: 'N', // 是否公布本次统考统计数据？
    };
  }

  componentDidMount() {
    // eslint-disable-next-line no-unused-vars
    const { type, dispatch, taskId } = this.props;
    this.loadTaskInfo();
    this.getUexamInfo();

    // 轮询报告是否生成
    // this.loopUexamTaskInfo();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'uexamReport/clearReport' });
  }

  // 统考系统 纯粹是为了获取当前任务的状态
  getUexamInfo = () => {
    const { dispatch, taskId } = this.props;
    // if (type === SYS_TYPE.UEXAM) {
    dispatch({
      type: 'uexamReport/getUexamTaskInfo',
      payload: {
        taskId,
      },
    });
    // }
  };

  // 轮询获取任务是否已生成报告
  loopUexamTaskInfo = async () => {
    await delay(20000); // 每20秒
    const { dispatch, taskId } = this.props;
    if (window.location.href.indexOf(`examination/inspect/report/${taskId}`) > -1) {
      const { responseCode, data } = await dispatch({
        type: 'uexamReport/getUexamTaskInfo',
        payload: { taskId },
      });
      if (responseCode === '200') {
        // TODO 什么条件下停止轮询
        return;
      }
      this.loopUexamTaskInfo();
    }
  };

  // 加载任务信息
  loadTaskInfo = () => {
    const { type, dispatch, taskId } = this.props;
    this.setState({
      loading: true,
    });
    const params = {
      taskId,
      campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
    };
    //  班级ID集合 （CLASS report 必填）
    if (type === SYS_TYPE.CLASS) {
      const { classIds: theClassIds } = JSON.parse(
        localStorage.getItem('redirect_to_report_params')
      );
      if (!theClassIds || theClassIds.length === 0) {
        message.error('参数异常 [redirect_to_report_params]');
        return;
      }
      params.classIds = theClassIds.join(',');
    }
    dispatch({
      type: 'uexamReport/getTaskInfo',
      payload: params,
    }).then(res => {
      const { data } = res;
      this.setState({
        loading: false,
        displayUExamInfo: data.displayUExamInfo || 'N',
      });
    });
  };

  // 切换选项卡
  handleTabChange = tabKey => {
    this.setState({
      activeTabKey: tabKey,
    });
  };

  // 发布成绩
  handlePublish = () => {
    const { uexamTaskInfo } = this.props;
    // 人工阅卷情况下的弹窗提示
    if (!uexamTaskInfo.task.markStatus && uexamTaskInfo.task.markType === 'UMT_2') {
      Modal.confirm({
        title: formatMessage({
          id: 'app.title.uexam.confirm.publish.title1',
          defaultMessage: '是否确认跳过人工阅卷步骤公布成绩？',
        }),
        className: styles.endMarkingModal,
        content: (
          <span style={{ color: '#888888', fontSize: '13px' }}>
            {formatMessage({
              id: 'app.text.uexam.confirm.publish.tip1',
              defaultMessage: '默认生成考生机评成绩后将无法撤回！',
            })}
          </span>
        ),
        okText: formatMessage({
          id: 'app.button.uexam.examination.marking.mymark.continueTo',
          defaultMessage: '继续',
        }),
        centered: true,
        cancelText: formatMessage({ id: 'app.button.cancel', defaultMessage: '取消' }),
        okButtonProps: {
          style: { backgroundColor: '#FF6E4A', boxShadow: '0px 2px 5px 0px rgba(255,110,74,0.5)' },
        },
        onOk: () => {
          this.publish();
        },
      });
    } else {
      this.showTwoConfirm();
    }
  };

  showTwoConfirm = () => {
    Modal.confirm({
      title: formatMessage({
        id: 'app.title.uexam.publish.confirm.title2',
        defaultMessage: '是否确认公布成绩？',
      }),
      className: styles.endMarkingModal,
      content: (
        <div className={styles.publishModal}>
          <span style={{ color: '#888888', fontSize: '13px' }}>
            {formatMessage({
              id: 'app.text.uexam.publish.confirm.tip2',
              defaultMessage: '生成考生成绩后将无法撤回！',
            })}
          </span>
          {this.renderDisplayUExamInfo()}
        </div>
      ),
      okText: formatMessage({
        id: 'app.button.uexam.examination.marking.mymark.continueTo',
        defaultMessage: '继续',
      }),
      centered: true,
      cancelText: formatMessage({ id: 'app.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        style: { backgroundColor: '#FF6E4A', boxShadow: '0px 2px 5px 0px rgba(255,110,74,0.5)' },
      },
      onOk: () => {
        this.publish();
      },
      onCancel: () => {
        const { taskInfo } = this.props;
        const { displayUExamInfo } = this.state;
        const taskDisplay = taskInfo.displayUExamInfo || 'N';
        if (taskDisplay !== displayUExamInfo) {
          this.setState({
            displayUExamInfo: taskDisplay,
          });
        }
      },
    });
  };

  // 渲染本次统考数据是否可见设置dom
  renderDisplayUExamInfo = hideTopDivider => {
    const { displayUExamInfo } = this.state;
    return (
      <div className={styles.settingContainer}>
        {!hideTopDivider && <Divider type="horizontal" />}
        <div className={styles.displayUExamInfo}>
          <span>
            {formatMessage({
              id: 'app.message.uexam.report.confirm.setdisplay',
              defaultMessage: '是否公布本次统考统计数据？',
            })}
          </span>
          <span>
            <Radio.Group
              onChange={e => {
                this.setState({
                  displayUExamInfo: e.target.value,
                });
              }}
              defaultValue={displayUExamInfo}
            >
              <Radio value="Y">
                {formatMessage({
                  id: 'app.text.uexam.report.setdisplay.show',
                  defaultMessage: '公布',
                })}
              </Radio>
              <Radio value="N">
                {formatMessage({
                  id: 'app.text.uexam.report.setdisplay.hide',
                  defaultMessage: '不公布',
                })}
              </Radio>
            </Radio.Group>
          </span>
        </div>
        <Divider type="horizontal" />
      </div>
    );
  };

  // 提交本次统考数据是否可见设置
  updateReportDisplayUExamInfo = callback => {
    const { dispatch, taskId } = this.props;
    const { displayUExamInfo } = this.state;
    dispatch({
      type: 'uexamReport/updateReportDisplayUExamInfo',
      payload: { taskId, displayUExamInfo },
    }).then(res => {
      if (res.responseCode === '200') {
        if (callback && typeof callback === 'function') {
          callback();
        }
      } else {
        message.error(res.data);
      }
    });
  };

  publish = () => {
    const { dispatch, taskId } = this.props;
    this.updateReportDisplayUExamInfo(() => {
      dispatch({
        type: 'uexamReport/publish',
        payload: {
          taskId,
        },
        callback: () => {
          // 发布成功 跳转到检测列表页
          // router.push('/examination/inspect');
          this.setState({
            showPublishResult: true,
          });
        },
      });
    });
  };

  // 刷新
  handleRefresh = () => {
    // UEXAM-022 更新summaryStatus
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'uexamReport/updateTaskInfo',
      payload: {
        taskId,
        summaryStatus: 'NULL',
      },
      callback: () => {
        // 更新成功
        this.loadTaskInfo();
        this.getUexamInfo();
        this.setState({
          activeTabKey: UEXAM_REPORT_TAB.TAB_1,
        });
      },
    });
  };

  // 本次统考数据是否可见设置按钮回调
  handleDisplaySetModal = () => {
    Modal.confirm({
      title: formatMessage({
        id: 'app.title.uexam.report.confirm.setdisplay',
        defaultMessage: '设置',
      }),
      className: styles.endMarkingModal,
      content: this.renderDisplayUExamInfo(true),
      okText: formatMessage({
        id: 'app.button.uexam.examination.marking.mymark.continueTo',
        defaultMessage: '继续',
      }),
      centered: true,
      cancelText: formatMessage({ id: 'app.button.cancel', defaultMessage: '取消' }),
      okButtonProps: {
        style: { backgroundColor: '#FF6E4A', boxShadow: '0px 2px 5px 0px rgba(255,110,74,0.5)' },
      },
      onOk: () => {
        this.updateReportDisplayUExamInfo(() => {
          this.loadTaskInfo();
        });
      },
      onCancel: () => {
        const { taskInfo } = this.props;
        const { displayUExamInfo } = this.state;
        const taskDisplay = taskInfo.displayUExamInfo || 'N';
        if (taskDisplay !== displayUExamInfo) {
          this.setState({
            displayUExamInfo: taskDisplay,
          });
        }
      },
    });
  };

  render() {
    const { type, taskId, taskInfo, uexamTaskInfo, publishLoading, FlowChart } = this.props;
    const { loading, activeTabKey, showPublishResult } = this.state;

    const theType = type || SYS_TYPE.UEXAM;

    return (
      <div id="divReportOverview" className={styles.report}>
        <h1 className={styles.menuName}>
          <Link to={theType === SYS_TYPE.UEXAM ? '/examination/inspect' : '/examination/uexam'}>
            <span>
              {theType === SYS_TYPE.UEXAM
                ? formatMessage(messages.inspect)
                : formatMessage(messages.uexam)}
              <i>/</i>
            </span>
          </Link>
          {uexamTaskInfo && uexamTaskInfo.task && (
            <>
              {uexamTaskInfo.task.status === 'TS_8' // type === SYS_TYPE.UEXAM &&
                ? formatMessage({
                    id: 'app.examination.inspect.task.btn.result.title',
                    defaultMessage: '评分结果',
                  })
                : formatMessage(messages.report)}
            </>
          )}
        </h1>

        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {loading && !taskInfo && <NoData tip={formatMessage(messages.reportLoadingTip)} onLoad />}
          {!loading && taskInfo && (
            <div className={styles.reportContent}>
              <div className={styles.left}>
                <TaskInfo
                  type={theType}
                  taskInfo={taskInfo}
                  uexamTaskInfo={
                    !uexamTaskInfo || type !== SYS_TYPE.UEXAM ? null : uexamTaskInfo.task
                  }
                  onPublish={this.handlePublish}
                  onDisplaySetClick={this.handleDisplaySetModal}
                  publishLoading={publishLoading}
                  onRefresh={this.handleRefresh}
                />
                <ReportTab
                  type={type}
                  onChange={key => this.handleTabChange(key)}
                  activeKey={activeTabKey}
                />
                {activeTabKey === UEXAM_REPORT_TAB.TAB_1 && (
                  <ExamOverviewAffairs taskId={taskId} type={theType} />
                )}
                {activeTabKey === UEXAM_REPORT_TAB.TAB_2 && (
                  <ExamOverview taskId={taskId} type={theType} />
                )}
                {activeTabKey === UEXAM_REPORT_TAB.TAB_3 && (
                  <ExamAnalysis taskId={taskId} type={theType} />
                )}
                {activeTabKey === UEXAM_REPORT_TAB.TAB_4 && (
                  <ExamStudentScore taskId={taskId} type={theType} />
                )}
                {/* eslint-disable-next-line jsx-a11y/aria-role */}
                {activeTabKey === UEXAM_REPORT_TAB.TAB_5 && (
                  <ExamPaperDetail taskId={taskId} type={theType} role />
                )}
              </div>
              {type === SYS_TYPE.UEXAM &&
                uexamTaskInfo &&
                uexamTaskInfo.task &&
                uexamTaskInfo.task.status === 'TS_8' &&
                FlowChart && (
                  <div id="report_flowchart" className={styles.flowChart}>
                    <FlowChart
                      taskInfo={uexamTaskInfo.task}
                      key={`markingTask${new Date().getTime()}`}
                      taskId={taskId}
                      status={uexamTaskInfo.task.status}
                    />
                  </div>
                )}
            </div>
          )}
        </PageHeaderWrapper>

        {showPublishResult && (
          <PublishSuccessModal
            campusNum={taskInfo.campusNum}
            onModalClose={() => {
              this.setState({
                showPublishResult: false,
              });
              this.loadTaskInfo();
              this.getUexamInfo();
            }}
          />
        )}
      </div>
    );
  }
}

export default UExamReport;
