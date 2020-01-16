/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:30
 * Explain: 调入学生弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
// eslint-disable-next-line no-unused-vars
import { Modal, List, Collapse, Tooltip, Empty } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import SearchBar from '@/components/SearchBar';
import StudentTip from '@/components/StudentTip';
import studentHead from '@/assets/class/student_head.png';
import styles from './index.less';

const { Panel } = Collapse;
// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  submit: { id: 'app.submit', defaultMessage: '确认' },
  addStudent: { id: 'app.menu.learninggroup.addStudent', defaultMessage: '转入学生' },
  addStudentOk: { id: 'app.menu.learninggroup.addStudentOk', defaultMessage: '转入学生成功' },
  cancelGroup: { id: 'app.menu.learninggroup.cancelGroup', defaultMessage: '取消分组' },
  addCurrentGroup: { id: 'app.menu.learninggroup.addCurrentGroup', defaultMessage: '加入现有小组' },
  studentSearch: {
    id: 'app.menu.learninggroup.studentSearch',
    defaultMessage: '请输入学生姓名或学号进行搜索',
  },
});

// connect方法可以拿取models中state值
@connect(({ clzss, loading, login }) => ({
  loading: loading.effects['clzss/fetchNaturalClass'],
  adminStudents: clzss.adminStudents,
  gradeClassList: clzss.gradeClassList,
  naturalClassStudents: clzss.naturalClassStudents,
  filterNaturalStudent: clzss.filterNaturalStudent,
  swapGradeStatus: clzss.swapGradeStatus,
  campusID: login.campusID,
}))
class TransferStudentsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      confirmBtn: false,
      checkedNatural: [],
    };
  }

  // 数据初始化
  componentDidMount() {
    const { dispatch, campusID } = this.props;
    dispatch({
      type: 'clzss/allGrade',
      payload: {
        campusId: campusID,
      },
    });
    const params = {
      campusId: localStorage.getItem('campusId'),
      classType: 'NATURAL_CLASS',
    };
    dispatch({
      type: 'campusmanage/classSwap',
      payload: params,
      callback: res => {
        const { swapGradeStatus } = res.data;
        this.setState({
          swapGradeStatus,
        });
      },
    });
  }

  // 弹框取消方法
  onHandleCancel = () => {
    const { hideModal, dispatch } = this.props;
    this.setState({
      confirmBtn: false,
      checkedList: [],
      checkedNatural: '',
    });
    dispatch({
      type: 'clzss/filterNaturalStudents',
      payload: {
        filterNaturalStudent: [],
      },
    });
    hideModal();
  };

  // 调入当前教学班
  onHandleOK = () => {
    const { hideModal, saveCheckedList, dispatch } = this.props;
    const { checkedList } = this.state;
    saveCheckedList(checkedList);
    this.setState({ checkedList: [], checkedNatural: '' });
    dispatch({
      type: 'clzss/filterNaturalStudents',
      payload: {
        filterNaturalStudent: [],
      },
    });
    hideModal();
  };

  // 获取该教学班的学生列表
  fetchNaturalClass = () => {
    const { dispatch, id } = this.props;
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: id,
    });
  };

  // 添加学生到小组
  addStudentList = (id, studentCodde, studentName, gender) => {
    let { checkedList } = this.state;
    const { checkedNatural } = this.state;
    const hasStudent = checkedList.find(obj => obj.studentId === id);
    if (hasStudent) {
      const checked = checkedList.filter(item => item.studentId !== id);
      checkedList = checked;
    } else {
      checkedList.push({
        studentId: id,
        teachingClassId: checkedNatural,
        studentName,
        gender,
        studentClassCode: studentCodde,
      });
    }

    this.setState({
      checkedList,
    });
  };

  // 根据姓名或学号搜索 该行政班的学生
  onSearchKey = value => {
    const { dispatch, naturalClassStudents } = this.props;
    const students = naturalClassStudents.filter(
      item =>
        (item.studentClassCode && item.studentClassCode.indexOf(value) > -1) ||
        (item.studentName && item.studentName.indexOf(value) > -1)
    );
    if (value !== '') {
      dispatch({
        type: 'clzss/filterNaturalStudents',
        payload: {
          filterNaturalStudent: students,
        },
      });
    } else {
      dispatch({
        type: 'clzss/filterNaturalStudents',
        payload: {
          filterNaturalStudent: naturalClassStudents,
        },
      });
    }
  };

  // 搜索行政班里的学生列表
  fetchNaturalStudent = id => {
    const { dispatch } = this.props;
    this.setState({
      checkedNatural: id,
    });
    dispatch({
      type: 'clzss/filterNaturalStudents',
      payload: {
        filterNaturalStudent: [],
      },
    });
    const params = {
      id,
    };
    dispatch({
      type: 'clzss/fetchNaturalStudents',
      payload: params,
    });
  };

  // 跨年异动返回新的数组
  transYearMove = () => {
    const { curItem, gradeClassList, id } = this.props;
    console.log(gradeClassList);
    const { swapGradeStatus } = this.state;
    const newGradeClassList = [];
    if (gradeClassList && gradeClassList.length > 0) {
      if (swapGradeStatus === 'Y') {
        // eslint-disable-next-line consistent-return
        gradeClassList.forEach((clzss, index) => {
          if (clzss.grade === curItem.grade) {
            newGradeClassList.push(clzss);
            if (index - 1 >= 0) {
              newGradeClassList.push(gradeClassList[index - 1]);
            }
            if (index + 1 < gradeClassList.length) {
              newGradeClassList.push(gradeClassList[index + 1]);
            }
            newGradeClassList.forEach(grade => {
              if (grade.naturalClassList && grade.naturalClassList.length > 0) {
                grade.naturalClassList.forEach(item => {
                  if (
                    (curItem.alias && item.alias === curItem.alias) ||
                    (curItem.alias && item.className === curItem.alias) ||
                    item.className === curItem.className
                  ) {
                    // eslint-disable-next-line no-param-reassign
                    item.cannotClick = true;
                  } else {
                    // eslint-disable-next-line no-param-reassign
                    item.cannotClick = false;
                  }
                });
              }
            });
            return false;
          }
        });
      } else {
        gradeClassList.forEach(clzss => {
          if (clzss.grade === curItem.grade) {
            newGradeClassList.push(clzss);
          }
        });
      }
    }
    const current = newGradeClassList.filter(vo => vo.grade === curItem.grade);
    const newGrade = newGradeClassList.filter(
      vo => vo.educationPhaseCode === current[0].educationPhaseCode
    );
    console.log(newGrade);
    newGrade.forEach(grades => {
      if (grades.naturalClassList && grades.naturalClassList.length > 0) {
        grades.naturalClassList.forEach(item => {
          if (item.naturalClassId === id) {
            // eslint-disable-next-line no-param-reassign
            item.cannotClick = true;
          }
        });
      }
    });
    return newGrade;
  };

  // 当前长度计算
  calculatedLen = (item, checkedList) => {
    let curLen = 0;
    let studentLen = 0;
    if (item.naturalClassList && item.naturalClassList.length > 0) {
      item.naturalClassList.forEach(clzss => {
        if (checkedList && checkedList.length > 0) {
          studentLen = checkedList.filter(v => v.teachingClassId === clzss.naturalClassId).length;
          curLen += studentLen;
        }
      });
    }
    return curLen;
  };

  showHeadTitle = (item, checkedList) => {
    return [
      <div style={{ display: 'flex' }}>
        <div>{item && <span className="current">{item.gradeValue}</span>}</div>
        <div style={{ position: 'relative', left: '190px' }}>
          {item && item.naturalClassList && (
            <span>
              {formatMessage({
                id: 'app.examination.publish.paper.selected',
                defaultMessage: '已选',
              })}
              :{this.calculatedLen(item, checkedList)}
              {formatMessage({
                id: 'app.text.classManageSelectedStudent',
                defaultMessage: '位学生',
              })}
            </span>
          )}
        </div>
      </div>,
    ];
  };

  // jsx语法视图渲染
  render() {
    const { visibleModal, filterNaturalStudent, naturalClassStudents } = this.props;
    const { checkedList, confirmBtn, checkedNatural } = this.state;
    const gradeNewClassList = this.transYearMove();
    const naturalList = filterNaturalStudent
      .filter(vo => vo.isMark === 'Y')
      .concat(filterNaturalStudent.filter(vo => vo.isMark === 'N'));
    console.log(gradeNewClassList);
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.addStudent)}
        closable={false}
        confirmLoading={confirmBtn}
        width={1000}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.submit)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.transferStudentsModal}
        okButtonProps={{ disabled: checkedList.length === 0 || false }}
      >
        <div className={styles.classList}>
          <Collapse accordion onChange={this.callback}>
            {gradeNewClassList &&
              gradeNewClassList.length > 0 &&
              gradeNewClassList.map(item => {
                return (
                  <Panel header={this.showHeadTitle(item, checkedList)}>
                    {item && (
                      <List
                        grid={{ gutter: 10, xs: 3, sm: 3, md: 3, lg: 3, xl: 3, xxl: 3 }}
                        className={styles.naturalDetail}
                        dataSource={item.naturalClassList}
                        renderItem={vo => (
                          <List.Item
                            onClick={() => this.fetchNaturalStudent(vo.naturalClassId)}
                            className={
                              (vo.cannotClick && styles.disableBtn) ||
                              (checkedNatural === vo.naturalClassId ? styles.checkedNatural : '')
                            }
                          >
                            <div className={styles.teacherInfo}>
                              <span title={vo.className}>{vo.className}</span>
                            </div>
                            <div className={styles.teacherInfo}>教师：{vo.teacherName}</div>
                            {checkedList.filter(v => v.teachingClassId === vo.naturalClassId)
                              .length > 0 && (
                              <span className={styles.counts}>
                                {
                                  checkedList.filter(v => v.teachingClassId === vo.naturalClassId)
                                    .length
                                }
                              </span>
                            )}
                          </List.Item>
                        )}
                      />
                    )}
                  </Panel>
                );
              })}
          </Collapse>
        </div>

        <div className={styles.itemModal}>
          <SearchBar
            placeholder={formatMessage(messages.studentSearch)}
            onSearch={data => this.onSearchKey(data)}
            onChange={data => this.onSearchKey(data)}
          />
          <div className={styles.students}>
            {naturalList.length !== 0 && (
              <List
                grid={{ gutter: 10, xs: 3, sm: 3, md: 3, lg: 3, xl: 3, xxl: 3 }}
                dataSource={naturalList || []}
                renderItem={item => (
                  <List.Item
                    onClick={() =>
                      this.addStudentList(
                        item.studentId,
                        item.studentClassCode,
                        item.studentName,
                        item.gender
                      )
                    }
                    className={
                      (item.added && styles.disableBtn) ||
                      (checkedList.length > 0 &&
                      checkedList.find(obj => obj.studentId === item.studentId)
                        ? styles.checkedStudent
                        : '') ||
                      (item.isMark === 'Y' && styles.checkedCallOut)
                    }
                  >
                    <StudentTip item={item} isMark />
                  </List.Item>
                )}
              />
            )}

            {checkedNatural !== '' && naturalClassStudents.length === 0 && (
              <div className={styles.nostudent}>
                <Empty
                  image={studentHead}
                  description={formatMessage({
                    id: 'app.text.classManageNoStudent',
                    defaultMessage: '本班级还没有学生!',
                  })}
                />
              </div>
            )}
            {naturalClassStudents.length > 0 && filterNaturalStudent.length === 0 && (
              <div className={styles.nostudent}>
                <Empty
                  image={studentHead}
                  description={formatMessage({
                    id: 'app.text.seacherNoData',
                    defaultMessage: '没有搜索到学生!',
                  })}
                />
              </div>
            )}
          </div>
          <div className={styles.promptInfo}>
            <i />{' '}
            {formatMessage({
              id: 'app.text.classManage. Call.out',
              defaultMessage: '表示被当前班级教师标记为“调出”',
            })}
          </div>
        </div>
      </Modal>
    );
  }
}

export default TransferStudentsModal;
