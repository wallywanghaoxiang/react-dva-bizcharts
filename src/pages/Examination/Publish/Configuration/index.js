/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import cs from 'classnames';
import router from 'umi/router';
import styles from './style.less';
import ClassSelect from './ClassSelect';
import TestSet from './TestSet';
import SubstituteTeacher from './SubstituteTeacher';
import StepBottom from '../components/StepBottom';
import { showTime } from '@/utils/timeHandle';
import { MatchUnitType } from '@/frontlib/utils/utils';

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
  examPaper: {
    id: 'app.examination.inspect.task.detail.exam.paper.title',
    defaultMessage: '考试试卷',
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
  grade: { id: 'app.grade', defaultMessage: '适用范围' },
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
    defaultMessage: '是否借读',
  },
  examPersonNum: {
    id: 'app.examination.inspect.task.detail.student.exam.number',
    defaultMessage: '应考人数',
  },
  preview: { id: 'app.examination.inspect.task.detail.preview', defaultMessage: '预览' },
  minute: { id: 'app.examination.inspect.paper.minute', defaultMessage: '分钟' },
  mark: { id: 'app.examination.inspect.paper.mark', defaultMessage: '分' },
});

class Step extends React.PureComponent {
  state = {
    taskName: '',
    distributeType: '',
    examType: '',
    showEdit: '1',
    clickFlug: false,
    title: '',
    isLoad: false,
    isSaving: false, // 是否正在发布
  };

  componentDidMount() {
    const { dispatch, match } = this.props;
    const { taskType } = match.params;
    const self = this;
    const falg = localStorage.getItem('publishReload');
    if (falg) {
      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'TASK_TYPE' },
      }).then(e => {
        self.state.isLoad = true;
        for (const i in e) {
          if (e[i].code === taskType) {
            self.setState({ title: e[i].value });
          }
        }
      });
    } else {
      window.ClassSelectCard = '0';
      window.gradeIndex = '0';
      dispatch({
        type: 'release/fetchClass',
        payload: {
          status: taskType === 'TT_3' ? 'Y' : 'N',
          teacherId: localStorage.getItem('teacherId'),
        },
      }).then(() => {
        self.state.isLoad = true;
        dispatch({
          type: 'release/changeTaskType',
          taskType,
        });
        dispatch({
          type: 'dict/getDictionariesData',
          payload: { type: 'TASK_TYPE' },
        }).then(e => {
          for (const i in e) {
            if (e[i].code === taskType) {
              self.setState({ title: e[i].value });
            }
          }
        });
      });
    }
    localStorage.removeItem('publishReload');
  }

  // 保存设置
  setStrate = ids => {
    this.setState({
      examType: ids,
    });
  };

  setDistd = id => {
    this.setState({
      distributeType: id,
    });
  };

  handleNameInput = e => {
    this.setState({
      taskName: e.target.value,
      showEdit: '1',
    });
  };

  InputFocus = () => {
    this.setState({
      showEdit: '0',
    });
  };

  // 整合选择班级的数据
  filterData() {
    const { classList, dispatch } = this.props;
    let arrList = [];
    if (window.ClassSelectCard === '2') {
      arrList = classList.learningGroup;
    } else if (window.ClassSelectCard === '1') {
      arrList = classList.teachingClass;
    } else if (window.ClassSelectCard === '0') {
      arrList = classList.naturalClass;
    }

    const selectedClass = [];
    const selectedGroup = [];
    let gradeIndex = '';
    let gradeValue = '';
    for (const i in arrList) {
      if (arrList[i].isChoosed) {
        gradeIndex = arrList[i].grade;
        gradeValue = arrList[i].gradeValue;
        for (const n in arrList[i].classList) {
          if (arrList[i].classList[n].isChoosed) {
            selectedClass.push(arrList[i].classList[n]);
          }
        }
      }
    }

    if (window.ClassSelectCard === '2' && selectedClass && selectedClass.length >= 1) {
      for (const j in selectedClass) {
        for (const i in selectedClass[j].learningGroupList) {
          if (selectedClass[j].learningGroupList[i].isChoosed) {
            selectedGroup.push(selectedClass[j].learningGroupList[i]);
          }
        }
      }
    }

    const params = {
      type: 'release/saveSelectedClass',
      payload: {
        selectedClass: window.ClassSelectCard === '2' ? selectedGroup : selectedClass,
        gradeIndex,
        gradeValue,
      },
    };

    dispatch(params);
  }

  render() {
    const { taskType, classList, mystudentListNum, fetchClassing, paperList } = this.props;

    const { isLoad } = this.state;
    if (taskType) {
      return (
        <div className="releaseStep">
          <Spin delay={500} spinning={fetchClassing}>
            {/* {this.renderTop(taskType)} */}
            <div className={styles.item}>
              <div className={styles.itemTit} style={{ color: '#333', fontSize: '14px' }}>
                {taskType !== 'TT_2'
                  ? formatMessage({
                      id: 'app.examination.inspect.task.detail.exam.paper.title',
                      defaultMessage: '考试试卷',
                    })
                  : formatMessage({ id: 'app.text.excrisepaper', defaultMessage: '训练试卷' })}
              </div>
              <div className={styles.itemContent} style={{ height: 'auto' }}>
                {paperList &&
                  paperList.map(item => {
                    return (
                      <div className={styles.paper}>
                        <div className={cs(styles.left, styles.setTit)} style={{ color: '#333' }}>
                          {item.name}
                        </div>
                        <div className={styles.right}>
                          <div className={styles.rightItem}>
                            <span className={styles.setTit}>
                              {formatMessage(messages.fullmark)}：
                            </span>
                            <span className={styles.setCont}>{`${item.fullMark}${formatMessage(
                              messages.mark
                            )}`}</span>
                          </div>
                          <div className={styles.rightItem}>
                            <span className={styles.setTit}>{formatMessage(messages.time)}：</span>
                            <span className={styles.setCont}>{showTime(item.paperTime, 's')}</span>
                          </div>
                          <div className={styles.rightItem}>
                            <span className={styles.setTit}>{formatMessage(messages.grade)}：</span>
                            <span className={styles.setCont}>{MatchUnitType(item)}</span>
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

            {/* 考试设置 */}
            {taskType !== 'TT_2' && isLoad && (
              <TestSet setStrate={ids => this.setStrate(ids)} setDistd={id => this.setDistd(id)} />
            )}
            {/* 代课教师 */}
            <SubstituteTeacher />

            {/* 班级选择 */}
            {isLoad && (
              <ClassSelect
                classList={classList}
                taskType={taskType}
                ClassactiveKey={window.ClassSelectCard || '0'}
              />
            )}

            <StepBottom
              prevText={formatMessage({
                id: 'app.button.exam.publis.last.step',
                defaultMessage: '上一步',
              })}
              nextText={formatMessage({
                id: 'app.button.exam.publish.task.title',
                defaultMessage: '发布任务',
              })}
              prev={() => {
                localStorage.setItem('publishReload', 'true');
                router.push(`/examination/publish/selectpaper/${taskType}`);
              }}
              disabled={mystudentListNum === 0}
              next={() => {
                if (this.state.isSaving) {
                  return;
                }
                this.state.isSaving = true;
                this.filterData();
                const { dispatch } = this.props;
                dispatch({
                  type: 'release/savePublishTaskData',
                }).then(() => {
                  const { publishSaveData } = this.props;
                  dispatch({
                    type: 'release/fetchSaveTask',
                    payload: publishSaveData,
                  }).then(e => {
                    const { responseCode, data } = e;
                    if (responseCode !== '200' || data == null) {
                      return;
                    }
                    router.push(`/examination/inspect`);
                  });
                });

                setTimeout(() => {
                  this.setState({ isSaving: false });
                }, 1000);
              }}
            />
          </Spin>
        </div>
      );
    }
    return null;
  }
}

export default connect(({ dict, release, loading }) => ({
  taskType: release.taskType,
  classList: release.classList,
  choosedNum: release.choosedNum,
  mystudentListNum: release.mystudentListNum,
  paperList: release.paperSelected,
  publishSaveData: release.publishSaveData,
  release,
  dict,
  fetchClassing: loading.effects['release/fetchClass'] || false,
  fetchSaveTasking: loading.effects['release/fetchSaveTask'] || false,
}))(Step);
