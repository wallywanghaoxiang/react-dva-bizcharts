/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unused-state */
/* eslint-disable guard-for-in */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-lonely-if */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { Radio, DatePicker, message } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import cs from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import emitter from '@/utils/ev';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ClassSelect from '../Configuration/ClassSelect';

import styles from './index.less';

import { MatchUnitType } from '@/frontlib/utils/utils';
import { showTime } from '@/utils/timeHandle';

const messages = defineMessages({
  examPaper: {
    id: 'app.examination.inspect.task.detail.exec.select.paper.title',
    defaultMessage: '已选试卷',
  },
  grade: { id: 'app.grade', defaultMessage: '适用范围' },
  time: { id: 'app.examination.inspect.task.detail.time', defaultMessage: '时长' },
  fullmark: { id: 'app.examination.inspect.task.detail.full.mark', defaultMessage: '总分' },
  paperTemplate: {
    id: 'app.examination.inspect.task.detail.paper.template',
    defaultMessage: '试卷结构',
  },
  minute: { id: 'app.examination.inspect.paper.minute', defaultMessage: '分钟' },
  mark: { id: 'app.examination.inspect.paper.mark', defaultMessage: '分' },
  inputNamePlaceholder: {
    id: 'app.examination.inspect.publish.task.name.placeholder',
    defaultMessage: '请输入任务名称',
  },
  inputNameTip: { id: 'app.examination.inspect.task.name.tip', defaultMessage: '请输入任务名称！' },
});

@connect(({ release, dict, loading }) => ({
  publishSaveData: release.publishSaveData,
  selectedClass: release.selectedClass,
  taskType: release.taskType,
  classList: release.classList,
  choosedNum: release.choosedNum,
  mystudentListNum: release.mystudentListNum,
  paperSelected: release.paperSelected,
  exerciseType: release.exerciseType, // 模式设置
  exerciseBeginType: release.exerciseBeginType, // 发布时间
  exerciseEndType: release.exerciseEndType, // 截止时间
  publishDate: release.publishDate,
  endDate: release.endDate,
  release,
  dict,
  submitTaskLoading: loading.effects['release/fetchSaveTask'] || false,
}))
class AffterClassTrain extends Component {
  state = {
    isLoad: false,
    editing: false,
    startValue: moment(),
    endValue: '',
    endTimeDict: [],
    beginTimeDict: [],
    exerciseTypeDict: [],
    starDate: `${moment().year()}-${moment().month() + 1}-${moment().date()}`,
    endDate: `${moment().year()}-${moment().month() + 1}-${moment().date()}`,
    endTime: '',
    startTime: '',
    startVisible: false,
    endVisible: false,
  };

  componentWillMount() {
    const { dispatch, taskType, publishSaveData } = this.props;

    // 清除原来选中的班级信息
    dispatch({
      type: 'release/saveSelectedClass',
      payload: {
        selectedClass: [],
        gradeIndex: '',
        gradeValue: formatMessage({
          id: 'app.examination.inspect.screen.unlimited',
          defaultMessage: '不限',
        }),
      },
    });

    dispatch({
      type: 'release/initexercise',
      payload: {
        exerciseBeginType: 'EBT_1', // TT_5模式下：
        exerciseEndType: 'EET_1', // TT_5模式下：
        exerciseType: 'EXAM_MODEL', // TT_5模式下： 练习模式
        publishDate: '', // 练习开始时间
        endDate: '', // 练习结束时间
      },
    });
    dispatch({
      type: 'release/saveChooseNum',
      payload: 0,
    });

    if (!publishSaveData.name) {
      router.push(`/examination/publish/step`);
    } else {
      // 获取班级列表
      const self = this;
      window.ClassSelectCard = '0';
      window.gradeIndex = '0';
      dispatch({
        type: 'release/fetchAffterClass',
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
      });

      // 获取字典
      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'EXERCISE_END_TIME' },
      }).then(data => {
        this.setState({
          endTimeDict: data,
        });
      });

      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'EXERCISE_BEGIN_TIME' },
      }).then(data => {
        this.setState({
          beginTimeDict: data,
        });
      });

      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'EXERCISE_TYPE' },
      }).then(data => {
        this.setState({
          exerciseTypeDict: data,
        });
      });

      this.eventEmitter = emitter.addListener('examUpdateClassInfo', () => {
        this.filterData();
      });
    }
  }

  componentWillUnmount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'release/clearAffterExeciseData',
    //   payload: {},
    // });
  }

  // 发布时间变更
  onPublishChange = e => {
    const { value } = e.target;
    const { dispatch } = this.props;

    dispatch({
      type: 'release/savePublishTimeType',
      payload: value,
    });
    if (value !== 'custom') {
      this.setState({
        startValue: moment(),
      });
    } else {
      this.setState({
        startValue: moment(),
        // starDate: moment().date(),
      });
      // console.log(this.defaultstartTime());
      // console.log(moment(this.defaultstartTime(), 'YYYY-MM-DD HH:mm:ss'));
      dispatch({
        type: 'release/savePublishDateStr',
        payload: this.defaultstartTime(),
      });
    }
  };

  onPublishDateChange = (value, str) => {
    console.log('===============onPublishDateChange=========');
    // if (!str.split(' ')[0]) {
    //   this.setState({
    //     startValue: value,
    //     starDate: `${moment().year()}-${moment().month() + 1}-${moment().date()}`,
    //   });
    // } else {

    this.setState(
      {
        startValue: value,
        starDate: str.split(' ')[0],
        // startTime: str.split(' ')[1],
      },
      () => {
        const { publishDate } = this.props;
        if (publishDate === '') {
          str = this.defaultstartTime();
        }

        // }
        if (value && (moment().hour() !== value.hour() || moment().minute() !== value.minute())) {
          this.setState({
            startTime: `${str.split(' ')[1].split(':')[0]}:${str.split(' ')[1].split(':')[1]}`,
          });
        }
        const { dispatch } = this.props;
        dispatch({
          type: 'release/savePublishDateStr',
          payload: str,
        });
      }
    );

    // setTimeout(() => {
    //   dispatch({
    //     type: 'release/saveEndDateStr',
    //     payload: this.defaultendTime(),
    //   });
    // }, 100);
  };

  onPublishDateOk = value => {
    console.log('onOk: ', value);
  };

  // 截止时间
  onEndTimeChange = e => {
    const { value } = e.target;
    const { dispatch } = this.props;
    dispatch({
      type: 'release/saveEndTimeType',
      payload: value,
    });
    if (value !== 'custom') {
      this.setState({
        endValue: '',
      });
    } else {
      const str = this.defaultendTime();
      console.log(str);
      this.setState({
        endValue: str,
        // starDate: moment().date(),
      });
      // console.log(this.defaultstartTime());
      // console.log(moment(this.defaultstartTime(), 'YYYY-MM-DD HH:mm:ss'));
      dispatch({
        type: 'release/saveEndDateStr',
        payload: str,
      });
    }
  };

  onEndDateChange = (value, str) => {
    // this.setState({
    //   endValue: value,
    // });

    this.setState(
      {
        endValue: value,
        endDate: str.split(' ')[0],
        // startTime: str.split(' ')[1],
      },
      () => {
        const { endDate } = this.props;
        if (endDate === '') {
          str = this.defaultendTime();
        }
        console.log('===================');
        if (value && (moment().hour() !== value.hour() || moment().minute() !== value.minute())) {
          this.setState({
            endTime: `${str.split(' ')[1].split(':')[0]}:${str.split(' ')[1].split(':')[1]}`,
          });
        }

        const { dispatch } = this.props;
        dispatch({
          type: 'release/saveEndDateStr',
          payload: str,
        });
      }
    );
  };

  onEndDateOk = value => {
    console.log('onOk: ', value);
  };

  // 模式
  onExerTypeChange = e => {
    const { value } = e.target;
    const { dispatch } = this.props;
    dispatch({
      type: 'release/saveExerciseType',
      payload: value,
    });
  };

  // 整合选择班级的数据
  filterData = () => {
    const { classList, dispatch } = this.props;
    let arrList = [];
    if (window.ClassSelectCard == '2') {
      arrList = classList.learningGroup;
    } else if (window.ClassSelectCard == '1') {
      arrList = classList.teachingClass;
    } else if (window.ClassSelectCard == '0') {
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

    if (window.ClassSelectCard == '2' && selectedClass && selectedClass.length >= 1) {
      for (const j in selectedClass) {
        for (const i in selectedClass[j].learningGroupList) {
          if (selectedClass[j].learningGroupList[i].isChoosed) {
            selectedGroup.push(selectedClass[j].learningGroupList[i]);
          }
        }
      }
    }

    // 保存班级
    dispatch({
      type: 'release/saveSelectedClass',
      payload: {
        selectedClass: window.ClassSelectCard === '2' ? selectedGroup : selectedClass,
        gradeIndex,
        gradeValue,
      },
    }).then(() => {
      dispatch({
        type: 'release/savePublishTaskData',
      });
    });

    localStorage.setItem('publishReload', 'false');
  };

  // 编辑
  editTaskName = () => {
    this.setState(
      {
        editing: true,
      },
      () => {
        this.nameInput.focus();
      }
    );
  };

  // 任务名称inputBlur
  inputBlur = e => {
    const { dispatch } = this.props;
    const { value } = e.target;
    if (value && value.length < 31) {
      dispatch({
        type: 'release/editTaskName',
        payload: {
          name: value,
        },
      }).then(() => {
        this.setState({
          editing: false,
        });
      });
    } else if (!value) {
      const mgs = formatMessage(messages.inputNameTip);
      message.warning(mgs);
      dispatch({
        type: 'release/editTaskName',
        payload: {
          name: value,
        },
      });
    }
  };

  range = (start, end) => {
    const result = [];
    for (let i = start; i <= end; i += 1) {
      result.push(i);
    }
    return result;
  };

  /**
   *默认发布时间
   *
   * @memberof AffterClassTrain
   */
  defaultstartTime = () => {
    let str = '';
    let momenthours = moment().hours(); // 0~23
    const momentminutes = moment().minutes(); // 0~59
    const { startValue, starDate, startTime } = this.state;
    if (!startValue || (startValue && startValue.date() === moment().date())) {
      if (startTime) {
        str = `${`${starDate} ${str}${startTime}`}:00`;
      } else if (momentminutes > 30 && momentminutes <= 59) {
        momenthours += 1;
        str = `${`${starDate} ${str}${momenthours}`}:00:00`;
      } else {
        str = `${`${starDate} ${str}${momenthours}`}:30:00`;
      }
    } else {
      if (startTime) {
        str = `${`${starDate} ${str}${startTime}`}:00`;
      } else {
        str = `${starDate} 19:00:00`;
      }
    }

    this.starDate = str;

    return str;
  };

  /**
   *默认截止时间
   *
   * @memberof AffterClassTrain
   */
  defaultendTime = () => {
    let str = '';
    const { publishDate } = this.props;
    const { endDate, exerciseEndType, endTime } = this.state;
    if (!publishDate || exerciseEndType === 'custom') {
      if (endTime && endDate) {
        str = `${`${endDate} ${str}${endTime}`}:00`;
      }
      // else if (endDate) {
      //   str = `${endDate} 19:00:00`;
      // }
      else {
        let defaultTime = this.defaultstartTime();
        if (defaultTime.split(' ')[0] === '') {
          defaultTime = `${moment().year()}-${moment().month() +
            1}-${moment().date()}${defaultTime}`;
        }
        const newTime = moment(defaultTime).add(2, 'h');
        str = `${newTime.year()}-${newTime.month() +
          1}-${newTime.date()} ${newTime.hours()}:${newTime.minutes()}:00`;
      }
    } else if (endDate && endTime) {
      str = `${`${endDate} ${str}${endTime}`}:00`;
    } else {
      if (!endTime) {
        const newTime = moment(this.defaultstartTime()).add(2, 'h');

        const minutes = newTime.minutes() == '0' ? '00' : '30';
        str = `${newTime.year()}-${newTime.month() +
          1}-${newTime.date()} ${newTime.hours()}:${minutes}:00`;

        this.state.endTime = `${newTime.hours()}:${minutes}:00`;
      }
    }

    return str;
  };

  render() {
    const {
      paperSelected,
      classList,
      taskType,
      exerciseType,
      exerciseBeginType,
      exerciseEndType,
      submitTaskLoading,
      publishSaveData,
      selectedClass,
      publishDate,
      endDate,
    } = this.props;
    const {
      isLoad,
      editing,
      exerciseTypeDict,
      beginTimeDict,
      endTimeDict,
      startVisible,
      endVisible,
    } = this.state;
    const timeIcon = (
      <i className="iconfont icon-time" style={{ color: '#228EFF', fontSize: '13px' }} />
    );
    // console.log('------props:',this.props);
    let btnDisable = true;
    if (
      publishSaveData.name &&
      selectedClass.length > 0 &&
      exerciseBeginType !== 'custom' &&
      exerciseEndType !== 'custom'
    ) {
      btnDisable = false;
    } else if (
      publishSaveData.name &&
      selectedClass.length > 0 &&
      exerciseBeginType === 'custom' &&
      publishDate !== '' &&
      exerciseEndType !== 'custom'
    ) {
      btnDisable = false;
    } else if (
      publishSaveData.name &&
      selectedClass.length > 0 &&
      exerciseEndType === 'custom' &&
      endDate !== '' &&
      exerciseBeginType !== 'custom'
    ) {
      btnDisable = false;
    } else if (
      publishSaveData.name &&
      selectedClass.length > 0 &&
      exerciseEndType === 'custom' &&
      endDate !== '' &&
      exerciseBeginType === 'custom' &&
      publishDate !== ''
    ) {
      btnDisable = false;
    } else {
      btnDisable = true;
    }
    return (
      <div className={styles.affterClassTrainContainer}>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <div className={styles.title} style={{ borderColor: editing ? '#03C46B' : '#E5E5E5' }}>
            {editing ? (
              <input
                ref={node => {
                  this.nameInput = node;
                }}
                className={styles.nameInput}
                placeholder={formatMessage(messages.inputNamePlaceholder)}
                maxLength={30}
                defaultValue={publishSaveData.name}
                onBlur={this.inputBlur}
              />
            ) : (
              <span>{publishSaveData.name}</span>
            )}
            {!editing && (
              <i
                className="iconfont icon-edit"
                style={{ marginLeft: '10px' }}
                onClick={this.editTaskName}
              />
            )}
          </div>

          {/* 考试试卷 */}
          <div className={styles.item}>
            <div className={styles.itemTit} style={{ color: '#333', fontSize: '14px' }}>
              {formatMessage(messages.examPaper)}
            </div>
            <div className={styles.itemContent} style={{ height: 'auto' }}>
              {paperSelected &&
                paperSelected.map(item => {
                  return (
                    <div className={styles.paper} key={item.id}>
                      <div className={cs(styles.left, styles.setCont)}>{item.name}</div>
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
          {/* 选择班级 */}
          {isLoad && (
            <div style={{ marginTop: '10px' }}>
              <ClassSelect
                classList={classList}
                taskType={taskType}
                ClassactiveKey={window.ClassSelectCard || '0'}
              />
            </div>
          )}

          {/* 发布时间 */}
          <div className={styles.item}>
            <div className={styles.itemTit} style={{ color: '#333' }}>
              {formatMessage({ id: 'app.title.exam.publish.time', defaultMessage: '发布时间' })}
            </div>
            <div className={styles.itemContent} style={{ lineHeight: '40px' }}>
              <Radio.Group onChange={this.onPublishChange} value={exerciseBeginType}>
                {beginTimeDict.map(it => {
                  return <Radio value={it.code}>{it.value}</Radio>;
                })}
                {/* 暂时隐藏 */}
                <Radio value="custom">
                  {formatMessage({
                    id: 'app.text.exam.publish.custom.time',
                    defaultMessage: '自选时间',
                  })}
                </Radio>
              </Radio.Group>
              {/* <Divider type="vertical" /> */}
              {exerciseBeginType === 'custom' && (
                <DatePicker
                  showToday={false}
                  closeable={false}
                  open={startVisible}
                  onOpenChange={() => {
                    if (exerciseEndType === 'custom') {
                      const { endDate, publishDate } = this.props;
                      const date1 = publishDate.replace(/-/g, '/');
                      const date2 = endDate.replace(/-/g, '/');
                      const exerciseBeginTime = new Date(date1).getTime();
                      const exerciseEndTime = new Date(date2).getTime();
                      // const { startVisible } = this.state;
                      if (exerciseEndTime - exerciseBeginTime <= 60000) {
                        message.warn(
                          formatMessage({
                            id: 'app.text.pleaseChooseTheDeadlineAgain',
                            defaultMessage: '请重新选择截止时间！',
                          })
                        );
                        return;
                      }
                    }
                    this.setState({ startVisible: !startVisible });
                  }}
                  showTime={{
                    minuteStep: 30,
                    format: 'hh:mm',
                  }}
                  placeholder={formatMessage({
                    id: 'app.placeholder.exam.publish.time',
                    defaultMessage: '请选择发布时间',
                  })}
                  disabledDate={startValue => {
                    // const { endValue } = this.state;
                    // if (!endValue) {
                    // Can not select days before today
                    return startValue && startValue < moment().startOf('day');
                    // }
                    // return (
                    //   endValue.valueOf() < startValue.valueOf() ||
                    //   startValue < moment().startOf('day')
                    // );
                  }}
                  disabledTime={date => {
                    let hours = moment().hours(); // 0~23
                    const minutes = moment().minutes(); // 0~59
                    let minutesArr = [];
                    if (minutes >= 30 && minutes <= 59) {
                      minutesArr = [0, 30];
                    } else {
                      hours -= 1;
                      minutesArr = [0];
                    }
                    // const seconds = moment().seconds();
                    // 当日只能选择当前时间之后的时间点
                    if (date) {
                      if (date.date() === moment().date()) {
                        if (date.hours() === moment().hours()) {
                          return {
                            disabledHours: () => this.range(0, hours),
                            disabledMinutes: () => minutesArr,
                            // disabledSeconds: () => this.range(0, seconds),
                          };
                        }
                        return {
                          disabledHours: () => this.range(0, hours),
                          disabledMinutes: () => [],
                          // disabledSeconds: () => this.range(0, seconds),
                        };
                      }
                    }
                  }}
                  value={
                    (this.state.startValue &&
                      this.state.starDate &&
                      publishDate &&
                      moment(this.defaultstartTime(), 'YYYY-MM-DD HH:mm:ss')) ||
                    ''
                  }
                  suffixIcon={timeIcon}
                  onChange={this.onPublishDateChange}
                  onOk={this.onPublishDateOk}
                />
              )}
            </div>
          </div>
          {/* 截止时间 */}
          <div className={styles.item}>
            <div className={styles.itemTit} style={{ color: '#333' }}>
              {formatMessage({ id: 'app.title.exam.publish.end.time', defaultMessage: '截止时间' })}
            </div>
            <div className={styles.itemContent} style={{ lineHeight: '40px' }}>
              <Radio.Group onChange={this.onEndTimeChange} value={exerciseEndType}>
                {endTimeDict.map(it => {
                  return <Radio value={it.code}>{it.value}</Radio>;
                })}
                {/* 暂时隐藏 */}
                <Radio value="custom">
                  {formatMessage({
                    id: 'app.text.exam.publish.custom.time',
                    defaultMessage: '自选时间',
                  })}
                </Radio>
              </Radio.Group>
              {/* <Divider type="vertical" /> */}
              {exerciseEndType === 'custom' && (
                <DatePicker
                  showToday={false}
                  open={endVisible}
                  onOpenChange={() => {
                    this.setState({ endVisible: !endVisible });
                  }}
                  showTime={{
                    minuteStep: 30,
                    format: 'hh:mm',
                  }}
                  placeholder={formatMessage({
                    id: 'app.placeholder.exam.publish.end.time',
                    defaultMessage: '请选择截止时间',
                  })}
                  disabledDate={endValue => {
                    const { startValue } = this.state;
                    if (!startValue) {
                      return endValue && endValue <= moment().startOf('day');
                    }
                    if (endValue.month() === moment().month()) {
                      return (
                        moment(endValue).date() < moment(startValue).date() ||
                        endValue < moment().startOf('day')
                      );
                    }
                  }}
                  disabledTime={date => {
                    const { publishDate } = this.props;
                    let hours = moment().hours(); // 0~23
                    let minutes = moment().minutes(); // 0~59
                    let minutesArr = [];
                    if (this.state.startValue && this.state.starDate && publishDate) {
                      hours = moment(this.defaultstartTime())
                        .add(0, 'h')
                        .hours();
                      minutes = moment(this.defaultstartTime())
                        .add(0, 'h')
                        .minutes();
                    } else {
                      hours = moment().hours(); // 0~23
                      minutes = moment().minutes(); // 0~59
                    }
                    if (minutes >= 30 && minutes <= 59) {
                      minutesArr = [0, 30];
                    } else {
                      hours -= 1;
                      minutesArr = [0];
                    }

                    // const seconds = moment().seconds();
                    // 当日只能选择当前时间之后的时间点
                    if (date) {
                      if (date.date() === moment().date()) {
                        if (date.hours() === moment().hours()) {
                          return {
                            disabledHours: () => this.range(0, hours),
                            disabledMinutes: () => minutesArr,
                            // disabledSeconds: () => this.range(0, seconds),
                          };
                        }
                        return {
                          disabledHours: () => this.range(0, hours),
                          disabledMinutes: () => [],
                          // disabledSeconds: () => this.range(0, seconds),
                        };
                      }
                    }
                  }}
                  value={(endDate && moment(this.defaultendTime(), 'YYYY-MM-DD HH:mm:ss')) || ''}
                  suffixIcon={timeIcon}
                  onChange={this.onEndDateChange}
                  onOk={this.onEndDateOk}
                />
              )}
            </div>
          </div>
          {/* 模式设置 */}
          <div
            className={styles.item}
            style={{ borderBottom: '1px solid #E5E5E5', paddingBottom: '10px' }}
          >
            <div className={styles.itemTit} style={{ color: '#333' }}>
              {formatMessage({
                id: 'app.title.exam.publish.mode.setting',
                defaultMessage: '模式设置',
              })}
            </div>
            <div className={styles.itemContent} style={{ lineHeight: '40px' }}>
              <Radio.Group onChange={this.onExerTypeChange} value={exerciseType}>
                {exerciseTypeDict.map(it => {
                  return <Radio value={it.code}>{it.value}</Radio>;
                })}
              </Radio.Group>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className={styles.lastFormSubmit}>
            <div
              className={styles.pre}
              onClick={() => {
                localStorage.setItem('publishReload', 'true');
                router.push(`/examination/publish/selectpaper/TT_5`);
              }}
            >
              {formatMessage({ id: 'app.button.exam.publis.last.step', defaultMessage: '上一步' })}
            </div>
            <div
              className={
                btnDisable || submitTaskLoading ? cs(styles.next, styles.disabled) : cs(styles.next)
              }
              onClick={() => {
                if (!btnDisable && !submitTaskLoading) {
                  const { dispatch, endDate, publishDate } = this.props;
                  if (exerciseEndType === 'custom' && exerciseBeginType === 'custom') {
                    const date1 = publishDate.replace(/-/g, '/');
                    const date2 = endDate.replace(/-/g, '/');
                    const exerciseBeginTime = new Date(date1).getTime();
                    const exerciseEndTime = new Date(date2).getTime();
                    console.log(date1);
                    console.log(date2);
                    if (exerciseEndTime - exerciseBeginTime <= 60000) {
                      message.warn(
                        formatMessage({
                          id: 'app.text.pleaseChooseTheDeadlineAgain',
                          defaultMessage: '请重新选择截止时间！',
                        })
                      );
                      return;
                    }
                  }

                  // 先组装数据，后提交
                  dispatch({
                    type: 'release/savePublishTaskData',
                    // payload:{
                    //   finallyData:true
                    // }
                  }).then(() => {
                    const { publishSaveData: params } = this.props;
                    dispatch({
                      type: 'release/fetchSaveTask',
                      payload: params,
                    }).then(e => {
                      const { responseCode, data } = e;
                      if (responseCode !== '200' || data == null) {
                        message.warning(data);
                      } else {
                        // 清除数据
                        dispatch({
                          type: 'release/clearAffterExeciseData',
                          payload: {},
                        });
                        router.push(`/examination/inspect`);
                      }
                    });
                  });
                }
              }}
            >
              {formatMessage({
                id: 'app.button.exam.publish.confirm.publish',
                defaultMessage: '确认发布',
              })}
            </div>
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default AffterClassTrain;
