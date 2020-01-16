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
import ChangeRule from './Components/ChangeRule/index'
import AddOneRule from './Components/AddOneRule/index'
import WarnTip from './Components/WarnTip/index'
import FlowChart from '../Components/FlowChart/index'
import FinishList from './Components/ContentList/Components/FinishList/index'
import router from 'umi/router';
const { confirm } = Modal;

/**
 * 考编管理-截止前-截止后
 * @author tina.zhang.xu
 * @date   2019-8-16 10:30:17
 * @param {string} taskId - 任务ID
 */
@connect(({ editroom, loading }) => ({
  taskInfo: editroom.taskInfo,
  taskInfoLoading: loading.effects['editroom/getTaskInfo'],
  examStatistics:editroom.examStatistics
}))
class EditManage extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      step:"manage",//页面步骤
      title:formatMessage({id:"app.button.app.button.uexam.exam.inpect.enroll",defaultMessage:"考场编排"}),
      doing:true,//true 进行中/已完成时没有学校完成编排， false 已完成
    }
  }
  componentDidMount() {
      this.init();
  }

  // #region 加载任务信息、报名数量统计
  // 加载任务信息
  loadTaskInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getTaskInfo',
      payload: { taskId: match.params.taskId }
    }).then(e=>{
        if(this.props.taskInfo.task.status=="TS_2"){//表示编排中
          let nowUnix = (new Date()).getTime();
          let diff = this.props.taskInfo.task.arrangeEndTime - nowUnix; // 毫秒
            this.setState({
            doing:diff>0?true:false
            })
        }else{
          router.push(`/examination/inspect/editroom/roommanage/${match.params.taskId}`);//表示完成
        }
    })
  }


  //107 查询编排结果
  getExamStatistics = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getExamStatistics',
      payload: { taskId: match.params.taskId }
    }).then(e=>{
      const {examStatistics} = this.props;
      if(examStatistics.campusFinishNum==0){
        this.setState({
          doing:true
         })
      }
    })
  }

 //108 学生编排-学校列表
  getExamCampus = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/getExamCampus',
      payload: { taskId: match.params.taskId }
    })
  }
  //114 完成编排
  examArrangeCompleted = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'editroom/examArrangeCompleted',
      payload: { taskId: match.params.taskId ,
        campusId:"FULL"}
    }).then(e=>{
      //页面跳转
      router.push(`/examination/inspect/editroom/roommanage/${match.params.taskId}`);
    })
  }
  init=()=>{
    this.loadTaskInfo();
    this.getExamStatistics();
    this.getExamCampus();

  }


  
  // #endregion

  render() {
    const {  taskInfoLoading, taskInfo,match} = this.props;
    const {  step,title,doing} = this.state;
    const currentTimeStamp = new Date().getTime();

    return (
      <div className={styles.editroom}>
        <h1 className={styles.menuName}>
          <Link to="/examination/inspect">
            <span>{formatMessage({ id: "app.menu.examination.inspect", defaultMessage: "检查" })}
              <i>/</i>
            </span>
          </Link>
          {formatMessage({id:"app.text.kcbp",defaultMessage:"考场编排"})}
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
                  step={step}
                />
                 {<ContentList taskId={match.params.taskId} doing={doing} step={step} nextPart={this.examArrangeCompleted}/>}
              </div>
              <div className={styles.right}>
                <FlowChart taskInfo={taskInfo.task} key={`editRoom${currentTimeStamp}`} taskId={match.params.taskId} status={taskInfo.task.status} />
              </div>
            </div>
          } 
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default EditManage;
