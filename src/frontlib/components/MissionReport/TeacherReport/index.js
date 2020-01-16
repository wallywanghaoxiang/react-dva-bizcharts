import React, { PureComponent } from 'react';
import { Modal, Message, BackTop } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import TaskInfo from '../Components/TaskInfo';
import ReportTab from '../Components/ReportTab';
import ReportFilter from '../Components/ReportFilter';
import ReportOveriew from './Components/ReportOverview';
import Transcript from './Components/Transcript';
import PaperReport from '../Components/PaperReport'
import constant from '../constant';
import styles from './index.less';

const messages = defineMessages({
  inspect: { id: 'app.menu.examination.inspect', defaultMessage: '检查' },
  report: { id: 'app.menu.examination.report', defaultMessage: '分析报告' },
  reportLoadingTip: { id: 'app.examination.report.loading.tip', defaultMessage: '任务信息加载中，请稍等...' },
  publishConfirmMsg: { id: 'app.examination.report.publish.confirmMsg', defaultMessage: '是否发布 {taskName} 的成绩?' },
  publishConfirmOkBtn: { id: 'app.examination.report.publish.confirmOkBtn', defaultMessage: '确定' },
  publishConfirmCancelBtn: { id: 'app.examination.report.publish.confirmCancelBtn', defaultMessage: '取消' },
  publishSuccess: { id: 'app.examination.report.publish.success', defaultMessage: '成绩发布成功' },
});

// const keys
const { FULL_PAPER_ID, FULL_CLALSS_ID, REPORT_TAB_KEY, TASK_TYPE, EXERCISE_TYPE } = constant;

/**
 * 教师报告-入口
 * 加载任务信息，根据tab选中类型加载对应组件
 * @author tina.zhang
 * @date   2019-05-06
 * @param {string} taskId - 任务ID
 * @param {string} type - 当前平台(exam考中、line:线上)
 */
@connect(({ report }) => ({
  // TODO 自己处理loading状态，与学生页面共享taskOverview数据，loading之前，taskOverview已存在该数据，导致ReportOverview组件重复加载，其 useEffect 多次执行
  // pageLoading: loading.effects['report/getTaskOverview'],
  taskOverview: report.taskOverview,
  taskStatus: report.taskStatus
}))
class TeacherReport extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      paperId: FULL_PAPER_ID,
      examNum: 0,
      classId: FULL_CLALSS_ID,
      classIdList: [],// constant.FULL_CLALSS_ID,
      activeTabKey: REPORT_TAB_KEY.report, // 当前选项卡
      hoverBacktop: false, // 返回顶部 hover 状态
      backTopRightStyle: null // 返回顶部按钮style
    }
  }

  componentDidMount() {
    const { type } = this.props
    if (process.env.ENV_CONFIG && process.env.ENV_CONFIG.projectName === "Exam") {// 表示在考中
      window.ExampaperStatus = "PREVIEW";
    }
    this.loadTaskOverview();
    // 监听 resize
    window.addEventListener('resize', this.getBacktopRight);
    const popWindow = document.getElementById('popWindow');
    if (popWindow) {
      popWindow.parentNode.addEventListener('scroll', this.getBacktopRight);
    }
    else if (type === 'exam') {
      const uexamPopWindow = document.getElementById('divReportOverview');
      uexamPopWindow.parentNode.parentNode.addEventListener('scroll', this.getBacktopRight);
    }
    else {
      window.addEventListener('scroll', this.getBacktopRight);
    }
  }

  componentWillUnmount() {
    const { type, dispatch } = this.props;
    dispatch({
      type: 'report/clearCache',
      payload: {},
    });
    window.removeEventListener('resize', this.getBacktopRight);
    const popWindow = document.getElementById('popWindow');
    if (popWindow) {
      popWindow.parentNode.removeEventListener('scroll', this.getBacktopRight);
    } else if (type === 'exam') {
      const uexamPopWindow = document.getElementById('divReportOverview');
      uexamPopWindow.parentNode.parentNode.removeEventListener('scroll', this.getBacktopRight);
    } else {
      window.removeEventListener('scroll', this.getBacktopRight);
    }
  }

  // 加载任务信息
  loadTaskOverview = () => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'report/getTaskOverview',
      payload: {
        taskId
      }
    }).then(res => {
      if (!res.data) {
        return;
      }
      const { type, exerciseType, paperList, examNum } = res.data;
      if (type === TASK_TYPE.TEST || (type === TASK_TYPE.TRAINING && exerciseType === EXERCISE_TYPE.EXER) || paperList.length === 1) {
        const paperInfo = paperList.filter(v => v.examNum > 0)[0];
        this.setState({
          paperId: paperInfo.paperId,
          examNum: paperInfo.examNum,
          pageLoading: false
        })
      } else {
        this.setState({
          examNum,
          pageLoading: false
        })
      }
    });

    dispatch({
      type: 'report/getTaskStatus',
      payload: {
        taskId
      }
    });
  }

  // 加载学生答卷人数
  loadExamNum = (paperId, classIdList) => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'report/getExamNum',
      payload: {
        campusId: localStorage.campusId,
        taskId,
        paperId,
        classIdList,
      }
    }).then(res => {
      if (res.responseCode === '200') {
        this.setState({
          examNum: res.data
        })
      } else {
        Message.error(res.data)
      }
    });
  }

  // 切换选项卡
  handleTabChange = (key) => {
    const { taskOverview } = this.props;
    const { paperId, classId } = this.state;
    if (key === REPORT_TAB_KEY.paperreport && paperId === FULL_PAPER_ID) {
      const paperInfo = taskOverview.paperList.filter(v => v.examNum > 0)[0]
      this.setState({
        activeTabKey: key,
        paperId: paperInfo.paperId,
      });
      // 加载学生答卷人数
      this.loadExamNum(paperInfo.paperId, [classId]);
    } else {
      this.setState({
        activeTabKey: key
      });
    }
  }

  // 试卷选择
  handlePaperChanged = (value) => {
    const { classId, classIdList, activeTabKey } = this.state
    this.setState({
      paperId: value,
    })
    // 加载学生答卷人数
    this.loadExamNum(value, activeTabKey === REPORT_TAB_KEY.paperreport ? [classId] : classIdList);
  }

  // 班级选择(多班&单班)
  handleClassChanged = (value) => {
    const { paperId, activeTabKey } = this.state;
    if (activeTabKey === REPORT_TAB_KEY.paperreport) {
      this.setState({
        classId: value
      });
    } else {
      const val = (value && value.length > 0) ? value : [];// constant.FULL_CLALSS_ID;
      this.setState({
        classIdList: val
      });
    }
    // 加载学生答卷人数
    this.loadExamNum(paperId, activeTabKey === REPORT_TAB_KEY.paperreport ? [value] : value);
  }

  // 发布成绩
  handlePublishGrade = () => {
    const { taskOverview, dispatch, taskId } = this.props;
    Modal.confirm({
      className: styles.modalButtons,
      title: <FormattedMessage values={{ taskName: taskOverview.taskName }} {...messages.publishConfirmMsg} />,
      okText: formatMessage(messages.publishConfirmOkBtn),
      cancelText: formatMessage(messages.publishConfirmCancelBtn),
      onOk: () => {
        dispatch({
          type: 'report/publishGrade',
          payload: {
            taskId
          }
        }).then(res => {
          if (res.responseCode === '200') {
            Message.success(formatMessage(messages.publishSuccess));
            dispatch({
              type: 'report/getTaskOverview',
              payload: {
                taskId
              }
            })
          } else {
            Message.error(res.data);
          }
        });
      }
    });
  }

  // backtop hover 事件
  handleMouseHover = (hover) => {
    this.setState({
      hoverBacktop: hover
    })
  }

  getBacktopTarget = () => {
    const { type } = this.props;
    let backTopTarget = window;
    const popWindow = document.getElementById('popWindow');
    if (popWindow) {
      backTopTarget = popWindow.parentNode;
    } else if (type === 'exam') {
      backTopTarget = document.getElementById('divReportOverview').parentNode.parentNode;
    }
    return backTopTarget;
  }

  getBacktopRight = () => {
    setTimeout(() => {
      const { activeTabKey } = this.state
      const { type } = this.props
      const windowWith = window.innerWidth;
      if (activeTabKey === REPORT_TAB_KEY.paperreport && windowWith > 1260) {
        const rightFlexLeft = document.getElementsByClassName('flexLeft').length > 0 ? 205 : 0;
        const rightCardWidth = 846;
        let reportLeft = document.getElementById('divReportOverview').offsetLeft + 24;
        if (type === 'exam') {
          reportLeft -= 20;
        }
        let rightContainerWidth = 0;
        const reportRight = document.getElementsByClassName('reportRight');
        if (reportRight.length > 0) {
          rightContainerWidth = reportRight[0].clientWidth + 44;
        }
        const left = reportLeft + rightFlexLeft + rightContainerWidth - ((rightContainerWidth - rightCardWidth) / 2) + 40 + 20;
        this.setState({
          backTopRightStyle: {
            right: windowWith - left - 40
          }
        })
        return;
      }
      this.setState({
        backTopRightStyle: null
      })
    }, 50);
  }

  render() {
    const { taskOverview, taskStatus, taskId, type } = this.props
    const { pageLoading, activeTabKey, paperId, examNum, classIdList, classId, hoverBacktop, backTopRightStyle } = this.state;

    // 答题详情页试卷必选（默认为选中列表中第一项）、班级选择框不允许多选
    const isPaperReport = activeTabKey === REPORT_TAB_KEY.paperreport;
    // (成绩单页面||答题详情页)&&班级数量大于1的时候显示 // TODO 班级数量为1时，显示文本
    let showClassSelector = false;
    if (taskOverview && (activeTabKey === REPORT_TAB_KEY.paperreport || activeTabKey === REPORT_TAB_KEY.transcript) && taskOverview.classList) {// && taskOverview.classList.length > 1;
      showClassSelector = true;
    }

    // 是否显示试卷不限
    let isExerciseReport = false;
    let showFullPaperOption = false;
    if (taskOverview) {
      // TODO 课后训练  练习模式判断
      isExerciseReport = taskOverview.type === TASK_TYPE.TEST || (taskOverview.type === TASK_TYPE.TRAINING && taskOverview.exerciseType === EXERCISE_TYPE.EXER)
      showFullPaperOption = !isPaperReport && !isExerciseReport && taskOverview.paperList.length > 1;
    }
    return (
      <div id="divReportOverview" className={styles.report}>
        {
          type === 'line' &&
          <h1 className={styles.menuName}>
            <Link to="/examination/inspect">
              <span>{formatMessage(messages.inspect)}
                <i>/</i>
              </span>
            </Link>
            {
              taskStatus &&
              <>
                {taskStatus.status === 'TS_4' ? formatMessage({ id: "app.examination.inspect.task.btn.result.title", defaultMessage: "评分结果" }) : formatMessage(messages.report)}
              </>
            }
          </h1>
        }

        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {pageLoading && <NoData noneIcon={noneicon} tip={formatMessage(messages.reportLoadingTip)} onLoad={pageLoading} />}
          {!pageLoading && taskOverview &&
            <div className={styles.reportContent}>
              <TaskInfo isExerciseReport={isExerciseReport} type={type} isTeacher taskOverview={taskOverview} taskStatus={taskStatus} publishGrade={this.handlePublishGrade} classId={classId} paperId={paperId} taskId={taskId} />
              <ReportTab isTeacher isExerciseReport={isExerciseReport} onChange={(key) => this.handleTabChange(key)} />
              {taskOverview.paperList && taskOverview.classList &&
                <ReportFilter
                  showFullPaperOption={showFullPaperOption}
                  paperList={taskOverview.paperList}
                  classList={showClassSelector === true ? taskOverview.classList : null}
                  examNum={examNum}
                  multiple={!isPaperReport}
                  onPaperChanged={this.handlePaperChanged}
                  onClassChanged={this.handleClassChanged}
                  type={type}
                  classType={taskOverview.classType}
                />
              }
              {activeTabKey === REPORT_TAB_KEY.report && <ReportOveriew paperId={paperId} />}
              {activeTabKey === REPORT_TAB_KEY.transcript && <Transcript type={type} paperId={paperId} classIdList={classIdList} />}
              {activeTabKey === REPORT_TAB_KEY.paperreport &&
                <PaperReport
                  classId={classId}
                  paperId={paperId}
                  taskId={taskId}
                  role={true}
                />
              }

            </div>
          }
        </PageHeaderWrapper>
        {/* back to top */}
        <BackTop style={backTopRightStyle} visibilityHeight={50} target={() => this.getBacktopTarget()}>
          <div className={styles.backtop} onMouseEnter={() => this.handleMouseHover(true)} onMouseLeave={() => this.handleMouseHover(false)}>
            {!hoverBacktop && <i className="iconfont icon-top" />}
            {hoverBacktop && <span className={styles.text}>{formatMessage({ id: "app.text.report.backtop", defaultMessage: "顶部" })}</span>}
          </div>
        </BackTop>
      </div>
    )
  }
}

export default TeacherReport;
