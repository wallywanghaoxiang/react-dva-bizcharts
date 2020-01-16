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
import { defineMessages, formatMessage } from 'umi/locale';
import i10nProxy from '@/utils/i10n';
import styles from "./index.less";
import taskDoneIcon from "../assets/tast_done_icon.png";
import formateExamReport from "@/frontlib/utils/formatExamReport";
import showExamReport from "@/frontlib/components/ExampaperReport/api";
import { showTime } from "@/utils/timeHandle";

const defineMessage = defineMessages({
  taskComplete         : {id:'app.title.task.complete',            defaultMessage:'训练完成'},
  showReport           : {id:'app.button.show.report',             defaultMessage:'查看报告'},
  backToLearningCenter : {id:'app.button.back.to.learning.center', defaultMessage:'返回学情中心'},
})
let messages;

@connect(({task,loading})=>{
  const { paperList=[], currentPaperId } = task;
  const { answers=[], paperData={}, showData, answeringNo={} } = paperList.find(item=>item.paperId===currentPaperId);
  return {
    paperData : JSON.parse(JSON.stringify(paperData)),
    answers,
    showData,
    allTime : answeringNo.duration || 0,
    loading : loading.effects["task/downloadPaper"]
  }
})
class Ready extends PureComponent{

  constructor(props){
    super(props);
    messages = i10nProxy(defineMessage);
  }

  /**
   * 打开弹框查看报告
   */
  showReport=()=>{
    const { dispatch } = this.props;
    dispatch({
      type : "task/downloadPaper"
    }).then(()=>{
      const { answers, paperData, showData, allTime } = this.props;
      formateExamReport(paperData,answers);
      showExamReport({
        modalTitle : formatMessage({id:"app.title.exercise.report",defaultMessage:"练习报告"}),
        dataSource: {
          paperData,
          showData,
          allTime : showTime(allTime,"s")
        },
        callback: ()=>{},
      });
    });
  }


  /**
   * 返回学情中心
   */
  backToLearningCenter=()=>{
    router.push("/student/learncenter");
  }


  render(){
    const { loading } = this.props;
    return (
      <div className={styles.body}>
        <div className={styles.image} style={{backgroundImage:`url(${taskDoneIcon})`}} />
        <div className={styles.title}>{messages.taskComplete}</div>
        <Button loading={loading} className={styles.button} shape="round" type="main" onClick={this.showReport}>{messages.showReport}</Button>
        <div className={styles.back}>
          <Icon className={styles.icon} type="left" />
          <div className={styles['back-text']} onClick={this.backToLearningCenter}>
            {messages.backToLearningCenter}
          </div>
        </div>
      </div>
    );
  }

}

export default Ready;
