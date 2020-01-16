import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { BackTop } from 'antd';
import Link from 'umi/link';
import { formatMessage, defineMessages } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import TaskInfo from '../Components/TaskInfo';
import ReportTab from '../Components/ReportTab';
import ReportFilter from '../Components/ReportFilter';
import ReportOveriew from './Components/ReportOverview';
import PaperReport from '../Components/PaperReport'
import constant from '../constant';
import styles from './index.less';

const messages = defineMessages({
  inspect: { id: 'app.menu.examination.inspect', defaultMessage: '检查' },
  report: { id: 'app.menu.examination.report', defaultMessage: '分析报告' },
  taskInfoLoadingTip: { id: 'app.examination.report.st.taskInfoLoadingTip', defaultMessage: '任务信息加载中，请稍等...' }
});

// const keys
const { REPORT_TAB_KEY, TASK_TYPE, EXERCISE_TYPE } = constant;

/**
 * 学生报告-入口
 * 加载任务信息，根据tab选中类型加载对应组件
 * @author tina.zhang
 * @date   2019-05-08
 * @param {string} id - 任务ID
 * @param {string} paperId - 试卷ID
 * @param {string} studentId - 学生ID
 */
@connect(({ report }) => ({
  // 任务信息
  taskOverview: report.taskOverview,
  // 情况总览
  studentReportOverview: report.studentReportOverview,
  // TODO 自己处理loading状态，与教师页面共享taskOverview数据，loading之前，taskOverview已存在该数据，导致ReportOverview组件重复加载，其 useEffect 多次执行
  // // 页面加载状态
  // pageLoading: loading.effects['report/getTaskOverview']
}))
class StudentReport extends PureComponent {

  constructor(props) {
    super(props);

    const { paperId } = props

    this.state = {
      paperId,
      examNum: 0,
      pageLoading: true,
      activeTabKey: REPORT_TAB_KEY.report, // 当前选项卡
      showReportFilter: false,
      hoverBacktop: false, // 返回顶部 hover 状态
      backTopRightStyle: null // 返回顶部按钮style
    }
  }

  componentDidMount() {
    this.loadTaskOverview();
    // 监听 resize
    window.addEventListener('resize', this.getBacktopRight);
    window.addEventListener('scroll', this.getBacktopRight);
  }

  componentWillUnmount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'report/clearCache',
    //   payload: {},
    // });
    window.removeEventListener('resize', this.getBacktopRight);
    window.removeEventListener('scroll', this.getBacktopRight);
  }

  // 加载任务信息
  loadTaskOverview = () => {
    const { dispatch, taskId, paperId } = this.props;
    dispatch({
      type: 'report/getTaskOverview',
      payload: {
        taskId
      }
    }).then(res => {
      const { type, exerciseType, paperList } = res.data;
      const paperInfo = paperList.find(v => v.paperId === paperId);
      this.setState({
        pageLoading: false,
        showReportFilter: (type === TASK_TYPE.TEST) || (type === TASK_TYPE.TRAINING && exerciseType === EXERCISE_TYPE.EXER),
        examNum: paperInfo.examNum
      });
    });
  }

  // 切换选项卡
  handleTabChange = (key) => {
    const { taskOverview } = this.props;
    const { paperId } = this.state;
    if (key === constant.REPORT_TAB_KEY.paperreport && paperId === constant.FULL_PAPER_ID) {
      const paperInfo = taskOverview.paperList.filter(v => v.examNum > 0)[0];
      this.setState({
        activeTabKey: key,
        paperId: paperInfo.paperId,
        examNum: paperInfo.examNum
      });
    } else {
      this.setState({
        activeTabKey: key
      });
    }
  }

  // 试卷选择
  handlePaperChanged = (value) => {
    const { taskOverview } = this.props;
    let { examNum } = taskOverview;
    if (value !== constant.FULL_PAPER_ID) {
      const paperInfo = taskOverview.paperList.find(v => v.paperId === value);
      examNum = paperInfo.examNum;
    }
    this.setState({
      paperId: value,
      examNum
    })
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
    const { activeTabKey } = this.state
    const windowWith = window.innerWidth;
    if (activeTabKey === REPORT_TAB_KEY.paperreport && windowWith > 1480) {
      const rightFlexLeft = document.getElementsByClassName('flexLeft').length > 0 ? 205 : 0;
      const rightCardWidth = 846;
      const reportLeft = document.getElementById('divReportOverview').offsetLeft + 24;
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
  }

  render() {

    const { studentReportOverview, taskOverview, studentId, taskId } = this.props
    const { pageLoading, activeTabKey, showReportFilter, paperId, examNum, hoverBacktop, backTopRightStyle } = this.state
    const showMyScore = activeTabKey === REPORT_TAB_KEY.paperreport;

    // TODO 课后训练  练习模式判断
    let isExerciseReport = false;
    if (taskOverview) {
      isExerciseReport = taskOverview.type === TASK_TYPE.TEST || (taskOverview.type === TASK_TYPE.TRAINING && taskOverview.exerciseType === EXERCISE_TYPE.EXER)
    }

    return (
      <div id="divReportOverview" className={styles.reportStudent}>
        <h1 className={styles.menuName}>
          <Link to="/examination/inspect">
            <span>{formatMessage(messages.inspect)}
              <i>/</i>
            </span>
          </Link>
          {formatMessage(messages.report)}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {pageLoading && <NoData noneIcon={noneicon} tip={formatMessage(messages.taskInfoLoadingTip)} onLoad={pageLoading} />}
          {!pageLoading && taskOverview &&
            <div className={styles.reportContent}>
              <TaskInfo taskOverview={taskOverview} paperId={paperId} studentReportOverview={studentReportOverview} showMyScore={showMyScore} />
              <ReportTab isExerciseReport={isExerciseReport} taskOverview={taskOverview} onChange={(key) => this.handleTabChange(key)} />
              {showReportFilter && studentReportOverview &&
                <ReportFilter
                  showFullPaperOption={false}
                  defaultPaperId={paperId}
                  paperList={studentReportOverview.paperList}
                  classList={false}
                  examNum={examNum}
                  onPaperChanged={this.handlePaperChanged}
                  classType={taskOverview.classType}
                />
              }
              {activeTabKey === REPORT_TAB_KEY.report && <ReportOveriew paperId={paperId} studentId={studentId} />}
              {activeTabKey === REPORT_TAB_KEY.paperreport &&
                <PaperReport
                  paperId={paperId}
                  studentId={studentId}
                  taskId={taskId}
                  role={false}
                  classCount={taskOverview.classList.length}
                  exercise={taskOverview && taskOverview.type === 'TT_2' ? true : false}
                />}
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

export default StudentReport;
