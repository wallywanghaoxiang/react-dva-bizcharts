
import React, { Component } from 'react';
import { Divider, Avatar, message, Popover } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import cs from 'classnames';
import router from 'umi/router';
import IconButton from '@/frontlib/components/IconButton';
import styles from './index.less';
import TeacherAvatar from '@/assets/campus/avarta_teacher.png';
import { timestampToTime } from '@/utils/utils';


const messages = defineMessages({
  deleteBtnTit: { id: 'app.examination.inspect.task.btn.delete.title', defaultMessage: '删除' },
  detailBtnTit: { id: 'app.examination.inspect.task.btn.detail.title', defaultMessage: '详情' },
  resultBtnTit: { id: 'app.examination.inspect.task.btn.result.title', defaultMessage: '评分结果' },
  reportBtnTit: { id: 'app.examination.inspect.task.btn.report.title', defaultMessage: '分析报告' },
  checkTit: { id: 'app.examination.inspect.task.btn.check.title', defaultMessage: '完成情况' },
  classTit: { id: 'app.examination.inspect.task.class.title', defaultMessage: '班级/组：' },
  paperTit: { id: 'app.examination.inspect.task.paper.title', defaultMessage: '试卷：' },
  examNum: { id: 'app.examination.inspect.task.exam.person.number', defaultMessage: '实考/应考：' },
  finishProgress: { id: 'app.examination.inspect.task.exam.finish.progress', defaultMessage: '完成进度：' },
  teacherTit: { id: 'app.examination.inspect.task.teacher.title', defaultMessage: '代课教师：' },
  endDateTit: { id: 'app.examination.inspect.task.execise.end.date.title', defaultMessage: '截止日期：' },
  person: { id: 'app.examination.inspect.task.unit.person', defaultMessage: '人' },
  unStart: { id: 'app.examination.inspect.task.status.ts_1', defaultMessage: '未开始' },
  inputNamePlaceholder: { id: 'app.examination.inspect.task.name.placeholder', defaultMessage: "请输入任务名称" },
  inputNameTip: { id: 'app.examination.inspect.task.name.tip', defaultMessage: "请输入任务名称！" },
  abnormalTip: { id: 'app.examination.inspect.task.abnormal.tip', defaultMessage: "未收到有效答卷" },
  tag1: { id: 'app.examination.inspect.task.execise.mode1.title', defaultMessage: "考" },
  tag2: { id: 'app.examination.inspect.task.execise.mode2.title', defaultMessage: "练" },
})
class TaskItem extends Component {
  state = {
    editing: false
  }

  componentDidMount() {
  }

  // 编辑按钮
  editTaskName = () => {
    this.setState({
      editing: true
    })
  }

  // 任务名称input
  inputBlur = (e) => {
    const { onEditTaskName } = this.props;
    const { value } = e.target;
    if (value && value.length < 31) {
      onEditTaskName(value);
      this.setState({
        editing: false
      })
    } else if (!value) {
      const mgs = formatMessage(messages.inputNameTip);
      message.warning(mgs);
    }

  }

  // 删除按钮事件
  deleteTask = () => {
    const { onDeleteTask } = this.props;
    onDeleteTask();
  }

  // 评分结果
  handleResult = (id) => {
    const { scoreResult } = this.props;
    scoreResult(id);
    // router.push({ pathname: `/examination/inspect/report/${id}` });
  }

  // 分析报告
  handleReport = (id) => {
    router.push({ pathname: `/examination/inspect/report/${id}` });
  }

  // 检查
  handleCheck = (id) => {
    router.push({ pathname: `/examination/inspect/inspection/${id}` });
  }

  // 详情
  toDetail = (id) => {
    router.push({
      pathname: `/examination/inspect/detail/${id}`
    });
  }

  // 处理状态
  renderStatus = (status) => {
    let statusStyle;
    switch (status) {
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


  render() {
    const { editing } = this.state;
    const { item } = this.props;
    // 状态样式
    const statusStyle = this.renderStatus(item.status);

    const group = item.classList.find((tag) => tag.classIndex === null)
    const isGroup = group ? true : false

    // 班级显示
    // const classStruct = [];
    // item.classList.map((cl, i) => {
    //   if (cl) {
    //     if (i === item.classList.length - 1) {
    //       classStruct.push(<span key={cl.classId}>{cl.className}</span>)
    //     } else {
    //       classStruct.push(<span key={cl.classId}>{cl.className}</span>)
    //       classStruct.push(<Divider key={cl.classId} type="vertical" />)
    //     }
    //   }

    // })

    const popoverContent = (
      <div className={styles.popoverClassList}>
        {
          item.classList.map((cl) => {
            return (
              <div className={styles.classItem}>{cl.className}</div>
            )
          })
        }
      </div>
    )

    // console.log(item);
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
      <div className={styles.taskItem}>
        <div className={styles.top}>
          <div className={styles.left}>
            {editing ?
              <input className={styles.nameInput} placeholder={formatMessage(messages.inputNamePlaceholder)} maxLength={30} defaultValue={item.name} onBlur={this.inputBlur} /> :
              <span>
                {/* 任务名称 */}
                <span className={styles.taskTit}>{item.name}</span>
                {((item.status === 'TS_0' || item.status === 'TS_1') && item.teacherType !== 'TEACHER') && <i className="iconfont icon-edit" onClick={this.editTaskName} />}

                {/* 任务类型 */}
                <div className={cs(styles.tag, styles.type)}>{item.typeValue}</div>
                {/* 任务状态 */}
                <div className={cs(styles.tag, statusStyle)}>{item.statusValue}</div>

                {/* 课后训练模式 */}
                {
                  item.type === 'TT_5' &&
                  <div className={cs(styles.tag, statusStyle)} style={{ marginLeft: '10px' }}>{item.exerciseType === 'EXAM_MODEL' ? formatMessage(messages.tag1) : formatMessage(messages.tag2)}</div>
                }

                {/* 未收到有效答案tip */}
                {
                  item.status === 'TS_5' && item.effectiveAnswers === 0 &&
                  <div className={styles.unEffectiveTip}>
                    <i className="iconfont icon-warning" />
                    <span>{formatMessage(messages.abnormalTip)}</span>
                  </div>
                }
              </span>}
          </div>
          <div className={styles.btnGroup}>

            {/* 删除按钮 */}
            {((item.status === 'TS_0' || item.status === 'TS_1') && item.teacherType !== 'TEACHER') &&
              <IconButton
                iconName="icon-detele"
                text={formatMessage(messages.deleteBtnTit)}
                className={styles.delete}
                style={{ marginRight: '10px' }}
                onClick={this.deleteTask}
              />

            }

            {/* 评分结果按钮 */}
            {
              item.status === 'TS_4' && item.linkStatus === 'ES_17' && teacherTypeValue === 'MASTER' &&
              <IconButton
                iconName="icon-computer-ai"
                text={formatMessage(messages.resultBtnTit)}
                className={styles.result}
                style={{ marginRight: '10px' }}
                onClick={() => this.handleResult(item.taskId)}
              />
            }

            {/* 分析报告按钮 */}
            {
              item.status === 'TS_5' && item.linkStatus === 'ES_21' && item.teacherType !== 'SUB' &&
              <IconButton
                iconName="icon-statistics"
                text={formatMessage(messages.reportBtnTit)}
                className={styles.result}
                style={{ marginRight: '10px' }}
                onClick={() => this.handleReport(item.taskId)}
              />
            }

            {/* 课后训练-检查按钮 */}
            {
              item.type === 'TT_5' && item.isCheck &&
              <IconButton
                iconName="icon-file"
                text={formatMessage(messages.checkTit)}
                className={styles.check}
                style={{ marginRight: '10px' }}
                onClick={() => this.handleCheck(item.taskId)}
              />
            }

            {/* 详情按钮 */}
            <IconButton
              text={formatMessage(messages.detailBtnTit)}
              className={styles.detail}
              onClick={() => this.toDetail(item.taskId)}
            />
          </div>
        </div>
        {/* <div className={styles.middle}>
          <span className={styles.tit}>
            {
              (item.type === 'TT_1' || item.type === 'TT_2' || item.type === 'TT_3') &&
              <span>
                {formatMessage({ id: "app.title.uexam.examination.inspect.registration.result.className", defaultMessage: "班级" })}：
              </span>
            }
            {
              item.type === 'TT_5' &&
              <span>
                {formatMessage(messages.classTit)}
              </span>
            }
          </span>
          <Popover content={popoverContent} placement="bottom" overlayClassName={styles.classPopover}>
            <span className={styles.cont}>
              {item.classList.length}
              <i className="iconfont icon-link-arrow-down" />
            </span>
          </Popover>

        </div> */}
        <div className={styles.bottom}>
          <span className={styles.tit}>
            {
              (item.type === 'TT_1' || item.type === 'TT_2' || item.type === 'TT_3') &&
              <span>
                {formatMessage({ id: "app.title.uexam.examination.inspect.registration.result.className", defaultMessage: "班级" })}：
              </span>
            }
            {
              item.type === 'TT_5' &&
              <span>
                {
                    isGroup 
                    ? 
                    `${formatMessage({id:"app.text.menu.campus.groupName",defaultMessage:"分组"})}：`
                    :
                    `${formatMessage({id:"app.title.uexam.examination.inspect.registration.table.className",defaultMessage:"班级"})}：`
                }
              </span>
            }
          </span>
          <Popover content={popoverContent} placement="bottomLeft" overlayClassName={styles.classPopover}>
            <span className={styles.cont}>
              {item.classList.length}
              <i className="iconfont icon-link-arrow-down" />
            </span>
          </Popover>
          <Divider type="vertical" />
          <span className={styles.tit}>{formatMessage(messages.paperTit)}</span>
          <span className={styles.cont}>{item.paperList ? item.paperList.length : 0}</span>
          <Divider type="vertical" />
          <span className={styles.tit}>{item.type === 'TT_5' ? formatMessage(messages.finishProgress) : (item.type === 'TT_2' ? formatMessage({ id: "app.title.exam.inspect.exersice.number", defaultMessage: "实练/应练" }) : formatMessage(messages.examNum))}</span>
          <span className={styles.cont}>{`${item.examNum}/${item.studentNum}${formatMessage(messages.person)}`}</span>

          {
            item.teacher &&
            <span>
              <Divider type="vertical" />
              <span className={styles.tit}>{formatMessage(messages.teacherTit)}</span>
              <Avatar src={TeacherAvatar} />
              <span className={styles.cont} style={{ paddingLeft: '5px' }}>{item.teacher && item.teacher.teacherName ? item.teacher.teacherName : ''}</span>
            </span>
          }

          {/* 课后练习-截止日期 */}
          {
            item.type === 'TT_5' &&
            <span>
              <Divider type="vertical" />
              <span className={styles.tit}>{formatMessage(messages.endDateTit)}</span>
              <span className={styles.cont} style={{ paddingLeft: '5px' }}>{item.exerciseEndTime ? timestampToTime(item.exerciseEndTime) : ''}</span>
            </span>
          }

        </div>
      </div>
    );
  }
}
export default TaskItem;

