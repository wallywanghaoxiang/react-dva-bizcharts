/* eslint-disable no-var */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Select, Collapse, List, Icon, Empty, Tooltip, Button, Modal, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import SearchBar from '@/components/SearchBar';
import noneChoose from '@/assets/none_choose_tip_icon.png';
import noneUser from '@/assets/none_user_pic.png';
import ArtificialCorrect from '@/frontlib/components/ArtificialCorrect';

import { showWaiting, hideLoading } from '@/frontlib/utils/utils';
import loading from '@/frontlib/assets/loading.gif';
import styles from './index.less';

const { Option } = Select;
const { Panel } = Collapse;

const { confirm } = Modal;
let btnStatus = '';

const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  del: { id: 'app.menu.correct.del.toast', defaultMessage: '删除' },
  yesorno: { id: 'app.menu.correct.change.yesorno', defaultMessage: '的所有纠偏评分？' },
  delYesOrOk: { id: 'app.menu.correct.del.yesorno', defaultMessage: '是否删除' },
  deleted: { id: 'app.menu.correct.del.deleted', defaultMessage: '删除后不影响学生的智能评分结果' },
});

@connect(({ correction, home }) => {
  const { classList, studentType, subQuestions, filterClassData } = correction;

  return {
    classList,
    studentType,
    subQuestions,
    filterClassData,
    home,
  };
})
class Correction extends Component {
  state = {
    initType: 'ALL_STUDENT',
    checkedID: '',
    currentPaperId: '',
    checkClassId: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { initType } = this.state;
    dispatch({
      type: 'correction/fetchType',
      payload: {
        type: 'RECTIFY_QUERY_TYPE',
      },
    });
    this.changeType(initType);
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
  }

  // 切换纠偏策略
  changeType = type => {
    const { dispatch, match } = this.props;
    const {
      params: { taskId },
    } = match;
    const { checkedID } = this.state;
    const that = this;
    dispatch({
      type: 'correction/fetchClassList',
      payload: {
        type,
        taskId,
      },
      callback: data => {
        const student = [];
        data.forEach(vo => {
          if (vo.studentList.length > 0) {
            vo.studentList.forEach(item => {
              student.push(item);
            });
          }
        });
        const current = student.filter(vo => vo.studentId === checkedID);
        if (student.length === 0 || current.length === 0) {
          that.setState({
            currentPaperId: '',
            checkedID: '',
          });
        }
        data.forEach(vo => {
          if (vo.studentList.length > 0) {
            vo.studentList.forEach(item => {
              if (checkedID === item.studentId) {
                this.selectedID(item, vo.classId);
              }
            });
          }
        });
      },
    });
  };

  showHeadTitle = item => {
    return [
      <div style={{ display: 'flex', position: 'relative' }}>
        <div>{item && <span className={styles.current}>{item.className}</span>}</div>
        <div className={styles.corrected} style={{ position: 'absolute', right: '0' }}>
          {formatMessage({ id: 'app.text.correctManage.corrected.people', defaultMessage: '已纠' })}
          {item.manualNum}
          {formatMessage({
            id: 'app.examination.inspect.task.unit.person',
            defaultMessage: '人',
          })}
          , {item.manualQuesNum}
          {formatMessage({ id: 'app.menu.papermanage.paperItem', defaultMessage: '题' })}
        </div>
      </div>,
    ];
  };

  selectedID = (vo, classId) => {
    window.scrollTo(0, 0);
    const { dispatch } = this.props;
    dispatch({
      type: 'correction/saveSubQuestions',
      payload: {
        subQuestions: vo.subquestionList,
        checkedID: vo.studentId,
        checkClassId: classId,
      },
    });
    this.setState({
      checkedID: vo.studentId,
      currentPaperId: vo.paperId,
      checkClassId: classId,
    });
  };

  // 切换 过滤
  handleChange = value => {
    console.log(`selected ${value}`);
    this.setState({
      initType: value,
    });
    this.changeType(value);
  };

  // 搜索
  changeValueSearch = value => {
    console.log(value);
    const { dispatch } = this.props;
    const { checkedID } = this.state;
    const that = this;
    dispatch({
      type: 'correction/filterClassList',
      payload: {
        keywords: value,
      },
      callback: res => {
        const student = [];
        res.forEach(vo => {
          if (vo.studentList.length > 0) {
            vo.studentList.forEach(item => {
              student.push(item);
            });
          }
        });
        const current = student.filter(vo => vo.studentId === checkedID);
        if (student.length === 0 || current.length === 0) {
          that.setState({
            currentPaperId: '',
            checkedID: '',
          });
        }
      },
    });
  };

  // 删除当前学生的纠偏
  delCurrentStu = () => {
    const { checkedID } = this.state;
    const { filterClassData, dispatch } = this.props;
    const {
      match: {
        params: { taskId },
      },
    } = this.props;
    const student = [];
    filterClassData.forEach(vo => {
      if (vo.studentList.length > 0) {
        vo.studentList.forEach(item => {
          if (item.studentId === checkedID) {
            student.push(item);
          }
        });
      }
    });
    confirm({
      title: '',
      content: (
        <div className={styles.yesOrNo}>
          <span>{formatMessage(messages.delYesOrOk)}</span>
          <span className={styles.userName}>{student[0].studentName}</span>
          <span> {formatMessage(messages.yesorno)}</span>
          <p>{formatMessage(messages.deleted)}</p>
        </div>
      ),
      okText: formatMessage(messages.del),
      cancelText: formatMessage(messages.cancel),
      onOk() {
        dispatch({
          type: 'correction/rectifyDelete',
          payload: {
            taskId,
            studentId: checkedID,
          },
          callback: res => {
            if (res.responseCode !== '200') {
              message.warning(res.data);
            } else {
              message.success(
                formatMessage({
                  id: 'app.menu.learngroup.delGroupSucess',
                  defaultMessage: '删除成功',
                })
              );
              window.location.reload();
            }
          },
        });
      },
    });
  };

  scoreResults = () => {
    // 点击评分结果
    const {
      match: {
        params: { taskId },
      },
    } = this.props;
    showWaiting({
      img: loading,
      text: '正在生成报告，请稍等..',
    });
    // 调用是否汇总，弹出loading页面 返回结果，无论成功失败，打开报告页面。
    const { dispatch } = this.props;
    dispatch({
      type: 'home/getSummaryData',
      payload: { taskId },
      callback: () => {
        hideLoading();
        router.push({ pathname: `/examination/inspect/report/${taskId}` });
      },
    });
  };

  // 上一个学生
  preStudent = () => {
    const { filterClassData } = this.props;
    const student = [];
    const that = this;
    const { checkedID } = this.state;
    filterClassData.forEach(vo => {
      if (vo.studentList.length > 0) {
        vo.studentList.forEach(item => {
          // eslint-disable-next-line no-param-reassign
          item.classId = vo.classId;
          student.push(item);
        });
      }
    });
    student.forEach((vo, index) => {
      if (vo.studentId === checkedID && index > 0) {
        that.selectedID(student[index - 1], student[index - 1].classId);
      }
    });
  };

  // 保存下一个学生
  nextStudent = () => {
    const {
      filterClassData,
      dispatch,
      match: {
        params: { taskId },
      },
    } = this.props;
    const student = [];
    const that = this;
    const { checkedID } = this.state;
    filterClassData.forEach(vo => {
      if (vo.studentList.length > 0) {
        vo.studentList.forEach(item => {
          // eslint-disable-next-line no-param-reassign
          item.classId = vo.classId;
          student.push(item);
        });
      }
    });
    student.forEach((vo, index) => {
      if (vo.studentId === checkedID && index < student.length - 1) {
        that.selectedID(student[index + 1], student[index + 1].classId);
      }
    });
    dispatch({
      type: 'correction/rectifyDefaults',
      payload: {
        taskId,
        studentId: checkedID,
      },
      callback: res => {
        if (res.responseCode === '200') {
          student.forEach((vo, index) => {
            if (vo.studentId === checkedID) {
              if (index === student.length - 1) {
                message.success(
                  formatMessage({
                    id: 'app.campus.manage.basic.class.save.move.success',
                    defaultMessage: '保存成功！',
                  })
                );
              }
            }
          });
        }
      },
    });
  };

  changeClassID = key => {
    this.setState({
      checkClassId: key,
    });
  };

  render() {
    const { filterClassData, studentType, subQuestions } = this.props;

    const { checkedID, initType, currentPaperId, checkClassId } = this.state;
    const {
      match: {
        params: { taskId, classId },
      },
    } = this.props;
    const student = [];
    filterClassData.forEach(vo => {
      if (vo.studentList.length > 0) {
        vo.studentList.forEach(item => {
          student.push(item);
        });
      }
    });

    student.forEach((vo, index) => {
      if (vo.studentId === checkedID) {
        console.log(index);
        if (index === 0) {
          btnStatus = 'pre';
        }
        if (index === student.length - 1 && index !== 0) {
          btnStatus = 'next';
        }
      }
    });
    const that = this;
    // eslint-disable-next-line func-names
    window.onbeforeunload = function(e) {
      // eslint-disable-next-line no-var
      // eslint-disable-next-line no-redeclare
      var e = window.event || e;
      if (window.location.href.indexOf('/artificial/correct') > -1) {
        that.scoreResults();
        // e.returnValue="确定要退出本页吗？";
      }
    };

    console.log(btnStatus);

    return (
      <div className={styles.correction}>
        <div className={styles.headerTop}>
          <i className="iconfont icon-link-arrow-left" onClick={this.scoreResults} />|
          <span>
            {formatMessage({
              id: 'app.title.exam.publish.manual.rectification',
              defaultMessage: '人工纠偏',
            })}
          </span>
        </div>
        <div className={styles.content}>
          <div className={styles.navLeft}>
            <div className={styles.filterStudent}>
              {studentType.length > 0 && (
                <Select
                  defaultValue={initType}
                  style={{ width: 270 }}
                  onChange={this.handleChange}
                  menuItemSelectedIcon={() => <i className="iconfont icon-right" />}
                >
                  {studentType.map(vo => (
                    <Option value={vo.code} key={vo.code}>
                      {vo.value}
                    </Option>
                  ))}
                </Select>
              )}
              <SearchBar
                placeholder={formatMessage({
                  id: 'app.text.correctManage.search',
                  defaultMessage: '按学号或姓名搜索',
                })}
                onSearch={value => this.changeValueSearch(value)}
                onChange={value => this.changeValueSearch(value)}
                style={{ width: 200 }}
              />
            </div>
            {student.length > 0 ? (
              <div className={styles.classListPane}>
                <Collapse
                  accordion
                  onChange={this.changeClassID}
                  expandIcon={({ isActive }) => (
                    <Icon type="caret-right" rotate={isActive ? 90 : 0} />
                  )}
                  activeKey={[checkClassId]}
                >
                  {filterClassData &&
                    filterClassData.length > 0 &&
                    filterClassData.map(item => {
                      return item.studentList.length > 0 ? (
                        <Panel header={this.showHeadTitle(item)} key={item.classId}>
                          {item.studentList.length > 0 && (
                            <List
                              className={styles.naturalDetail}
                              dataSource={item.studentList}
                              renderItem={vo => (
                                <List.Item
                                  onClick={() => this.selectedID(vo, item.classId)}
                                  className={
                                    checkedID === vo.studentId ? styles.checkedStudent : ''
                                  }
                                  key={vo.studentId}
                                >
                                  <div className={styles.teacherInfo}>
                                    <span className={styles.studentName}>
                                      <b>{vo.studentClassNo}</b>
                                      {vo.studentName}
                                    </span>
                                    <Tooltip
                                      title={formatMessage({
                                        id: 'app.text.correctManage.score',
                                        defaultMessage: '智能评分',
                                      })}
                                      className={styles.score}
                                    >
                                      <i className="iconfont icon-computer-ai" />
                                      {vo.totalScore}分{' '}
                                    </Tooltip>
                                    <Tooltip
                                      title={formatMessage({
                                        id: 'app.title.correctManage.title.corrected',
                                        defaultMessage: '纠偏后得分',
                                      })}
                                      className={styles.correcting}
                                    >
                                      <i className="iconfont icon-user" />
                                      {vo.manualScore === null ? '--' : vo.manualScore}分{' '}
                                    </Tooltip>
                                  </div>
                                </List.Item>
                              )}
                            />
                          )}
                        </Panel>
                      ) : (
                        ''
                      );
                    })}
                </Collapse>
              </div>
            ) : (
              <Empty
                className={styles.noEmptyUser}
                image={noneUser}
                description={
                  <p>
                    {formatMessage({
                      id: 'app.menu.classallocation.groupingNoData',
                      defaultMessage: '未查询到相关学生',
                    })}
                  </p>
                }
              />
            )}
          </div>
          <div className={styles.navRight}>
            {currentPaperId === '' ? (
              <Empty
                className={styles.noEmptyPaper}
                image={noneChoose}
                description={
                  <p>
                    {formatMessage({
                      id: 'app.message.correctManage.click.open.list',
                      defaultMessage: '点击左侧班级分组展开学生列表',
                    })}
                    <br />
                    {formatMessage({
                      id: 'app.message.correctManage.click.correct',
                      defaultMessage: '点击学生即可对答卷进行纠偏',
                    })}
                  </p>
                }
              />
            ) : (
              subQuestions.length > 0 && (
                <ArtificialCorrect
                  classId={classId}
                  paperId={currentPaperId}
                  taskId={taskId}
                  // eslint-disable-next-line jsx-a11y/aria-role
                  role
                />
              )
            )}
            {/* 试卷预览 */}
          </div>
          {checkedID !== '' && (
            <div className={styles.renderFooter}>
              <Button className={styles.delCurrent} onClick={this.delCurrentStu}>
                <i className="iconfont icon-eraser" />
                {formatMessage({
                  id: 'app.text.correctManage.del.current.result',
                  defaultMessage: '删除当前学生纠偏结果',
                })}
              </Button>
              <Button
                className={btnStatus === 'next' ? styles.saveSubmit : styles.saveSubmit}
                onClick={this.nextStudent}
              >
                {btnStatus === 'next' || student.length === 1
                  ? formatMessage({
                      id: 'app.campus.manage.basic.class.save.btn.title',
                      defaultMessage: '保存',
                    })
                  : formatMessage({
                      id: 'app.button.correctManage.save.next',
                      defaultMessage: '保存，进入下一个',
                    })}
              </Button>
              <div
                className={btnStatus !== 'pre' ? styles.preBtn : styles.disablePreBtn}
                onClick={this.preStudent}
              >
                <i className="iconfont icon-previous" />
                {formatMessage({
                  id: 'app.button.correctManage.pre.student',
                  defaultMessage: '上一个学生',
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Correction;
