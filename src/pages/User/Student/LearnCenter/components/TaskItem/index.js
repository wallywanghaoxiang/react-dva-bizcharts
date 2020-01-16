import React, { Component } from 'react';
import {connect} from "dva";
import { formatMessage,FormattedMessage, defineMessages } from 'umi/locale';
import cs from 'classnames';
import router from 'umi/router';
import styles from './index.less';
import FastIcon from '@/assets/student/fast.png';
import IconButton from '@/frontlib/components/IconButton';
import StuReportModal from '../StuReportModal/index';
import InspectionReport from '../../../../../Examination/Inspect/Components/Inspection/InspectionReport';
import {timestampToDateMD} from '@/utils/utils';

const messages = defineMessages({
  makeUpBtnTit:{id:'app.student.learn.center.makeup.btn.title',defaultMessage:'补做'},
  detailBtnTit:{id:'app.examination.inspect.task.btn.detail.title',defaultMessage:'详情'},
  resultBtnTit:{id:'app.examination.inspect.task.btn.result.title',defaultMessage:'评分结果'},
  reportBtnTit:{id:'app.examination.inspect.task.btn.report.title',defaultMessage:'分析报告'},
  classTit:{id:'app.examination.inspect.task.class.title',defaultMessage:'班级：'},
  paperTit:{id:'app.examination.inspect.task.paper.title',defaultMessage:'试卷：'},
  examNum:{id:'app.examination.inspect.task.exam.person.number',defaultMessage:'实考/应考：'},
  teacherTit:{id:'app.examination.inspect.task.teacher.title',defaultMessage:'代课教师：'},
  person:{id:'app.examination.inspect.task.unit.person',defaultMessage:'人'},
  unStart:{id:'app.examination.inspect.task.status.ts_1',defaultMessage:'未开始'},
  inputNamePlaceholder:{id:'app.examination.inspect.task.name.placeholder',defaultMessage:"请输入任务名称"},
  inputNameTip:{id:'app.examination.inspect.task.name.tip',defaultMessage:"请输入任务名称！"},
  rate:{id:'app.student.learn.center.score.rate',defaultMessage:'得分率'},
  viewReportTit:{id:'app.student.learn.center.view.report.btn.title',defaultMessage:'查看报告>'},
  status1:{id:'app.student.learn.center.exam.status1.title',defaultMessage:'未参加'},
  status2:{id:'app.student.learn.center.exam.status2.title',defaultMessage:'未考试'},
  status3:{id:'app.student.learn.center.exam.status3.title',defaultMessage:'考试失败'},
  status4:{id:'app.student.learn.center.exam.status4.title',defaultMessage:'缺考'},
  status5:{id:'app.student.learn.center.exam.status5.title',defaultMessage:'正在考试'},
  status6:{id:'app.student.learn.center.exam.status6.title',defaultMessage:'考试失败'},
  status7:{id:'app.student.learn.center.exam.status7.title',defaultMessage:'答卷缺失'},
  execiseStatus1:{id:'app.student.learn.center.exam.execise.status1.title',defaultMessage:'未练习'},
  execiseStatus2:{id:'app.student.learn.center.exam.execise.status2.title',defaultMessage:'正在练习'},
  tag1:{id: 'app.examination.inspect.task.execise.mode1.title', defaultMessage: "考"},
  tag2:{id: 'app.examination.inspect.task.execise.mode2.title', defaultMessage: "练"},
  endTit:{id:'app.student.learn.center.exam.task.end.title',defaultMessage:'截止'},
  endTip:{id:'app.student.learn.center.exam.task.end.tip',defaultMessage:'已截止'},
  answerBtnTit:{id:'app.student.learn.center.answer.btn.title',defaultMessage:'去答题>'},
  finishNumber:{id:'app.import.teacher.success',defaultMessage:'已有{number}人完成'},
})

@connect(({global})=>{
  const { browser, version } = global.browserInfo;
  // 由于 课后训练，只能在 chrome 47+ 使用，所有判断是否可用进行训练
  return {
    trainAble : browser==="chrome" && version>= 47
  }
})
class TaskItem extends Component {
    state = {
      showReportBtn:false,
      showReportModal:false,
      showInspectReport:false,
      params:null
    }

    componentDidMount() {
    }

    // 分析报告
    handleReport = () => {
      const { item } = this.props;
      const params = {
        taskId:item.taskId,
        paperId:item.paperId,
        studentId:item.studentId,
        snapshotId:item.snapshotId
      }
      this.setState({
        params,
        showReportModal: true
      })
    }

    // 去答题
    answerClick = () => {
      const { item, trainAble } = this.props;
      if( trainAble ){
        router.push(`/task/${item.taskId}`);
      }else{
        router.push("/browser/TrainBrowserVersion")
      }
    }

    // 课后练习 - 查看报告
    checkExerciseReport = () => {
      const { item } = this.props;

      if (item.isExerciseReport) {
        // 打开练习结果
        const params = {
          taskId:item.taskId,
          paperId:item.paperId,
          studentId:item.studentId,
          snapshotId:item.snapshotId
        }
        this.setState({
          params,
          showInspectReport: true
        })
      } else {
        // 打开练习报告
        const params = {
          taskId:item.taskId,
          paperId:item.paperId,
          studentId:item.studentId,
          snapshotId:item.snapshotId
        }
        this.setState({
          params,
          showReportModal: true
        })
      }
    }

  // 处理状态
   renderStatus = (status) => {
     let statusStyle;
     switch(status) {
      case 'TS_1':
      statusStyle = styles.status1; // 未开始
      break;
      case 'TS_2':
      statusStyle = styles.status2; // 进行中
      break;
      case 'TS_3':
      statusStyle = styles.status3; // 评分中
      break;
      case 'TS_4':
      statusStyle = styles.status4; // 已评分
      break;
      case 'TS_5':
      statusStyle = styles.status5; // 已完成
      break;
      default:
      break;
     }
     return statusStyle;
   }

   // 考试/练习文案处理
   initText = (type,examStatus) => {
    let txt;
    if (type === 'TT_1' || type === 'TT_3') {
      // 考试
      switch(examStatus) {
        case 'ES_0':
        case 'ES_1':
        case '':
        case null:
        txt = formatMessage(messages.status2); // 考试对应的状态文案
        break;
        case 'ES_2':
        txt = formatMessage(messages.status5); // 练习对应的状态文案
        break;
        case 'ES_3':
        txt = formatMessage(messages.status6); // 练习对应的状态文案
        break;

        default:
        break;
      }
    } else if (type === 'TT_2') {
      // 练习
      switch(examStatus) {
        case 'ES_0':
        case 'ES_1':
        case '':
        case null:
        txt = formatMessage(messages.execiseStatus1); // 练习对应的状态文案
        break;
        case 'ES_2':
        txt = formatMessage(messages.execiseStatus2); // 练习对应的状态文案
        break;

        default:
        break;
      }
    }

     return txt;
   }

  render() {
    const { item } = this.props;
    const { showReportBtn,showReportModal,showInspectReport,params } = this.state;
    // 状态样式
    // const statusStyle = this.renderStatus(item.status);

    // console.log(item);
    // let showMark = 0;
    // if (item.mark && Number(item.mark)>0) {
    //   const scoreMark = Number(item.score) / Number(item.mark);
    //   const f = scoreMark.toFixed(2);
    //   showMark = Math.round(f*100);
    // }

    // item样式
    const itemClassName = item.type === 'TT_5' && item.isMakeUp ? cs(styles.expireTaskItem) : cs(styles.taskItem)

    return (
      <div
        className={itemClassName}
        onMouseEnter={() => {
          if (item.status === 'Y' && item.examStatus === 'ES_4' && item.paperId) {
            this.setState({
              showReportBtn:true
            })
          }
        }}
        onMouseLeave={() => {
          if (item.status === 'Y' && item.examStatus === 'ES_4' && item.paperId) {
            this.setState({
              showReportBtn:false
            })
          }
        }}
      >
        <div className={styles.top}>
          <div className={styles.left}>
            <div>
              {/* 考试类型 */}
              <div className={styles.tag}>{item.typeValue}</div>
              {/* 课后训练 -  练习模式 */}
              {
                item.type === 'TT_5' &&
                <div className={styles.tag} style={{marginLeft:'10px'}}>
                  {item.exerciseType === 'EXAM_MODEL'?formatMessage(messages.tag1):formatMessage(messages.tag2)}
                </div>
              }

            </div>
            {/* 任务名称 */}
            <div className={styles.taskTit}>{item.name}</div>
            {/* 截止日期 */}
            {
              item.type === 'TT_5' &&
              <div className={styles.closeDate}>
                <i className="iconfont icon-time" />
                <span style={{padding:'0px 4px'}}>{timestampToDateMD(item.exerciseEndTime)}</span>
                <span>{formatMessage(messages.endTit)}</span>
                {
                  item.isMakeUp &&
                  <span style={{color:'#FF6E4A',paddingLeft:'6px'}}>({formatMessage(messages.endTip)})</span>
                }
              </div>
            }

          </div>
          <div>
            {/* 非课后训练 */}
            {
              item.type !== 'TT_5' &&
              <div className={styles.right}>
                {/* 考试状态 */}

                {/* 未参加 */}
                {
                  item.status === 'N' &&
                  <div className={styles.examStatus}>
                    <i className="iconfont icon-warning" />
                    <span>{formatMessage(messages.status1)}</span>
                  </div>
                }
                {/* 未考试 */}
                {
                  item.status === 'Y' && (!item.examStatus || item.examStatus === null || item.examStatus==='ES_1' ||item.examStatus==='ES_0') &&
                  <div className={styles.examStatus}>
                    <i className="iconfont icon-warning" />
                    <span>{this.initText(item.type,item.examStatus)}</span>
                  </div>
                }

                {/* 进行中 */}
                {
                  item.status === 'Y' && item.examStatus === 'ES_2' &&
                  <div className={styles.examStatus}>
                    <i className="iconfont icon-warning" />
                    <span>{this.initText(item.type,item.examStatus)}</span>
                  </div>
                }

                {/* 考试失败 */}
                {
                  item.status === 'Y' && item.examStatus === 'ES_3' && item.type !== 'TT_2' &&
                  <div className={styles.examStatus}>
                    <i className="iconfont icon-warning" />
                    <span>{formatMessage(messages.status3)}</span>
                  </div>
                }

                {/* 得分率 */}
                {
                  item.status === 'Y' && item.examStatus === 'ES_4' && item.paperId &&
                  <div className={styles.scoreRateBox}>
                    <div className={styles.score}>{item.scoreRate}</div>
                    <div className={styles.scoreUnit}><span style={{ padding: '0px 4px' }}>%</span>{formatMessage(messages.rate)}</div>
                  </div>
                }

                {/* 未收到答卷 */}
                {
                  item.status === 'Y' && item.examStatus === 'ES_4' && !item.paperId &&
                  <div className={styles.examStatus}>
                    <i className="iconfont icon-warning" />
                    <span>{formatMessage(messages.status7)}</span>
                  </div>
                }

                {/* 查看报告按钮 */}
                {
                  showReportBtn &&
                  <div className={styles.reportBtn} onClick={this.handleReport}>
                    {formatMessage(messages.viewReportTit)}
                  </div>
                }
              </div>
            }

            {/* 课后训练 */}
            {
              item.type === 'TT_5' &&
              <div className={styles.right}>
                {/* 课后训练- 去答题 */}
                {
                  item.isContinue &&
                  <div className={styles.goAnswer}>
                    <div className={styles.finishNum}><FormattedMessage values={{number:item.examNum}} {...messages.finishNumber} /></div>
                    <div className={styles.answerBtn} onClick={this.answerClick}>{formatMessage(messages.answerBtnTit)}</div>
                  </div>
                }


                {/* 补做按钮 */}
                {
                  item.isMakeUp &&
                  <IconButton
                    text={formatMessage(messages.makeUpBtnTit)}
                    className={styles.makeup}
                    onClick={this.answerClick}
                  />
                }

                {/* 得分率 */}
                {
                  item.examStatus === 'ES_4' &&
                  <div className={styles.scoreRateBox}>
                    <div className={styles.score}>{item.scoreRate}</div>
                    <div className={styles.scoreUnit}><span style={{ padding: '0px 4px' }}>%</span>{formatMessage(messages.rate)}</div>
                  </div>
                }

                {/* 查看报告按钮 */}
                {
                  showReportBtn &&
                  <div className={styles.reportBtn} onClick={this.checkExerciseReport}>
                    {formatMessage(messages.viewReportTit)}
                  </div>
                }
              </div>
            }


          </div>
        </div>
        {/* 奖章 */}
        {/* {
          item.type === 'TT_5' && item.isFirst &&
          <div className={styles.medalBox}>
            <img src={FastIcon} alt="fastIcon" />
          </div>
        } */}

        {/* 任务结束后报告 */}
        {
          showReportModal && <StuReportModal data={params} onCloseModal={()=>{this.setState({showReportModal:false})}} />
        }

        {/* 课后训练- 试做报告 */}
        {
          showInspectReport &&
          <InspectionReport
            taskId={params.taskId}
            paperId={params.paperId}
            snapshotId={params.snapshotId}
            studentId={params.studentId}
            onClose={()=>{this.setState({showInspectReport:false})}}
          />
          }
      </div>
    );
  }
}
export default TaskItem;
