/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Avatar, Table, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import cs from 'classnames';
import styles from './index.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import TeacherAvatar from '@/assets/campus/avarta_teacher.png';
import Pagination from '@/components/Pagination/index';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/index';
import { timestampToDateMD } from '@/utils/utils';
import { showTime } from '@/utils/timeHandle';

const messages = defineMessages({
  backBtnTit: { id: 'app.examination.inspect.task.detail.back.btn.title', defaultMessage: '返回' },
  setting: {
    id: 'app.examination.inspect.task.detail.exam.setting.title',
    defaultMessage: '考试设置',
  },
  teacher: {
    id: 'app.examination.inspect.task.detail.exam.teacher.title',
    defaultMessage: '代课教师',
  },
  examClass: {
    id: 'app.examination.inspect.task.detail.exam.class.title',
    defaultMessage: '考试班级',
  },
  exerciseStu: {
    id: 'app.examination.inspect.task.detail.exercise.student.title',
    defaultMessage: '训练学生',
  },
  examPaper: {
    id: 'app.examination.inspect.task.detail.exam.paper.title',
    defaultMessage: '考试试卷',
  },
  exercisePaper: {
    id: 'app.examination.inspect.task.detail.exercise.paper.title',
    defaultMessage: '已选练习卷',
  },
  distModeTit: {
    id: 'app.examination.inspect.task.detail.dist.mode.title',
    defaultMessage: '分发试卷方式：',
  },
  examStrategy: {
    id: 'app.examination.inspect.task.detail.exam.strategy.title',
    defaultMessage: '考试策略：',
  },
  manualRectification: {
    id: 'app.examination.inspect.task.detail.manual.rectification.title',
    defaultMessage: '人工纠偏：',
  },
  checkBtnTit: {
    id: 'app.examination.inspect.task.detail.check.btn.title',
    defaultMessage: '查看参加考试学生',
  },
  checkBtnTit1: {
    id: 'app.examination.inspect.task.detail.check.btn.title1',
    defaultMessage: '收起',
  },
  grade: { id: 'app.grade', defaultMessage: '年级' },
  range: { id: 'app.examination.inspect.task.detail.paper.range', defaultMessage: '适用范围' },
  time: { id: 'app.examination.inspect.task.detail.time', defaultMessage: '时长' },
  fullmark: { id: 'app.examination.inspect.task.detail.full.mark', defaultMessage: '总分' },
  paperTemplate: {
    id: 'app.examination.inspect.task.detail.paper.template',
    defaultMessage: '试卷结构',
  },
  studentCode: { id: 'app.examination.inspect.task.detail.student.code', defaultMessage: '考号' },
  classNum: { id: 'app.examination.inspect.task.detail.class.number', defaultMessage: '班序' },
  classInCode: {
    id: 'app.examination.inspect.task.detail.class.in.code',
    defaultMessage: '班内学号',
  },
  name: { id: 'app.examination.inspect.task.detail.student.name', defaultMessage: '姓名' },
  gender: { id: 'app.examination.inspect.task.detail.student.gender', defaultMessage: '性别' },
  className: { id: 'app.examination.inspect.task.detail.class.name', defaultMessage: '班级' },
  borrowing: {
    id: 'app.examination.inspect.task.detail.student.borrowing',
    defaultMessage: '借读状态',
  },
  borrowingStatus: {
    id: 'app.examination.inspect.task.detail.student.borrowing.status',
    defaultMessage: '借读',
  },
  examPersonNum: {
    id: 'app.examination.inspect.task.detail.student.exam.number',
    defaultMessage: '应考人数',
  },
  preview: { id: 'app.examination.inspect.task.detail.preview', defaultMessage: '预览' },
  minute: { id: 'app.examination.inspect.paper.minute', defaultMessage: '分钟' },
  mark: { id: 'app.examination.inspect.paper.mark', defaultMessage: '分' },
  join: { id: 'app.examination.inspect.student.join.exam', defaultMessage: '参加' },
  noJoin: { id: 'app.examination.inspect.student.no.join.exam', defaultMessage: '不参加' },
  noData: { id: 'app.examination.inspect.exam.no.data', defaultMessage: '无' },
  exerciseTypeTit: {
    id: 'app.examination.inspect.exam.exercise.type.title',
    defaultMessage: '训练模式',
  },
  exercisePublishDateTit: {
    id: 'app.examination.inspect.exam.exercise.publish.date.title',
    defaultMessage: '发布时间',
  },
  exerciseEndDateTit: {
    id: 'app.examination.inspect.exam.exercise.end.date.title',
    defaultMessage: '截止日期',
  },
});

@connect(({ inspect, release, file }) => ({
  examStudents: inspect.examStudents,
  currentPaperDetail: release.currentPaperDetail,
  showData: release.showData,
  currentAvartar: file.userImgPath,
}))

/**
 *  type: public(发布)、inspect(检查)
 *
 * @author tina.zhang
 * @date 2019-04-18
 * @class ExamTaskDetail
 * @extends {Component}
 */
class ExamTaskDetail extends Component {
  // 非课后训练模式下
  columns1 = [
    {
      title: (
        <span className={styles.studentCode}>
          {formatMessage(messages.studentCode)}
          <Tooltip
            title={`${formatMessage(messages.classNum)}+${formatMessage(messages.classInCode)}`}
          >
            <i className="iconfont icon-info" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'examNo',
      key: 'examNo',
      width: '17%',
    },
    {
      title: formatMessage(messages.name),
      dataIndex: 'studentName',
      key: 'studentName',
      width: '17%',
    },
    // {
    //   title: formatMessage(messages.gender),
    //   dataIndex: 'genderValue',
    //   key: 'genderValue',
    //   width: '17%',
    // },
    {
      title: formatMessage(messages.className),
      dataIndex: 'className',
      key: 'className',
      width: '17%',
    },
    {
      title: formatMessage(messages.borrowing),
      dataIndex: 'isTransient',
      key: 'isTransient',
      width: '17%',
      render: text => <span>{text === 'Y' ? formatMessage(messages.borrowingStatus) : ''}</span>,
    },
    {
      title: '',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: text => (
        <span>{text === 'Y' ? formatMessage(messages.join) : formatMessage(messages.noJoin)}</span>
      ),
    },
  ];

  // 课后训练模式下
  columns2 = [
    {
      title: formatMessage({
        id: 'app.title.exam.inpsect.detail.student.class.code',
        defaultMessage: '学号',
      }),
      dataIndex: 'studentClassCode',
      key: 'studentClassCode',
      width: '17%',
    },
    {
      title: formatMessage(messages.name),
      dataIndex: 'studentName',
      key: 'studentName',
      width: '17%',
    },
    // {
    //   title: formatMessage(messages.gender),
    //   dataIndex: 'genderValue',
    //   key: 'genderValue',
    //   width: '17%',
    // },
    {
      title: formatMessage(messages.className),
      dataIndex: 'className',
      key: 'className',
      width: '17%',
    },
    {
      title: formatMessage(messages.borrowing),
      dataIndex: 'isTransient',
      key: 'isTransient',
      width: '17%',
      render: text => <span>{text === 'Y' ? formatMessage(messages.borrowingStatus) : ''}</span>,
    },
    {
      title: '',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: text => (
        <span>{text === 'Y' ? formatMessage(messages.join) : formatMessage(messages.noJoin)}</span>
      ),
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      collapse: props.data.type !== 'TT_5',
      total: 0,
      pageIndex: 1,
      studentsList: [], // 参考学生
      pageSize: 20, // 每页条数
      showPaper: false,
      columns: props.data.type === 'TT_5' ? this.columns2 : this.columns1,
      // columns:this.columns1
    };
  }

  componentWillMount() {
    const { type, dispatch, data } = this.props;
    const { pageSize } = this.state;
    const { taskId } = data;
    if (type === 'inspect') {
      const params = {
        taskId,
      };
      dispatch({
        type: 'inspect/examStudents',
        payload: params,
        callback: list => {
          const num = list.length;
          let showData;
          if (num > pageSize) {
            showData = list.slice(0, pageSize);
          } else {
            showData = list;
          }
          this.setState({
            studentsList: showData,
            total: num,
          });
        },
      });
      /*
          获取头像分两步：
          1.根据teacherId获取accountId
          2.根据accountId获取头像
        */
      if (data.teacher) {
        // 1. 根据teacherId获取accountId
        const paramsA = {
          userId: data.teacher.teacherId,
          identityId: 'ID_TEACHER',
        };
        dispatch({
          type: 'file/getAccountId',
          payload: paramsA,
          callback: dataA => {
            // 2.根据accountId获取头像
            const params1 = {
              fileId: dataA.accountId,
            };
            dispatch({
              type: 'file/avatar',
              payload: params1,
            });
          },
        });
      }
    }
  }

  clickBack = () => {
    const { parentProps } = this.props;
    const { history } = parentProps;
    history.goBack();
  };

  // 查看学生
  checkStudent = () => {
    const { collapse } = this.state;
    this.setState({
      collapse: !collapse,
    });
  };

  onPageChange = e => {
    const { examStudents } = this.props;
    const { pageSize } = this.state;
    const endIdx = e * pageSize;
    const startIdx = (e - 1) * pageSize;
    const list = examStudents.slice(startIdx, endIdx);
    this.setState({
      pageIndex: e,
      studentsList: list,
    });
  };

  // 试卷预览
  previewPaper = item => {
    const { dispatch } = this.props;

    const params = {
      paperId: item.paperId,
    };
    if (item.paperType === 'CUSTOM_PAPER') {
      dispatch({
        type: 'release/fetchCustomPaperDetail',
        payload: { id: item.paperId },
      }).then(() => {
        this.setState({
          showPaper: true,
        });
      });
    } else {
      dispatch({
        type: 'release/fetchPaperDetail',
        payload: params,
      }).then(() => {
        this.setState({
          showPaper: true,
        });
      });
    }
  };

  render() {
    const { collapse, studentsList, pageIndex, total, pageSize, showPaper, columns } = this.state;
    const { type, data, showData, currentPaperDetail, currentAvartar } = this.props;
    const str =
      data && data.examStatusValue ? data.examStatusValue : formatMessage(messages.noData);
    const strArr = str.split('/');
    const showExamStatusValue = strArr.reduce((prev, curr) => {
      const prevs = `${prev} | ${curr}`;
      return prevs;
    });
    return (
      <PageHeaderWrapper wrapperClassName="wrapperMain">
        <div className={styles.detailCont}>
          {/* 标题 */}
          <div className={styles.title}>
            {data.name}
            <div className={styles.backBtn} onClick={this.clickBack}>
              <i className="iconfont icon-link-arrow-left" />
              <span>{formatMessage(messages.backBtnTit)}</span>
            </div>
          </div>

          {/* 课后训练 - 发布时间、截止时间、训练模式 */}
          {data.type === 'TT_5' && (
            <div className={styles.affterExerTop}>
              <div className={styles.topItem}>
                <div className={styles.topItemTit}>
                  {formatMessage(messages.exercisePublishDateTit)}
                </div>
                <div className={styles.topItemCont}>
                  {timestampToDateMD(data.exerciseBeginTime)}
                </div>
              </div>
              <div className={styles.topItem}>
                <div className={styles.topItemTit}>
                  {formatMessage(messages.exerciseEndDateTit)}
                </div>
                <div className={styles.topItemCont}>{timestampToDateMD(data.exerciseEndTime)}</div>
              </div>
              <div className={styles.topItem}>
                <div className={styles.topItemTit}>{formatMessage(messages.exerciseTypeTit)}</div>
                <div className={styles.topItemCont}>{data.exerciseTypeValue}</div>
              </div>
            </div>
          )}

          {/* 课后训练 -- 已选练习试卷 */}
          {data.type === 'TT_5' && (
            <div className={styles.item}>
              <div className={styles.itemTit}>{formatMessage(messages.exercisePaper)}</div>
              <div className={styles.itemContent}>
                {data.paperList.map(item => {
                  return (
                    <div className={styles.paper}>
                      <div className={cs(styles.left, styles.setTit)}>
                        {item.name}
                        {/* {type === 'inspect' &&
                              <span className={styles.preview} onClick={()=>this.previewPaper(item.paperId)}>
                                <i className="iconfont icon-eye" />
                                <span style={{paddingLeft:'6px'}}>{formatMessage(messages.preview)}</span>
                              </span>
                              } */}
                      </div>
                      <div className={styles.right}>
                        <div className={styles.rightItem}>
                          <span className={styles.setTit}>
                            {formatMessage(messages.fullmark)}：
                          </span>
                          <span className={styles.setCont}>
                            {`${item.fullMark}${formatMessage(messages.mark)}`}
                          </span>
                        </div>
                        <div className={styles.rightItem}>
                          <span className={styles.setTit}>{formatMessage(messages.time)}：</span>
                          <span className={styles.setCont}>{showTime(item.paperTime, 's')}</span>
                        </div>
                        <div className={styles.rightItem}>
                          <span className={styles.setTit}>{formatMessage(messages.range)}：</span>
                          <span className={styles.setCont}>{item.scopeName}</span>
                        </div>
                        <div>
                          <span className={styles.setTit}>
                            {formatMessage(messages.paperTemplate)}：
                          </span>
                          <span className={styles.setCont}>{item.templateName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 考试设置---- 练习模式、课后训练 下不显示 */}
          {data.type !== 'TT_2' && data.type !== 'TT_5' && (
            <div className={styles.item}>
              <div className={styles.itemTit}>{formatMessage(messages.setting)}</div>
              <div className={cs(styles.itemContent, styles.examSetting)}>
                <div className={styles.settingItem}>
                  <span className={styles.setTit}>{formatMessage(messages.distModeTit)}</span>
                  <span className={styles.setCont}>{data.distributeValue}</span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.setTit}>{formatMessage(messages.examStrategy)}</span>
                  <span className={styles.setCont}>{showExamStatusValue}</span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.setTit}>
                    {formatMessage(messages.manualRectification)}
                  </span>
                  <span className={styles.setCont}>
                    {data.rectifyType === 'CURRENT_TEACHER' ? data.teacherName : data.rectifyValue}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 代课老师 */}
          {data.teacher && (
            <div className={styles.item}>
              <div className={styles.itemTit}>{formatMessage(messages.teacher)}</div>
              <div className={cs(styles.itemContent, styles.examSetting)}>
                <Avatar src={currentAvartar || TeacherAvatar} />
                <span style={{ paddingLeft: '4px' }}>
                  {data.teacher && data.teacher.teacherName ? data.teacher.teacherName : ''}
                </span>
              </div>
            </div>
          )}

          {/* 考试班级 */}
          <div className={styles.item}>
            <div className={styles.itemTit}>
              {data.type === 'TT_5'
                ? formatMessage(messages.exerciseStu)
                : data.type === 'TT_2'
                ? formatMessage({
                    id: 'app.title.online.exam.practice.class',
                    defaultMessage: '练习班级',
                  })
                : formatMessage(messages.examClass)}
            </div>
            <div className={cs(styles.itemContent, styles.examClass)}>
              <div className={styles.classList}>
                {data.classList.map(it => {
                  return (
                    <span style={{ paddingRight: '20px' }} key={it.classId}>
                      {it.className}
                    </span>
                  );
                })}
              </div>
              <div className={styles.checkStudent}>
                {data.type !== 'TT_5' && (
                  <div className={styles.checkBtn} onClick={this.checkStudent}>
                    {collapse
                      ? formatMessage(messages.checkBtnTit)
                      : formatMessage(messages.checkBtnTit1)}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 考试学生 */}
          {collapse ? null : (
            <div className={styles.studentTable}>
              <div style={{ border: '1px solid #e8e8e8', borderBottom: 'none' }}>
                <Table columns={columns} dataSource={studentsList} pagination={false} />
              </div>

              <div className={styles.bottom}>
                <div>
                  <span className={styles.setTit}>
                    {data.type === 'TT_5'
                      ? formatMessage({
                          id: 'app.title.exam.inspect.assigned.number',
                          defaultMessage: '布置人数',
                        })
                      : formatMessage(messages.examPersonNum)}
                    ：
                  </span>
                  <span className={styles.setCont}>{data.studentNum}</span>
                </div>
                <div>
                  <Pagination
                    current={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    onChange={this.onPageChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 考试试卷 */}
          {data.type !== 'TT_5' && (
            <div className={styles.item}>
              <div className={styles.itemTit}>
                {data.type === 'TT_2'
                  ? formatMessage({
                      id: 'app.title.online.exam.practice.paper',
                      defaultMessage: '练习试卷',
                    })
                  : formatMessage(messages.examPaper)}
              </div>
              <div className={styles.itemContent}>
                {data.paperList.map(item => {
                  return (
                    <div className={styles.paper}>
                      <div className={cs(styles.left, styles.setTit)}>
                        {item.name}
                        {type === 'inspect' && (
                          <span className={styles.preview} onClick={() => this.previewPaper(item)}>
                            <i className="iconfont icon-eye" />
                            <span style={{ paddingLeft: '6px' }}>
                              {formatMessage(messages.preview)}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className={styles.right}>
                        <div className={styles.rightItem}>
                          <span className={styles.setTit}>
                            {formatMessage(messages.fullmark)}：
                          </span>
                          <span className={styles.setCont}>
                            {`${item.fullMark}${formatMessage(messages.mark)}`}
                          </span>
                        </div>
                        <div className={styles.rightItem}>
                          <span className={styles.setTit}>{formatMessage(messages.time)}：</span>
                          <span className={styles.setCont}>{showTime(item.paperTime, 's')}</span>
                        </div>
                        <div className={styles.rightItem}>
                          <span className={styles.setTit}>{formatMessage(messages.range)}：</span>
                          <span className={styles.setCont}>{item.scopeName}</span>
                        </div>
                        <div>
                          <span className={styles.setTit}>
                            {formatMessage(messages.paperTemplate)}：
                          </span>
                          <span className={styles.setCont}>{item.templateName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {showPaper && (
          <ExampaperPreview
            dataSource={{
              showData,
              paperData: currentPaperDetail,
              displayMode: 'paper_preview',
            }}
            onClose={() => {
              this.setState({
                showPaper: false,
              });
            }}
          />
        )}
      </PageHeaderWrapper>
    );
  }
}

export default ExamTaskDetail;
