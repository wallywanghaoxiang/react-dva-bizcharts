import React, { PureComponent, Fragment } from 'react';
import { Modal, Button, message } from 'antd'
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import TaskInfo from '../Components/TaskInfo';
import Toolbar from './Components/Toolbar';
import ContentList from './Components/ContentList';
import styles from './index.less';
import WarnTip from './Components/WarnTip/index'
import FlowChart from '../Components/FlowChart/index'
import FinishList from './Components/ContentList/Components/FinishList/index'

const { confirm } = Modal;

/**
 * 考场编排
 * @author tina.zhang.xu
 * @date   2019-8-7 10:30:17
 * @param {string} taskId - 任务ID
 */
@connect(({ editroom, loading }) => ({
  taskInfo: editroom.taskInfo,
  strategyinfo: editroom.strategyinfo,
  taskInfoLoading: loading.effects['editroom/getTaskInfo'],
  noStrategyList: editroom.noStrategyList,
  finishNoStrategyList: editroom.finishNoStrategyList
}))
class RoomManage extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      showWarnTip: false,
      showWatchInfo: false,// 弹框 查看编排详情
      step: "step1",// 页面步骤
      status: "",// 控制step2的搜索框结果出现，取值none为出现，空为隐藏
      title: "",
      searchValue:"",
    }
  }

  componentDidMount() {
    this.loadTaskInfo();
  }

  // #region 加载任务信息、报名数量统计
  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getTaskInfo',
      payload: { taskId: match.params.taskId }
    }).then(() => {
      const { taskInfo } = this.props;
      const type=taskInfo.taskCampusList.find((Item)=>{
        return Item.campusId===localStorage.getItem('campusId');
      })
      if(type&&type.arrangeStatus==='N'){// 表示编排中
        this.inStep1();
      } else {
        // this.inStep1();
        this.inStep3();// 表示完成
      }
    })
  }

  // 101 查询任务学校策略
  loadExamStrategy = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getExamStrategy',
      payload: { taskId: match.params.taskId }
    })
  }


  // 107 查询编排结果
  getExamStatistics = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getExamStatistics',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.getItem('campusId'),
      }
    })
  }

  // 108 学生编排-学校列表
  getExamCampus = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getExamCampus',
      payload: { 
        taskId: match.params.taskId,
        campusId: localStorage.getItem('campusId'),
       }
    })
  }

  // 114 完成编排
  examArrangeCompleted = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/examArrangeCompleted',
      payload: {
        taskId: match.params.taskId,
        campusId: localStorage.getItem('campusId'),
      }
    })
  }

  inStep1 = () => {
    this.setState({
      showWarnTip: false,
      step: "step1",
      status: "",
      title: "",
    })
    this.loadExamStrategy();
  }

  // 开始编排
  nextPart = step => {
    if (step === "step2") {
        this.getExamStatistics();
        this.getExamCampus();
        this.setState({
          step: "step2",
          title: "",
        })
    } else if (step === "step3") {
      const { finishNoStrategyList } = this.props;
      if (finishNoStrategyList.length > 0) {
        this.setState({
          showWarnTip: true,
        })
      } else {
       this.examArrangeCompleted();// 完成编排
       this.inStep3();
      }
    }
  }

  inStep3 = () => {
    this.getExamStatistics();
    this.setState({
      status: "",// 隐藏搜索结果
      step: "step3",
      title: formatMessage({ id: "app.text.kcbp", defaultMessage: "考场编排" })
    })
  }



  // 打开详情页
  closeWatchInfo = () => {
    this.setState({
      showWatchInfo: false
    })
  }

  // #endregion

  render() {
    const { taskInfoLoading, taskInfo, strategyinfo, match } = this.props;
    const {  showWarnTip, showWatchInfo, step, status, title ,searchValue} = this.state;
    const currentTimeStamp = new Date().getTime();

    return (
      <div className={styles.editroom}>
        <h1 className={styles.menuName}>
          <Link to="/examination/inspect">
            <span>{formatMessage({ id: "app.menu.examination.inspect", defaultMessage: "检查" })}
              <i>/</i>
            </span>
          </Link>
          {formatMessage({ id: "app.text.kcbp", defaultMessage: "考场编排" })}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {taskInfoLoading && <NoData noneIcon={noneicon} tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad={taskInfoLoading} />}
          {!taskInfoLoading && taskInfo &&
            <div className={styles.regContent}>
              <div className={styles.left}>
                <TaskInfo showCountDown taskInfo={taskInfo.task} />
                <Toolbar
                  title={title}
                  taskId={match.params.taskId}
                  page='manage'
                  step={step}
                  back={() => {
                    this.inStep1()
                  }}
                  watchInfo={() => {
                    this.setState({
                      showWatchInfo: true,
                    })
                  }}
                  changeStatus={(e,v)=> {
                    this.setState({
                      status: e,
                      searchValue: v,
                    })
                  }}
                />
                {<ContentList
                  status={status}
                  taskId={match.params.taskId}
                  step={step}
                  searchValue={searchValue}
                  dataSource={strategyinfo}
                  nextPart={this.nextPart}
                  callback={this.callbackChangeRule}
                  updata={this.updata}// 更新编排后的数据
                />}
              </div>
              <div className={styles.right}>
                <FlowChart showFillInBtn={false} taskInfo={taskInfo.task} key={`manageRoom${currentTimeStamp}`} taskId={match.params.taskId} status={taskInfo.task.status} />
              </div>
            </div>
          }

          {showWatchInfo &&
            <Modal
              title={null}
              visible
              onCancel={this.closeWatchInfo}
              width={970}
              closable
              footer={null}
              maskClosable={false}
            >
              <Toolbar
                title={formatMessage({ id: "app.button.uexam.paper.arrange.see.arrange.detail", defaultMessage: "查看编排详情" })}
                taskId={match.params.taskId}
                step="step3"
              />
              <FinishList taskId={match.params.taskId} />
            </Modal>

          }
          {showWarnTip &&
            <WarnTip
              step={step}
              callback={(e) => {// 警告提示
                this.setState({
                  showWarnTip: false,
                })
                if (e) {// 忽略并完成编排
                  // this.examArrangeCompleted();// 完成编排
                  // this.inStep3();
                }
              }}
            />}
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default RoomManage;
