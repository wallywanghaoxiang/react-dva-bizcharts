/**
 * 考试下，主要分三种
 * 1、 学生信息
 * 2、 考生信息
 * 3、 回溯模式
 */

import React, { PureComponent } from 'react';
import {connect} from 'dva';
import { formatMessage } from 'umi/locale';
import styles from './index.less';


// 学生卡片组件
const StudentCard = (props)=>{
  const { title, name, info } = props;
  return (
    <div className={styles.student}>
      <div className={styles.title}>{title}</div>
      <div className={styles.name}>{name}</div>
      {
        info.map(item=>(
          <div className={styles.info} key={item.key}>
            <div className={styles.key}>{item.label}</div>
            <div className={styles.value}>{item.value}</div>
          </div>
        ))
      }
    </div>
  );
}


@connect(({examBlock})=>{
  const { taskModel, paperList, snapshotId, student } = examBlock;
  const { lookBackUpon } = paperList.find(item=>item.snapshotId===snapshotId) || {};
  const { identifyCode, seatNo, studentName, studentClassCode } = student || {};
  return {
    taskModel,     // 是浏览器中的考试模式，还是客户端显示的考试模式
    lookBackUpon,  // 回溯对象
    identifyCode,  // 考号
    seatNo,        // 座位号
    studentName,   // 名称
    studentClassCode      // 学号
  }
})
class ExamAside extends PureComponent {

  /**
   *  显示的主题内容
   * 1、 学生信息
   * 2、 考生信息
   * 3、 回溯模式
   */
  renderConnect=()=>{
    const { lookBackUpon, taskModel, identifyCode, seatNo, studentName, studentClassCode } = this.props;

    if( lookBackUpon ){
      return <div>回溯组件</div>
    }

    let params = {};
    if( taskModel === "brower" ){
      // 浏览器模式
      params = {
        title : formatMessage({id:"app.text.studentInfo",defaultMessage:"学生信息"}),
        name  : studentName,
        info  : [{
          key : "studentClassCode",
          label : formatMessage({id:"app.text.studentNo",defaultMessage:"学号"}),
          value : studentClassCode
        }]
      }
    }else{
      // 客户端模式
      params = {
        title : formatMessage({id:"app.text.examstudentInfo",defaultMessage:"考生信息"}),
        name  : studentName,
        info  : [{
          key : "seatNo",
          label : formatMessage({id:"app.text.seatNo",defaultMessage:"座位号"}),
          value : seatNo
        },{
          key : "identifyCode",
          label : formatMessage({id:"app.text.examNo",defaultMessage:"考号"}),
          value : identifyCode
        }]
      }
    }

    return <StudentCard {...params} />
  }

  /**
   * 底部显示
   */
  renderFooter = ()=>{
    const { taskModel } = this.props;

    // 浏览器模式
    if( taskModel === "brower" ){
      return null;
    }
    // 客户端模式
    if( taskModel === "client" ){
      return (
        <div className={styles.footer} />
      )
    }

    return null;
  }

  render() {
    return (
      <div className={styles.body}>
        <div className={styles.connect}>
          {this.renderConnect()}
        </div>
        { this.renderFooter() }
      </div>
    );
  }
}

export default ExamAside;
