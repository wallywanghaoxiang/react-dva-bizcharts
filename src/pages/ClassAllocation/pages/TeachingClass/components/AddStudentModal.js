/**
 *
 * User: tina.zhang
 * Explain: 调入学生
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
// eslint-disable-next-line no-unused-vars
import { Modal, List, Collapse, Tooltip, Empty, Spin } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import SearchBar from '@/components/SearchBar';
import studentHead from '@/assets/class/student_head.png';
import StudentTip from '@/components/StudentTip';
import styles from './index.less';

const { Panel } = Collapse;
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

@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/fetchNaturalClass'],
  teachingStudents: clzss.teachingStudents,
  gradeClassList: clzss.gradeClassList,
  naturalClassStudents: clzss.naturalClassStudents,
  filterNaturalStudent: clzss.filterNaturalStudent,
}))
class AddStudentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      confirmBtn: false,
      checkedNatural: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'clzss/allGrade',
      payload: {
        campusId: localStorage.getItem('campusId'),
      },
    });
    const params = {
      campusId: localStorage.getItem('campusId'),
      classType: 'TEACHING_CLASS',
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

  onHandleCancel = () => {
    const { hideModal, dispatch } = this.props;
    this.setState({
      confirmBtn: false,
      checkedList: [],
      checkedNatural: [],
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
    this.setState({ checkedList: [], checkedNatural: [] });
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
      type: 'clzss/getTeachingStudents',
      payload: id,
    });
  };

  // 添加学生到小组
  addStudentList = (id, studentCodde, studentName) => {
    let { checkedList } = this.state;
    const { swapGradeStatus } = this.state;
    const { checkedNatural } = this.state;
    const hasStudent = checkedList.find(obj => obj.studentId === id);
    if (hasStudent) {
      const checked = checkedList.filter(item => item.studentId !== id);
      checkedList = checked;
    } else {
      checkedList.push({
        studentId: id,
        naturalClassId: checkedNatural,
        studentName,
        studentClassCode: studentCodde,
        isGradeSwap: swapGradeStatus === 'Y' || false,
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
  fetchNaturalStudent = naturalId => {
    const { dispatch, subjectId, id } = this.props;

    this.setState({
      checkedNatural: naturalId,
    });
    const params = {
      id: naturalId,
      teachId: id,
      subjectId,
    };
    dispatch({
      type: 'clzss/naturalStudents',
      payload: params,
    });
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
      <div>
        {item.naturalClassList && (
          <span className={styles.floatR}>
            {formatMessage({ id: 'app.text.classManangeSelected', defaultMessage: '已选' })}:{' '}
            {this.calculatedLen(item, checkedList)}
            {formatMessage({ id: 'app.text.classManageSelectedStudent', defaultMessage: '位学生' })}
          </span>
        )}
        <span className="current">{item.gradeValue}</span>
      </div>,
    ];
  };

  // 跨年异动返回新的数组
  transYearMove = () => {
    const { grade, gradeClassList } = this.props;
    const { swapGradeStatus } = this.state;
    const newGradeClassList = [];
    if (gradeClassList && gradeClassList.length > 0) {
      if (swapGradeStatus === 'Y') {
        // eslint-disable-next-line consistent-return
        gradeClassList.forEach((clzss, index) => {
          if (clzss.grade === grade) {
            newGradeClassList.push(clzss);
            if (index - 1 >= 0) {
              newGradeClassList.push(gradeClassList[index - 1]);
            }
            if (index + 1 < gradeClassList.length) {
              newGradeClassList.push(gradeClassList[index + 1]);
            }
            return false;
          }
        });
      } else {
        gradeClassList.forEach(clzss => {
          if (clzss.grade === grade) {
            newGradeClassList.push(clzss);
          }
        });
      }
    }
    const current = newGradeClassList.filter(vo => vo.grade === grade);
    const newGrade = newGradeClassList.filter(
      vo => vo.educationPhaseCode === current[0].educationPhaseCode
    );
    return newGrade;
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const { visible, filterNaturalStudent, loading, naturalClassStudents } = this.props;
    const { checkedList, confirmBtn, checkedNatural } = this.state;
    const gradeNewClassList = this.transYearMove();
    return (
      <Modal
        visible={visible}
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
        className={styles.AddStudentModal}
        okButtonProps={{ disabled: checkedList.length === 0 || false }}
      >
        <div className={styles.classList}>
          <Collapse accordion onChange={this.callback}>
            {gradeNewClassList &&
              gradeNewClassList.length > 0 &&
              gradeNewClassList.map(item => {
                return (
                  <Panel header={this.showHeadTitle(item, checkedList)} key={item.id}>
                    <List
                      grid={{ gutter: 20, xs: 3, sm: 3, md: 3, lg: 3, xl: 3, xxl: 3 }}
                      className={styles.naturalDetail}
                      dataSource={item.naturalClassList}
                      renderItem={vo => (
                        <List.Item
                          onClick={() => this.fetchNaturalStudent(vo.naturalClassId)}
                          className={
                            checkedNatural === vo.naturalClassId ? styles.checkedNatural : ''
                          }
                        >
                          <div className={styles.teacherInfo}>
                            <b title={vo.alias || vo.className}>{vo.alias || vo.className}</b>
                          </div>

                          <div className={styles.teacherInfo}>
                            {formatMessage({
                              id: 'app.text.classManageTeacher',
                              defaultMessage: '教师',
                            })}
                            ： <Tooltip title={vo.teacherName}>{vo.teacherName}</Tooltip>
                          </div>
                          {checkedList.filter(v => v.teachingClassId === vo.naturalClassId).length >
                            0 && (
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
            {filterNaturalStudent.length !== 0 && (
              <List
                grid={{ gutter: 10, xs: 3, sm: 3, md: 3, lg: 3, xl: 3, xxl: 3 }}
                className={styles.paperInfo}
                dataSource={filterNaturalStudent || []}
                renderItem={item => (
                  <List.Item
                    onClick={() =>
                      this.addStudentList(item.studentId, item.studentClassCode, item.studentName)
                    }
                    className={
                      (!item.added && styles.disableBtn) ||
                      (checkedList.length > 0 &&
                      checkedList.find(obj => obj.studentId === item.studentId)
                        ? styles.checkedStudent
                        : '')
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
        </div>
      </Modal>
    );
  }
}

export default AddStudentModal;
