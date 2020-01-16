/**
 * 线上平台的，准备页面
 * 启动业务：
 * 1、获取任务详情和进度
 * 2、启动监听localstroage事件，获取任务的最新时间戳
 * 逻辑业务：
 * 判断能否进入任务，并给出提示。
 */
import React, { PureComponent } from "react";
import { Button, Icon } from "antd";
import { connect } from "dva";
import router from "umi/router";
import { defineMessages } from 'umi/locale';
import i10nProxy from '@/utils/i10n';
import { showTime } from "@/utils/timeHandle";
import styles from "./index.less";
import welcomeTypePic from "../assets/welcome_type_pic@2x.png";

const defineMessage = defineMessages({
  examTitle     : {id:'app.title.exam.title',       defaultMessage:'本次为全真模拟考试'},
  practiceTitle : {id:'app.title.practice.title',   defaultMessage:'本次训练为练习模式'},
  EstimatedTime : {id:'app.text.estimated.time',    defaultMessage:'预计时间：'},
  beginTask     : {id:'app.button.begin.task',      defaultMessage:'开始训练'},
  warnMessage   : {id:'app.text.task.cannot.stop',  defaultMessage:'训练期间不能暂停，请一次性完成'},
  hasTaskInProgress : {id:'app.message.has.task.in.progress',      defaultMessage:'此任务已经在其它选项卡打开，无法重复打开！'},
})
let messages;


@connect(({task, loading})=>{
  const { taskId, paperList=[], currentPaperId, storageKey  } = task;
  const { paperFullTime, examStatus, exerciseType } = paperList.find(item=>item.paperId===currentPaperId) || {};

  return {
    taskId,          // 任务id
    exerciseType,    // 课后训练任务类型（考试模式:EXAM_MODEL，练习模式:EXER_MODEL）
    paperFullTime,   // 预计时长
    storageKey,      // localStorage 该任务的key值
    examStatus,       // 试卷的答题状态
    loading : loading.effects["task/getStudentAnswerDetail"],   // 获取答题详情的loading
  }
})
class Ready extends PureComponent{

  state = {
    goToTask : false   // 能否进行考试
  }

  constructor(props){
    super(props);
    messages = i10nProxy(defineMessage);
  }

  componentDidMount(){
    const { storageKey } = this.props;

    // 获取当前的考试时间戳
    const currentTime =  localStorage.getItem(storageKey) || 0;
    this.setState({
      goToTask : Date.now() - currentTime > 1*1000
    });
    // 监听localstroage中的时间戳事件
    window.addEventListener("storage",this.bindEvent,false);
  }

  componentWillUnmount(){
    // 取消监听
    window.removeEventListener("storage",this.bindEvent)
  }

  /**
   * 绑定事件
   */
  bindEvent=(e)=>{
    const { storageKey } = this.props;
    // 获取最新的time，并写入task modal中
    if( e.key === storageKey ){
      const time = e.newValue || 0;
      this.setState({
        goToTask : Date.now() - time > 1*1000
      });
    }
  }

  /**
   * 进入
   */
  enterTask=()=>{
    // 重新获取学生考试状态，如果状态完成则跳转到结果页面，否则跳转到考试页面
    const { dispatch, taskId } = this.props;
    dispatch({
      type : "task/getStudentAnswerDetail",
    }).then(()=>{
      const { examStatus } = this.props;
      if( ['ES_3',"ES_4"].includes(examStatus) ){
        router.push(`/task/${taskId}/result`);
      }else{
        router.push(`/task/${taskId}/progress`);
      }
    });
  }

  render(){
    const { goToTask } = this.state;
    const { exerciseType, paperFullTime, loading } = this.props;
    if( !exerciseType ){
      return null;
    }

    // 文案提示
    // 1、如果 按钮不可点，提示用户当前任务在其它窗口打开，无法重复打开！
    // 2、如果是考试，提示需要一次性完成
    // 3、如果是练习，不现实
    let msg = "";
    if( !goToTask ){
      msg = messages.hasTaskInProgress;
    }else if( exerciseType==="EXAM_MODEL" ){
      msg = messages.warnMessage;
    }

    return (
      <div className={styles.body}>
        <div className={styles.image} style={{backgroundImage:`url(${welcomeTypePic})`}} />
        <div className={styles.title}>{exerciseType==="EXAM_MODEL"?messages.examTitle:messages.practiceTitle}</div>
        {exerciseType==="EXAM_MODEL" && <div className={styles.info}>{messages.EstimatedTime}<span className={styles.time}>{showTime(paperFullTime,"s")}</span></div>}
        <Button className={styles.button} loading={loading} type="light" shape="round" size="large" onClick={this.enterTask} disabled={!goToTask}>{messages.beginTask}</Button>
        { msg && <div className={styles.warn}><Icon type="exclamation-circle" theme="filled" /> {msg}</div>}
      </div>
    );
  }

}

export default Ready;
