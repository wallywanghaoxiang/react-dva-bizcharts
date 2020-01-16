/* eslint-disable no-unneeded-ternary */
import React, { Component } from 'react';
import Dimensions from 'react-dimensions';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import styles from './index.less';
import IconButton from '@/frontlib/components/IconButton';
import { formatDateTime } from '@/utils/utils';

const messages = defineMessages({
  resultBtnTit: { id: 'app.examination.inspect.task.btn.result.title', defaultMessage: '评分结果' },
  reportBtnTit: { id: 'app.examination.inspect.task.btn.report.title', defaultMessage: '分析报告' },
  date: { id: 'app.teacher.home.date.title', defaultMessage: '日期' },
})
class LearnSituationItem extends Component {
  state = {
  };

  componentWillMount() {
  }

  //  评分结果
  handleResult = () => {
    // 调用是否汇总，弹出loading页面 返回结果，无论成功失败，打开报告页面。
    const {scoreResult} = this.props;
    scoreResult()    
  }

  // 分析报告
  handleReport = (item) => {
    router.push({ pathname: `/examination/inspect/report/${item.taskId}` });
  }

  render() {
    const { item,containerWidth } = this.props;
    const contMaxWidth = containerWidth * 0.45;

    const { classList } = item;
    let classStr = '';
    classList.forEach(element => {
      classStr = `${classStr} | ${element.className}`
    });
    const showClassStr = classStr.substring(2, classStr.length);
    const group = classList.find((tag) => tag.classIndex === null)
    const isGroup = group ? true : false;

    // 教师角色处理
    let teacherTypeValue = '';
    if (item.teacherType.indexOf("MASTER") !== -1) {
      teacherTypeValue = 'MASTER';
    } else if (item.teacherType.indexOf("SUB") !== -1) {
      teacherTypeValue = 'SUB';
    } else {
      teacherTypeValue = 'TEACHER';
    }

    return (
      <div className={styles.learnSituationItem}>
        <div className={styles.left}>
          <div className={styles.status}>{item.statusValue}</div>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.name} title={item.name}>{item.name}</div>
              <div className={styles.tag}>{item.typeValue}</div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.classList}>
                <div className={styles.title}>
                  {
                    isGroup 
                    ? 
                    `${formatMessage({id:"app.text.menu.campus.groupName",defaultMessage:"分组"})}：`
                    :
                    `${formatMessage({id:"app.title.uexam.examination.inspect.registration.table.className",defaultMessage:"班级"})}：`
                  }
                  
                </div>
                <div style={{maxWidth:`${contMaxWidth}px`}} className={styles.cont} title={showClassStr}>{showClassStr}</div>
              </div>
              <div className={styles.date}>
                <span className={styles.title}>{formatMessage(messages.date)}：</span>
                <span className={styles.cont}>{formatDateTime(item.examTime)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          {
            item.status === 'TS_4' && item.linkStatus === 'ES_17' && teacherTypeValue === 'MASTER' &&
            <IconButton
              iconName="icon-computer-ai"
              text={formatMessage(messages.resultBtnTit)}
              className={styles.result}
              onClick={() => this.handleResult(item)}
            />
          }
          {
            item.status === 'TS_5' && item.linkStatus === 'ES_21' && item.teacherType !== 'SUB' &&
            <IconButton
              iconName="icon-statistics"
              text={formatMessage(messages.reportBtnTit)}
              className={styles.result}
              onClick={() => this.handleReport(item)}
            />
          }


        </div>
      </div>
    )
  }
}

// export default LearnSituationItem

export default Dimensions({
  getHeight: () => {
    return window.innerHeight;
  },
  getWidth: () => {
    return window.innerWidth;
  },
})(LearnSituationItem);
