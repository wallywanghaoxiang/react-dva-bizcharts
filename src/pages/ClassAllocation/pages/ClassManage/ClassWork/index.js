/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: PM 14:07
 * Explain: 班务管理页面
 *
 * */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Table, Divider, message, Tooltip, List } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import ClassWorkNoData from '../components/ClassWorkNoData';
import EditorTeacherModal from '../components/EditorTeacherModal';
import DelStudentModal from '../components/DelStudentModal';
import DelTeacherModal from '../components/DelTeacherModal';
import AddTeacherModal from '../components/AddTeacherModal';
import OnceDeletedModal from '../components/OnceDeletedModal';
import NearFutureDeleteModal from '../components/NearFutureDeleteModal';
import MergeSuccess from '../components/MergeSuccess';
import SameNameAndGenderModal from '../components/SameNameAndGenderModal';
import TransferStudentsModal from '../components/TransferStudentsModal';
import AddStudentModal from '../components/AddStudentModal';
import CancelMarkModal from '../components/CancelMarkModal';
import DropOutSchoolModal from '../components/DropOutSchoolModal';
import SwithTo from '../components/SwithTo';
import WorkContent from '../components/WorkContent';
import HeadNews from '../components/HeadNews';
import UserAvatar from '../../../Components/UserAvatar';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
  adminclass: { id: 'app.menu.classallocation.adminclass', defaultMessage: '行政班' },
  classwork: { id: 'app.menu.classallocation.classwork', defaultMessage: '班务管理' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '取消标记成功！' },
  editFailure: { id: 'app.menu.classmanage.editFailure', defaultMessage: '取消标记失败！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '添加成功' },
  addFailure: { id: 'app.menu.classmanage.addFailure', defaultMessage: '添加失败' },
  addStudentOk: { id: 'app.menu.learninggroup.addStudentOk', defaultMessage: '转入学生成功' },
  callOutSuccess: { id: 'app.menu.classmanage.callOutSuccess', defaultMessage: '标记调出成功！' },
  callOutFail: { id: 'app.menu.classmanage.callOutFail', defaultMessage: '标记调出失败！' },
  chooseStudentsFirst: {
    id: 'app.menu.classmanage.chooseStudentsFirst',
    defaultMessage: '请先选择学生！',
  },
});
// style行内样式变量
const avatar = {
  width: 26,
  height: 26,
  marginRight: 4,
  borderRadius: 13,
};

// connect方法可以拿取models中state值
@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/fetchNaturalClass'],
  naturalClass: clzss.naturalClass,
  filterNaturalClass: clzss.filterNaturalClass,
  adminStudents: clzss.adminStudents,
  adminTeacherList: clzss.adminTeacherList,
  adminLastDays: clzss.adminLastDays,
  currentNaturalTeach: clzss.currentNaturalTeach,
  swapGradeStatus: clzss.swapGradeStatus,
}))
class ClassWork extends Component {
  constructor(props) {
    super(props);
    this.recoveryData = []; // 要恢复的数据
    this.onceDeleteData = []; // 要恢复的过去删除的数据
    const ShowBtnMessage = () => (
      <div>
        {props.adminLastDays === 0 || props.adminLastDays === null ? (
          <div style={{ width: '190px', height: '36px', 'line-height': '18px' }}>
            <div>
              <div style={{ fontSize: 13 }}>
                {formatMessage({
                  id: 'app.text.Non-AlternatingPeriodNotOperating',
                  defaultMessage: '非异动期不可操作，如需操作',
                })}
                ，
              </div>
              <div style={{ fontSize: 13 }}>
                {formatMessage({
                  id: 'app.text.Pleasecontacttheadministratortoopenthechange',
                  defaultMessage: '请联系管理员开启异动',
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
    this.state = {
      curItem:
        props.location.state && props.location.state.curItem ? props.location.state.curItem : [],
      editTeachers: {},
      currentStudent: {},
      delTeacher: {},
      onceParams: {},
      restoreName: [],
      onceStudentsArr: [],
      duplicateName: [],
      visibleTeacherModal: false,
      visibleDelModal: false,
      visibleAddModal: false,
      visibleAddStudentModal: false,
      visibleTransferStudentModal: false,
      visibleSameNameAndGenderModal: false,
      visibleNearFutureDeleteModal: false,
      visibleonceDeletedModal: false,
      visibleCancelMarkModal: false,
      visibleDelStudentModal: false,
      visibleDropOutModal: false,
      visibleSwithToModal: false,
      checkedList: [],
      selectedStudents: [],
      subjectSelect: '',
      visibleMergeSucess: false,
    };
  }

  // 页面刷新回调避免刷新丢失数据
  componentWillMount() {
    // const { location, dispatch } = this.props;

    // const { curItem } = this.state;
    // curItem.alias = sessionStorage.getItem('curAlias') || curItem.alias;
    // curItem.className = sessionStorage.getItem('className') || curItem.className;

    // this.state = {
    //   curItem: (location.state && location.state.curItem) ? location.state.curItem : []

    // };
    this.getNaturalClass();
  }

  // 初始化调用行政班接口
  componentDidMount() {
    // this.getNaturalClass()
  }

  getNaturalClass = () => {
    const {
      dispatch,
      location,
      match: {
        params: { id },
      },
    } = this.props;
    const { curItem } = this.state;
    const params = {
      id,
    };
    const that = this;
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
      callback: data => {
        curItem.alias = sessionStorage.getItem('curAlias') || data.alias;
        curItem.className = sessionStorage.getItem('className') || data.className;
        curItem.classNumber = data.classNumber;
        curItem.studentNum = data.studentList.length;
        curItem.naturalClassId = data.naturalClassId;
        curItem.grade = data.grade;
        curItem.lastDays = data.lastDays;
        that.setState({ curItem });
        dispatch({
          type: 'clzss/saveCurrentNaturalTeach',
          payload: {
            item: curItem,
          },
        });
      },
    });
  };

  // 框选中的数据信息
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
    const { filterNaturalClass } = this.props;
    const students = [];
    if (filterNaturalClass && filterNaturalClass.length > 0) {
      filterNaturalClass.forEach((item, index) => {
        if (selectedRowKeys && selectedRowKeys.length > 0) {
          selectedRowKeys.forEach(key => {
            if (key === index) {
              students.push(item);
            }
          });
        }
      });
      this.setState({ selectedStudents: students });
    }
  };

  // 关闭编辑老师弹框
  teacherModalVisible = (flag, teacher) => {
    this.setState({
      visibleTeacherModal: !!flag,
      editTeachers: teacher,
    });
  };

  // 关闭删除老师弹框
  delModalVisible = (flag, teacher) => {
    this.setState({
      visibleDelModal: !!flag,
      delTeacher: teacher,
    });
  };

  // 显示同名同姓弹框组件
  sameNameAndGenderModalVisible = (flag, duplicateName, restoreName, recoveryData) => {
    this.recoveryData = recoveryData;
    console.log(restoreName, recoveryData);
    this.setState({
      visibleSameNameAndGenderModal: !!flag,
      duplicateName,
      restoreName,
    });
  };

  // 关闭老师弹框组件
  addModalVisible = flag => {
    this.setState({
      visibleAddModal: !!flag,
    });
  };

  // 显示添加学生弹框组件
  addStudentModalVisible = flag => {
    this.setState({
      visibleAddStudentModal: !!flag,
    });
  };

  // 显示调入学生弹框组件
  transferStudentModalVisible = flag => {
    this.setState({
      visibleTransferStudentModal: !!flag,
    });
  };

  // 显示同名同姓弹框组件
  nearFutureDeleteModalVisible = (flag, restoreName, recoveryData) => {
    this.recoveryData = recoveryData;
    console.log(restoreName);
    this.setState({
      visibleNearFutureDeleteModal: !!flag,
      restoreName,
    });
  };

  // 曾经删除的弹框组件
  onceDeletedModalVisible = (flag, restoreName, onceStudentsArr, onceParams) => {
    this.setState({
      visibleonceDeletedModal: !!flag,
      restoreName,
      onceStudentsArr,
      onceParams,
    });
  };

  // 取消标记弹框组件
  cancelMarkModalVisible = (flag, text) => {
    let isSomeT = false;
    const { location, dispatch, adminStudents } = this.props;
    const { curItem } = this.state;
    const paramsArr = [];
    if (curItem.lastDays === 0 || curItem.lastDays === null) {
      return false;
    }
    if (text) {
      const params = {
        naturalClassId: curItem.naturalClassId,
        studentId: text.studentId,
        studentClassCode: text.studentClassCode,
      };
      paramsArr.push(params);
      if (adminStudents && adminStudents.length > 0) {
        adminStudents.forEach(students => {
          if (
            students.studentId !== text.studentId &&
            students.studentClassCode === text.studentClassCode
          ) {
            isSomeT = true;
          }
        });
      }
    }
    if (text && text.isMark === 'Y' && paramsArr.length > 0 && !isSomeT) {
      dispatch({
        type: 'clzss/updateStudentsUnmark',
        payload: paramsArr,
        callback: res => {
          if (res === 'SUCCESS' || res.responseCode === '200') {
            this.getNaturalClass();
            message.success(
              formatMessage({ id: 'app.message.unmarkSuccess', defaultMessage: '取消标记成功' })
            );
          } else {
            message.error(
              formatMessage({ id: 'app.message.unmarkFailure', defaultMessage: '取消标记失败' })
            );
          }
        },
      });
    } else {
      this.setState({
        visibleCancelMarkModal: !!flag,
        currentStudent: text,
      });
    }
  };

  _unique = arr => {
    const hash = [];
    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].studentClassCode === arr[j].studentClassCode) {
            ++i;
          }
        }
        hash.push(arr[i]);
      }
    }
    return hash;
  };

  addClassMoveStudents = () => {
    const { curItem } = this.state;
    let { checkedList } = this.state;
    const { dispatch, filterNaturalClass } = this.props;
    const that = this;
    const arr = [];
    this.recoveryData = this._unique(this.recoveryData);
    console.log(this.recoveryData);
    checkedList.forEach((item, index) => {
      if (this.recoveryData && this.recoveryData.length > 0) {
        this.recoveryData.forEach(recovery => {
          if (recovery && item.studentId === recovery.studentId) {
            checkedList[index].studentId = (recovery && recovery.studentId) || '';
            checkedList[index].studentName = (recovery.select && recovery.select[0].name) || '';
            checkedList[index].isTransient =
              (recovery.select && recovery.select[0].isTransient) || '';
            checkedList[index].gender = (recovery.select && recovery.select[0].gender) || '';
            checkedList[index].avatar = (recovery.select && recovery.select[0].avatar) || '';
            checkedList[index].mergeStudentId = (recovery.select && recovery.select[0].id) || '';
          }
        });
      }
    });
    console.log(checkedList, this.recoveryData);
    checkedList.forEach(item => {
      arr.push({
        naturalClassId: curItem.naturalClassId,
        studentId: item.studentId,
        studentClassCode: item.studentClassCode,
        mergeStudentId: item.mergeStudentId || '',
      });
    });
    if (checkedList && checkedList.length > 0) {
      this.setState({
        visibleNearFutureDeleteModal: false,
        visibleSameNameAndGenderModal: false,
      });
      console.log(arr);

      dispatch({
        type: 'clzss/addClassMoveStudents',
        payload: arr,
        callback: res => {
          const x = typeof res === 'string' ? JSON.parse(res) : res;
          const { responseCode, data } = x;
          if (responseCode === '200') {
            that.getNaturalClass();
            const result = arr.filter(vo => vo.mergeStudentId !== '');
            if (result.length > 0) {
              this.setState({
                visibleMergeSucess: true,
              });
            } else {
              message.success(formatMessage(messages.addStudentOk));
            }
          } else {
            message.error(data);
          }
        },
      });
    }
  };

  // 添加学生回调方法
  addingStudentMethod = (studentsArr, params) => {
    const { dispatch } = this.props;
    const { curItem } = this.state;
    console.log(this.onceDeleteData, studentsArr, params);
    if (this.onceDeleteData && this.onceDeleteData.length > 0) {
      console.log(this.onceDeleteData);
      params = {
        campusId: localStorage.getItem('campusId'),
        gender: this.onceDeleteData[0].select.gender,
        isTransient: this.onceDeleteData[0].select.isTransient,
        name: this.onceDeleteData[0].name,
        naturalClassId: curItem.naturalClassId,
        studentClassCode: this.onceDeleteData[0].studentClassCode,
        id: this.onceDeleteData[0].select.id,
      };
    }
    studentsArr.push(params);
    if (studentsArr && studentsArr.length > 0) {
      dispatch({
        type: 'clzss/addClassStudents',
        payload: studentsArr,
        callback: res => {
          if (res === 'SUCCESS' || res.responseCode === '200') {
            this.getNaturalClass();
            message.success(formatMessage(messages.addSuccess));
          } else {
            message.error(formatMessage(messages.addFailure));
          }
        },
      });
    }
  };

  // 多个学生标记调出方法
  multipleCalloutsMethod = () => {
    const { selectedStudents, curItem } = this.state;
    const { dispatch, location } = this.props;
    const paramsArr = [];
    const adminId = location.state ? location.state.adminId : '';
    if (!selectedStudents || (selectedStudents && selectedStudents.length === 0)) {
      message.warning(formatMessage(messages.chooseStudentsFirst));
      return false;
    }
    if (selectedStudents && selectedStudents.length > 0) {
      selectedStudents.forEach(item => {
        const params = {
          naturalClassId: curItem.naturalClassId || adminId,
          studentId: item.studentId,
          studentClassCode: item.studentClassCode,
        };
        paramsArr.push(params);
      });
      dispatch({
        type: 'clzss/updateStudentsMark',
        payload: paramsArr,
        callback: res => {
          if (res === 'SUCCESS' || res.responseCode === '200') {
            setTimeout(() => {
              this.setState({
                selectedStudents: [],
                selectedRowKeys: [],
              });
            }, 500);
            this.getNaturalClass();
            message.success(formatMessage(messages.callOutSuccess));
          } else {
            message.error(formatMessage(messages.callOutFail));
          }
        },
      });
    }
  };

  // 标记调出(单条数据)
  markOutMethod = text => {
    const paramsArr = [];
    const { curItem } = this.state;
    const { dispatch, location } = this.props;
    const adminId = location.state ? location.state.adminId : '';
    const params = {
      naturalClassId: curItem.naturalClassId || adminId,
      studentId: text.studentId,
      studentClassCode: text.studentClassCode,
    };
    if (curItem.lastDays === 0 || curItem.lastDays === null) {
      return false;
    }
    paramsArr.push(params);
    dispatch({
      type: 'clzss/updateStudentsMark',
      payload: paramsArr,
      callback: res => {
        if (res === 'SUCCESS' || res.responseCode === '200') {
          this.getNaturalClass();
          message.success(formatMessage(messages.callOutSuccess));
        } else {
          message.error(formatMessage(messages.callOutFail));
        }
      },
    });
  };

  // 删除学生弹框组件
  delStudentModalVisible = (flag, text) => {
    const { location } = this.props;
    const { curItem } = this.state;
    if (curItem.lastDays === 0 || curItem.lastDays === null) {
      return false;
    }
    this.setState({
      visibleDelStudentModal: !!flag,
      currentStudent: text,
    });
  };

  // 申请退学弹框组件
  dropOutModalVisible = (flag, text) => {
    this.setState({
      visibleDropOutModal: !!flag,
      currentStudent: text,
    });
  };

  // 保存调入的学生列表
  saveCheckedListData = data => {
    this.setState({ checkedList: data, visibleSwithToModal: true });
  };

  // 关闭转入学生确认弹窗
  hideSwithToModal = () => {
    this.setState({
      visibleSwithToModal: false,
    });
  };

  // 点击面包屑跳转到行政班页面
  gotoAdmin = item => {
    const { location } = this.props;
    const curItem = location.state ? location.state.curItem : '';
    router.push({
      pathname: `/classallocation/classmanage/admin/${item.naturalClassId ||
        curItem.naturalClassId}`,
    });
  };

  // 筛选科目

  handleSearch = value => {
    this.setState({ subjectSelect: value });
    const { dispatch, adminStudents } = this.props;
    const students = adminStudents.filter(item => {
      if (item.teachingClass.length > 0) {
        return item.teachingClass.map(vo => {
          console.log(vo.subjectId === value);
          return vo.subjectId === value;
        });
      }
      return false;
    });
    if (value !== '') {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterNaturalClass: students,
        },
      });
    } else {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterNaturalClass: adminStudents,
        },
      });
    }
  };

  // 关闭合并成功弹窗
  hideMergeSucess = () => {
    this.setState({
      visibleMergeSucess: false,
    });
  };

  // jsx语法视图渲染
  render() {
    const {
      filterNaturalClass,
      adminStudents,
      adminTeacherList,
      naturalClass,
      location,
      currentNaturalTeach,
      loading,
      adminLastDays,
    } = this.props;
    const {
      restoreName,
      onceStudentsArr,
      onceParams,
      visibleNearFutureDeleteModal,
      visibleonceDeletedModal,
      visibleSameNameAndGenderModal,
      duplicateName,
      currentStudent,
      selectedRowKeys,
      curItem,
      visibleTeacherModal,
      editTeachers,
      visibleDelModal,
      visibleAddModal,
      visibleAddStudentModal,
      visibleTransferStudentModal,
      visibleCancelMarkModal,
      visibleDelStudentModal,
      visibleDropOutModal,
      visibleSwithToModal,
      delTeacher,
      checkedList,
      subjectSelect,
      visibleMergeSucess,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      onSelection: this.onSelection,
    };
    const adminId = location.state ? location.state.adminId : '';
    const teachingClass = location.state ? location.state.teachingClass || [] : [];
    console.log(restoreName);
    const subjectFilter = [];
    if (teachingClass.length > 0) {
      teachingClass.forEach(vo => {
        subjectFilter.push({
          text: vo.subjectName,
          value: vo.subjectId,
        });
      });
    }
    function subjectShow(data) {
      console.log(data);
      console.log(subjectFilter.filter(vo => vo.value === data.subjectId));
      return subjectFilter.filter(vo => vo.value === data.subjectId);
    }
    const ShowBtnMessage = () => (
      <div>
        {curItem.lastDays === 0 || curItem.lastDays === null ? (
          <div style={{ width: '190px', height: '36px', 'line-height': '18px' }}>
            <div>
              <div style={{ fontSize: 13 }}>
                {formatMessage({
                  id: 'app.text.Non-AlternatingPeriodNotOperating',
                  defaultMessage: '非异动期不可操作，如需操作',
                })}
                ，
              </div>
              <div style={{ fontSize: 13 }}>
                {formatMessage({
                  id: 'app.text.Pleasecontacttheadministratortoopenthechange',
                  defaultMessage: '请联系管理员开启异动',
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
    const columns = [
      {
        title: formatMessage({ id: 'app.text.classManage.student', defaultMessage: '学生' }),
        defaultSortOrder: 'descend',

        render: text => (
          <div className={styles.studentNames}>
            <UserAvatar avatar={avatar} id={text.accountId} />
            <span>{text.studentName}</span>
          </div>
        ),
      },
      {
        title: formatMessage({
          id: 'app.import.student.table.header.student.id',
          defaultMessage: '班内学号',
        }),
        defaultSortOrder: 'descend',
        key: 'studentClassCode',
        sorter: (a, b) => a.studentClassCode - b.studentClassCode,

        render: text => (
          <div>
            {text.studentClassCode}
            {text.isMark === 'Y' ? (
              <span style={{ padding: '0 4px', color: '#03C46B', fontSize: '14px' }}>T</span>
            ) : null}
          </div>
        ),
      },
      // {
      //   title: formatMessage({
      //     id: 'app.student.user.center.person.center.gender.title',
      //     defaultMessage: '性别',
      //   }),
      //   render: text => (
      //     <div>
      //       {text.gender === 'MALE' ? (
      //         <span>
      //           {formatMessage({ id: 'app.text.classManage.sex.male', defaultMessage: '男' })}
      //         </span>
      //       ) : (
      //         <span>
      //           {formatMessage({ id: 'app.text.classManage.sex.female', defaultMessage: '女' })}
      //         </span>
      //       )}
      //     </div>
      //   ),
      // },
      {
        title: formatMessage({
          id: 'app.text.classManage.Borrowing.status',
          defaultMessage: '借读状态',
        }),
        dataIndex: 'isTransient',
        key: 'isTransient',
        render: text => (
          <div>
            {text === 'Y' ? (
              <span>
                {formatMessage({ id: 'app.menu.learngroup.jiedu', defaultMessage: '借读' })}
              </span>
            ) : (
              <span />
            )}
          </div>
        ),
      },

      {
        title: formatMessage({ id: 'app.menu.learngroup.learn.name', defaultMessage: '学科' }),
        filterIcon: () => <i className="iconfont icon-funnel" />,
        filterDropdown: () => (
          <div>
            <List
              dataSource={subjectFilter}
              className={styles.subjectList}
              renderItem={item => (
                <List.Item
                  onClick={() => this.handleSearch(item.value)}
                  className={subjectSelect === item.value ? styles.subJectselected : ''}
                >
                  <div className={styles.cardItemContent}>{item.text}</div>
                </List.Item>
              )}
            />

            <a onClick={() => this.handleSearch('')} size="small" className={styles.deleteAll}>
              {formatMessage({ id: 'app.text.classManage.clearAll', defaultMessage: '清空' })}
            </a>
          </div>
        ),
        render: text => {
          if (text.teachingClass.length > 0) {
            return (
              subjectShow(text.teachingClass[0]).length > 0 &&
              subjectShow(text.teachingClass[0])[0].text
            );
          }
        },
      },
      {
        title: formatMessage({ id: 'app.text.classManage.state', defaultMessage: '状态' }),
        render: text => (
          <div>
            {text.bindStatus === 'BIND' && text.phone ? (
              <span>
                {formatMessage({ id: 'app.text.classManage.bind', defaultMessage: '绑定' })}：
                {text.phone}
              </span>
            ) : (
              <span>
                {formatMessage({ id: 'app.text.classManage.noBind', defaultMessage: '未绑定' })}
              </span>
            )}
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'app.text.classManage.operation', defaultMessage: '操作' }),
        render: text => (
          <Fragment>
            {text.isApplyQuit && text.isApplyQuit === 'Y' ? (
              <a
                className={
                  curItem.lastDays === 0 || curItem.lastDays === null ? styles.notSubmint : ''
                }
                hidden={text.bindStatus === 'UNBIND' || text.bindStatus === null}
                style={{ color: '#d5d5d5', cursor: 'default' }}
              >
                {formatMessage({
                  id: 'app.text.classManage.Apply.dropout',
                  defaultMessage: '申请退学',
                })}
              </a>
            ) : (
              <a
                // className={(adminLastDays === 0 || adminLastDays === null) ? styles.notSubmint : ''}
                hidden={text.bindStatus === 'UNBIND' || text.bindStatus === null}
                onClick={() => {
                  this.dropOutModalVisible(true, text);
                }}
              >
                {formatMessage({
                  id: 'app.text.classManage.Apply.dropout',
                  defaultMessage: '申请退学',
                })}
              </a>
            )}

            <Divider
              type="vertical"
              hidden={text.bindStatus === 'UNBIND' || text.bindStatus === null}
            />
            <Tooltip
              placement="top"
              title={curItem.lastDays === 0 || curItem.lastDays === null ? <ShowBtnMessage /> : ''}
            >
              <a
                className={
                  curItem.lastDays === 0 || curItem.lastDays === null ? styles.notSubmint : ''
                }
                hidden={text.bindStatus === 'BIND'}
                onClick={() => {
                  this.delStudentModalVisible(true, text);
                }}
              >
                {formatMessage({
                  id: 'app.menu.classallocation.del.toast',
                  defaultMessage: '删除',
                })}
              </a>
            </Tooltip>
            <Divider type="vertical" hidden={text.bindStatus === 'BIND'} />
            {text.isMark === 'N' ? (
              <Tooltip
                placement="top"
                title={
                  curItem.lastDays === 0 || curItem.lastDays === null ? <ShowBtnMessage /> : ''
                }
              >
                <a
                  className={
                    curItem.lastDays === 0 || curItem.lastDays === null ? styles.notSubmint : ''
                  }
                  onClick={() => {
                    this.markOutMethod(text);
                  }}
                >
                  {formatMessage({
                    id: 'app.text.classManage.Mark.callout',
                    defaultMessage: '标记调出',
                  })}
                </a>
              </Tooltip>
            ) : null}

            {text.isMark === 'Y' ? (
              <Tooltip
                placement="top"
                title={
                  curItem.lastDays === 0 || curItem.lastDays === null ? <ShowBtnMessage /> : ''
                }
              >
                <a
                  className={
                    curItem.lastDays === 0 || curItem.lastDays === null ? styles.notSubmint : ''
                  }
                  onClick={() => {
                    this.cancelMarkModalVisible(true, text);
                  }}
                >
                  {formatMessage({
                    id: 'app.menu.classmanage.cancelMark',
                    defaultMessage: '取消标记',
                  })}
                </a>
              </Tooltip>
            ) : null}
          </Fragment>
        ),
      },
    ];
    return (
      <div className={styles.classWork}>
        <h1 className={styles.menuName}>
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          {(currentNaturalTeach.alias || currentNaturalTeach.className) && (
            <span onClick={() => this.gotoAdmin(curItem)}>
              {currentNaturalTeach.alias || currentNaturalTeach.className}
              <i>/</i>
            </span>
          )}
          {formatMessage(messages.classwork)}
        </h1>
        <HeadNews lastDays={naturalClass.lastDays} />
        {/* 删除学生弹框组件 */}
        <DelStudentModal
          visibleModal={visibleDelStudentModal}
          currentStudent={currentStudent}
          naturalClassId={curItem.naturalClassId || adminId}
          hideModal={this.delStudentModalVisible}
        />
        {/* 申请退学弹框组件 */}
        <DropOutSchoolModal
          visibleModal={visibleDropOutModal}
          currentStudent={currentStudent}
          naturalClassId={curItem.naturalClassId || adminId}
          hideModal={this.dropOutModalVisible}
        />
        {/* 曾经删除的弹框组件 */}
        {visibleonceDeletedModal && (
          <OnceDeletedModal
            visibleModal={visibleonceDeletedModal}
            restoreName={restoreName}
            hideModal={this.onceDeletedModalVisible}
            onCancel={() => {
              this.setState({
                visibleonceDeletedModal: false,
              });
            }}
            onOK={onceDeleteData => {
              this.onceDeleteData = onceDeleteData;
              this.setState({
                visibleonceDeletedModal: false,
              });
              this.addingStudentMethod(onceStudentsArr, onceParams);
            }}
          />
        )}
        {/* 取消标记弹框组件 */}
        <CancelMarkModal
          visibleModal={visibleCancelMarkModal}
          currentStudent={currentStudent}
          studentList={filterNaturalClass}
          naturalClassId={curItem.naturalClassId || adminId}
          hideModal={this.cancelMarkModalVisible}
        />
        {/* 调入学生弹框组件 */}
        <TransferStudentsModal
          visibleModal={visibleTransferStudentModal}
          hideModal={this.transferStudentModalVisible}
          id={curItem.naturalClassId || adminId}
          subjectId={curItem.subjectId}
          curItem={curItem}
          saveCheckedList={data => {
            this.saveCheckedListData(data);
          }}
        />
        {/* 同名同性弹框组件 */}
        {visibleSameNameAndGenderModal && (
          <SameNameAndGenderModal
            visibleModal={visibleSameNameAndGenderModal}
            duplicateName={duplicateName}
            restoreName={restoreName}
            nearFutureDeleteModalVisible={this.nearFutureDeleteModalVisible}
            addClassMoveStudents={this.addClassMoveStudents}
            onOK={recoveryData => {
              console.log(recoveryData);
              this.recoveryData = recoveryData;
              this.addClassMoveStudents();
            }}
            hideModal={this.sameNameAndGenderModalVisible}
          />
        )}
        {/* 同名同性弹框组件 */}
        {visibleMergeSucess && (
          <MergeSuccess
            visibleModal={visibleMergeSucess}
            restoreName={checkedList}
            hideModal={this.hideMergeSucess}
          />
        )}

        {/* 近期删除学生提示弹窗  */}
        {visibleNearFutureDeleteModal && (
          <NearFutureDeleteModal
            visible={visibleNearFutureDeleteModal}
            restoreName={restoreName}
            onCancel={() => {
              this.setState({
                visibleNearFutureDeleteModal: false,
              });
            }}
            onOK={recoveryData => {
              console.log(this.recoveryData);
              this.recoveryData =
                this.recoveryData && this.recoveryData.length > 0
                  ? this.recoveryData.concat(recoveryData)
                  : recoveryData;
              this.setState({
                visibleNearFutureDeleteModal: false,
              });
              this.addClassMoveStudents();
            }}
          />
        )}
        {visibleSwithToModal && (
          <SwithTo
            visibleModal={visibleSwithToModal}
            hideModal={this.hideSwithToModal}
            nearFutureDeleteModalVisible={this.nearFutureDeleteModalVisible}
            sameNameAndGenderModalVisible={this.sameNameAndGenderModalVisible}
            id={curItem.naturalClassId || adminId}
            studentList={checkedList || []}
            saveCheckedList={data => {
              this.saveCheckedListData(data);
            }}
          />
        )}
        {/* 添加学生弹框组件 */}
        {visibleAddStudentModal && (
          <AddStudentModal
            visibleModal={visibleAddStudentModal}
            naturalClassId={curItem.naturalClassId || adminId}
            onceDeletedModalVisible={this.onceDeletedModalVisible}
            hideModal={this.addStudentModalVisible}
          />
        )}
        {/* 添加老师弹框组件 */}
        <AddTeacherModal
          visibleModal={visibleAddModal}
          naturalClassId={curItem.naturalClassId || adminId}
          hideModal={this.addModalVisible}
        />
        {/* 删除老师弹框组件 */}
        {delTeacher && (
          <DelTeacherModal
            visibleModal={visibleDelModal}
            naturalClassId={curItem.naturalClassId || adminId}
            teacher={delTeacher}
            hideModal={this.delModalVisible}
          />
        )}
        {/* 编辑老师弹框组件 */}
        {editTeachers && (
          <EditorTeacherModal
            visibleModal={visibleTeacherModal}
            teacher={editTeachers}
            naturalClassId={curItem.naturalClassId || adminId}
            hideModal={this.teacherModalVisible}
          />
        )}
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <WorkContent
            teacherModalVisible={this.teacherModalVisible}
            delModalVisible={this.delModalVisible}
            addModalVisible={this.addModalVisible}
            addStudentModalVisible={this.addStudentModalVisible}
            transferStudentModalVisible={this.transferStudentModalVisible}
            multipleCalloutsMethod={this.multipleCalloutsMethod}
            teacherList={adminTeacherList}
            naturalClassId={curItem.naturalClassId || adminId}
            curItem={curItem}
          />
          <div className={styles.students}>
            {adminStudents && adminStudents.length > 0 && (
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filterNaturalClass}
                pagination={false}
              />
            )}

            {/* 空数据显示组件 */}
            {(filterNaturalClass.length === 0 || adminStudents.length === 0) && (
              <ClassWorkNoData
                curSelected="noAdmin"
                curItem={curItem}
                naturalClassId={curItem.naturalClassId || adminId}
                addStudentModalVisible={this.addStudentModalVisible}
                transferStudentModalVisible={this.transferStudentModalVisible}
                curAdminlist="adminNolist"
              />
            )}
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default ClassWork;
