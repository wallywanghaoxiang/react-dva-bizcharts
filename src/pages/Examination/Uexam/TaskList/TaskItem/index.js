import React, { Component } from 'react';
import { Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import cs from 'classnames';
import router from 'umi/router';
import IconButton from '@/frontlib/components/IconButton';
import constant from '@/frontlib/components/UExamReport/constant';
import { formatDateTime } from '@/utils/utils';
import styles from './index.less';

// const keys
const { SYS_TYPE } = constant;

class TaskItem extends Component {
  constructor(props) {
    super(props);
    const { item } = this.props;
    this.diffDayResult = {
      // 报名截止
      enrollEnd: this.diffDays(item.enrollEndTime),
      // 编排截止
      arrangeEnd: this.diffDays(item.arrangeEndTime),
      // 监考安排截止
      invigilateEnd: this.diffDays(item.invigilateEndTime),
    };
  }

  componentDidMount() {}

  // 计算倒计时
  diffDays = theTime => {
    // 计算剩余天数
    const nowUnix = new Date().getTime();
    const diff = theTime - nowUnix; // 毫秒
    if (diff < 0) {
      return diff;
    }
    const days = Math.ceil(diff / (3600 * 1000) / 24);
    return days;
  };

  // 查看报名
  handleShowSignUpClick = id => {
    router.push(`/examination/uexam/registration/result/${id}`);
  };

  // 报名
  handleSignUpManageClick = id => {
    router.push(`/examination/uexam/registration/manage/${id}`);
  };

  // 编排
  handleEnrollClick = id => {
    router.push(`/examination/uexam/editroom/roommanage/${id}`);
  };

  // 查看编排
  handleShowEnrollClick = id => {
    router.push(`/examination/uexam/editroom/roommanage/${id}`);
  };

  // 监考安排
  handleInvigilateClick = id => {
    router.push(`/examination/uexam/invigilation/manage/${id}`);
  };

  // 查看监考安排
  handleShowInvigilateClick = id => {
    router.push(`/examination/uexam/invigilation/result/${id}`);
  };

  // 分析报告
  handleReportClick = (id, classIds) => {
    // TODO localStorage 存储 classIds , 共班级报告使用
    if (classIds && classIds.length > 0) {
      localStorage.setItem(
        'redirect_to_report_params',
        JSON.stringify({ taskId: id, type: SYS_TYPE.CLASS, classIds })
      );
    } else {
      localStorage.setItem(
        'redirect_to_report_params',
        JSON.stringify({ taskId: id, type: SYS_TYPE.CAMPUS })
      );
    }
    router.push(`/examination/uexam/report/${id}`);
  };

  // 批次信息
  handleBatchInfoClick = id => {
    router.push(`/examination/uexam/information/batch/${id}`);
  };

  // 考务信息
  handleExamInfoClick = (id, isSubjectAdmin) => {
    localStorage.setItem('redirect_to_exam_params', JSON.stringify({ taskId: id, isSubjectAdmin }));
    router.push(`/examination/uexam/information/exam/${id}`);
  };

  render() {
    const { item } = this.props;
    const { campus } = item;
    const { enrollEnd, arrangeEnd, invigilateEnd } = this.diffDayResult;

    //! 报告入口按钮逻辑，取决于列表返回数据中的 isSubjectAdmin、classIds
    // isSubjectAdmin===true =>【分析报告】
    // isSubjectAdmin===true && classIds!=='' =>【本班分析报告】
    // isSubjectAdmin===false =>【本班分析报告】
    let showClassReport = false;
    let showCampusReport = false;
    if (item.status === 'TS_9' && item.isShowReport) {
      if (item.isSubjectAdmin === true) {
        showCampusReport = true;
        if (item.classIds && item.classIds.length > 0) {
          showClassReport = true;
        }
      } else {
        showClassReport = true;
      }
    }

    return (
      <div className={styles.taskItem}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.leftTop}>
              <span>
                {/* 任务名称 */}
                <span className={styles.taskTit}>{item.name}</span>
                {/* 考试类型 */}
                <div className={cs(styles.tag, styles.type)}>{item.ueTypeValue}</div>
                {/* 任务状态 */}
                <div className={cs(styles.tag)}>{item.statusValue}</div>
              </span>
            </div>
            <div className={styles.bottom}>
              {/* <span className={styles.tit}>{formatMessage({ id: "app.title.uexam.exam.inspect.import.school", defaultMessage: "已导入学校" })}：</span>
              <span>20</span>
              <Divider type="vertical" />
              <span className={styles.tit}>{formatMessage({ id: "app.title.uexam.exam.inspect.import.student", defaultMessage: "已导入考生" })}：</span>
              <span>700</span> */}

              {/* 已报名考生 */}
              {item.status === 'TS_1' && (
                <>
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.reg.stunum',
                      defaultMessage: '已报名考生',
                    })}
                    ：
                  </span>
                  <span>{item.studentNum || 0}</span>
                </>
              )}

              {/* 已编排班级、已编入考生 */}
              {item.status === 'TS_2' && (
                <>
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.arrange.classnum',
                      defaultMessage: '已编排班级',
                    })}
                    ：
                  </span>
                  <span>{item.arrangeClassNum || 0}</span>
                  <Divider type="vertical" />
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.arrange.stunum',
                      defaultMessage: '已编入考生',
                    })}
                    ：
                  </span>
                  <span>{item.arrangeStudentNum || 0}</span>
                </>
              )}

              {/* 已安排批次、已安排监考老师 */}
              {(item.status === 'TS_3' || item.status === 'TS_4' || item.status === 'TS_5') && (
                <>
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.invigilate.batchnum',
                      defaultMessage: '已安排批次',
                    })}
                    ：
                  </span>
                  <span>{item.batchNum || 0}</span>
                  <Divider type="vertical" />
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.invigilate.teachernum',
                      defaultMessage: '已安排监考教师',
                    })}
                    ：
                  </span>
                  <span>{item.batchTeacherNum || 0}</span>
                </>
              )}

              {/* 已安排批次、已安排监考老师 */}
              {(item.status === 'TS_6' ||
                item.status === 'TS_7' ||
                item.status === 'TS_8' ||
                item.status === 'TS_9') && (
                <>
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.grade',
                      defaultMessage: '年级',
                    })}
                    ：
                  </span>
                  <span>{item.gradeValue}</span>
                  <Divider type="vertical" />
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.stusum',
                      defaultMessage: '考生总数',
                    })}
                    ：
                  </span>
                  <span>{item.studentNum || 0}</span>
                  <Divider type="vertical" />
                  <span className={styles.tit}>
                    {formatMessage({
                      id: 'app.text.uexam.tasklist.item.examtime',
                      defaultMessage: '考试时间',
                    })}
                    ：
                  </span>
                  <span>
                    {`${formatDateTime(Number(item.examBeginTime))} ${formatMessage({
                      id: 'app.text.uexam.exam.to',
                      defaultMessage: '至',
                    })} ${formatDateTime(Number(item.examEndTime))}`}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className={styles.btnGroup}>
            {/* 【报名】 */}
            {/* TS_1 and enroll_type=UET_1 and enroll_status=Y and campus.enroll_status=N */}
            {item.status === 'TS_1' &&
              item.enrollType === 'UET_1' &&
              item.enrollStatus === 'Y' &&
              campus.enrollStatus === 'N' && (
                <>
                  {enrollEnd > 0 && (
                    <>
                      {enrollEnd === 1 ? (
                        <div className={styles.remainDays}>
                          <span className={styles.day}>
                            {formatMessage({
                              id:
                                'app.text.uexam.examination.inspect.registration.taskinfo.lastday',
                              defaultMessage: '今日截止报名',
                            })}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.remainDays}>
                          <span className={styles.subTit}>
                            {formatMessage({
                              id: 'app.title.uexam.exam.inspect.sign.up.remain.day',
                              defaultMessage: '报名剩余时间',
                            })}
                            ：
                          </span>
                          <span className={styles.day}>
                            {enrollEnd}
                            {formatMessage({ id: 'app.teacher.home.day', defaultMessage: '天' })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <IconButton
                    text={formatMessage({
                      id: 'app.button.app.button.uexam.exam.inpect.sign.up',
                      defaultMessage: '报名',
                    })}
                    className={styles.btnYellow}
                    onClick={() => this.handleSignUpManageClick(item.id)}
                  />
                </>
              )}

            {/* 【考场编排】 //! update 2019-9-19 16:46:30  取消超时限制 */}
            {/* TS_2 and arrange_type=UAT_1 and campus.arrange_status=N */}
            {item.status === 'TS_2' &&
              item.arrangeType === 'UAT_1' &&
              campus &&
              campus.arrangeStatus === 'N' && (
                <>
                  {arrangeEnd > 0 && (
                    <>
                      {arrangeEnd === 1 ? (
                        <div className={styles.remainDays}>
                          <span className={styles.day}>
                            {formatMessage({
                              id: 'app.text.uexam.examination.arrange.taskinfo.lastday',
                              defaultMessage: '今日截止编排',
                            })}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.remainDays}>
                          <span className={styles.subTit}>
                            {formatMessage({
                              id: 'app.text.uexam.exam.inspect.arrange.remain.day',
                              defaultMessage: '编排剩余时间',
                            })}
                            ：
                          </span>
                          <span className={styles.day}>
                            {arrangeEnd}
                            {formatMessage({ id: 'app.teacher.home.day', defaultMessage: '天' })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <IconButton
                    text={formatMessage({
                      id: 'app.button.app.button.uexam.exam.inpect.enroll',
                      defaultMessage: '考场编排',
                    })}
                    className={styles.btnYellow}
                    onClick={() => this.handleEnrollClick(item.id)}
                  />
                </>
              )}

            {/* 【监考安排】 //! update 2019-9-19 16:46:30  取消超时限制 */}
            {/* TS_3 and invigilate_type=UIT_1 and campus.Invigilate_status=N */}
            {item.status === 'TS_3' &&
              item.invigilateType === 'UIT_1' &&
              campus &&
              campus.invigilateStatus === 'N' && (
                <>
                  {invigilateEnd > 0 && (
                    <>
                      {invigilateEnd === 1 ? (
                        <div className={styles.remainDays}>
                          <span className={styles.day}>
                            {formatMessage({
                              id: 'app.text.uexam.examination.invigilation.taskinfo.lastday',
                              defaultMessage: '今日截止安排',
                            })}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.remainDays}>
                          <span className={styles.subTit}>
                            {formatMessage({
                              id: 'app.text.uexam.exam.inspect.enroll.remain.day',
                              defaultMessage: '安排剩余时间',
                            })}
                            ：
                          </span>
                          <span className={styles.day}>
                            {invigilateEnd}
                            {formatMessage({ id: 'app.teacher.home.day', defaultMessage: '天' })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <IconButton
                    text={formatMessage({
                      id: 'app.button.app.button.uexam.exam.inpect.invigilate',
                      defaultMessage: '监考安排',
                    })}
                    className={styles.btnYellow}
                    onClick={() => this.handleInvigilateClick(item.id)}
                  />
                </>
              )}

            {/* 查看监考安排 */}
            {/* TS_3 and invigilate_type= UIT_1 and campus. Invigilate_status=N */}
            {campus &&
              // (item.status === 'TS_3' && invigilateEnd < 0) || //! bug VB-8091
              ((item.status === 'TS_3' &&
                item.invigilateType === 'UIT_1' &&
                campus.invigilateStatus === 'Y') ||
                item.status === 'TS_4' ||
                item.status === 'TS_5') && (
                <IconButton
                  text={formatMessage({
                    id: 'app.button.app.button.uexam.exam.inpect.showinvigilate',
                    defaultMessage: '查看监考安排',
                  })}
                  className={styles.btnGreen}
                  onClick={() => this.handleShowInvigilateClick(item.id)}
                />
              )}

            {/* 查看编排 */}
            {/* TS_2 and arrange_type= UAT_1 and  campus.arrange _status =Y */}
            {/* TS_3 and invigilate_type= UIT_1 and campus. Invigilate_status=N */}
            {/* TS_3 and invigilate_type= UIT_1 and campus. Invigilate_status=Y */}
            {campus &&
              ((item.status === 'TS_2' &&
                item.arrangeType === 'UAT_1' &&
                campus.arrangeStatus === 'Y') ||
                (item.status === 'TS_3' && item.invigilateType === 'UIT_1') ||
                item.status === 'TS_4' ||
                item.status === 'TS_5') && (
                <IconButton
                  text={formatMessage({
                    id: 'app.button.app.button.uexam.exam.inpect.showArrange',
                    defaultMessage: '查看编排',
                  })}
                  className={styles.btnGreen}
                  onClick={() => this.handleShowEnrollClick(item.id)}
                />
              )}

            {/* 【查看报名】 //! TODO VB-7791 移除条件：item.enrollType === 'UET_2' */}
            {/* TS_1 and enroll_type= UET_1 and campus.enroll_status=Y */}
            {/* TS_2 and arrange_type= UAT_1 and  campus.arrange _status =N */}
            {/* TS_2 and arrange_type= UAT_2 */}
            {((campus &&
              ((item.status === 'TS_1' && campus.enrollStatus === 'Y') ||
                (item.status === 'TS_2' && campus.arrangeStatus === 'N'))) ||
              (item.status === 'TS_2' && item.arrangeType === 'UAT_2')) && (
              //! bug VB-8128
              // || (item.status === 'TS_2' && item.arrangeType === 'UAT_1' && campus.arrangeStatus === 'N')
              // || (item.status === 'TS_2' && item.arrangeType === 'UAT_2')

              // || (campus.arrangeStatus === 'N' && item.arrangeType === 'UAT_1' && arrangeEnd < 0)
              <IconButton
                text={formatMessage({
                  id: 'app.button.app.button.uexam.exam.inpect.sign.up.show',
                  defaultMessage: '查看报名',
                })}
                className={styles.btnGreen}
                onClick={() => this.handleShowSignUpClick(item.id)}
              />
            )}

            {/* 任课老师 本班分析报告 */}
            {showClassReport && (
              <IconButton
                iconName="icon-statistics"
                text={formatMessage({
                  id: 'app.button.examination.inspect.task.btn.classreport.title',
                  defaultMessage: '本班分析报告',
                })}
                className={styles.reportBtn}
                onClick={() => this.handleReportClick(item.id, item.classIds)}
              />
            )}

            {/* 学科管理员 分析报告 */}
            {showCampusReport && (
              <IconButton
                iconName="icon-statistics"
                text={formatMessage({
                  id: 'app.examination.inspect.task.btn.report.title',
                  defaultMessage: '分析报告',
                })}
                className={styles.reportBtn}
                onClick={() => this.handleReportClick(item.id)}
              />
            )}
            {/* 批次信息、考务信息 */}
            {(item.status === 'TS_6' ||
              item.status === 'TS_7' ||
              item.status === 'TS_8' ||
              item.status === 'TS_9') && (
              <>
                {item.isShowBatch && (
                  <IconButton
                    text={formatMessage({
                      id: 'app.button.app.button.uexam.exam.inpect.batchInfo',
                      defaultMessage: '批次信息',
                    })}
                    className={styles.btnGreen}
                    onClick={() => this.handleBatchInfoClick(item.id)}
                  />
                )}
                {item.isShowKaoWu && (
                  <IconButton
                    text={formatMessage({
                      id: 'app.button.app.button.uexam.exam.inpect.examInfo',
                      defaultMessage: '考务信息',
                    })}
                    className={styles.btnNormal}
                    onClick={() => this.handleExamInfoClick(item.id, item.isSubjectAdmin)}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default TaskItem;
