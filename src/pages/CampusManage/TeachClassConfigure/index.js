/* eslint-disable no-param-reassign */
import React, { Component } from 'react';
import Dimensions from 'react-dimensions';
import { Menu, List, Button, Popover, Checkbox, Radio, message, Modal, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Pagination from '@/components/Pagination/index';
import NoviceNavigation from '../Components/NoviceNavigation/index';
import SearchBar from '@/components/SearchBar';
import ClassItem from '../Components/ClassItem/index';
import ManagerAvatarH from '../Components/ManagerAvatarH/index';
import managerPic from '@/assets/campus/manager.png';
import NoData from '@/components/NoData';

const messages = defineMessages({
  moreBtnTit: { id: 'app.campus.manage.class.config.more.btn.title', defaultMessage: '展开更多' },
  swapTip1: {
    id: 'app.campus.manage.class.config.swap.tip1',
    defaultMessage: '距离异动期结束还剩',
  },
  lastDay: { id: 'app.campus.manage.class.config.last.day', defaultMessage: '最后一天' },
  day: { id: 'app.campus.manage.class.config.day', defaultMessage: '天' },
  settingTit: { id: 'app.campus.manage.basic.setting.title', defaultMessage: '设置' },
  teachingClassTit: { id: 'app.teacher.home.teaching.class.title', defaultMessage: '教学班' },
  swapTip2: { id: 'app.campus.manage.class.config.swap.tip2', defaultMessage: '学生异动期' },
  swapTip3: {
    id: 'app.campus.manage.teaching.class.config.swap.tip3',
    defaultMessage: '教学班校区异动已开启，距离结束还剩',
  },
  isAllowSwapTit: {
    id: 'app.campus.manage.class.config.is.allow.swap.title',
    defaultMessage: '是否允许进行跨年级学生异动',
  },
  swapOption1: { id: 'app.campus.manage.class.config.swap.option1', defaultMessage: '允许' },
  swapOption2: { id: 'app.campus.manage.class.config.swap.option2', defaultMessage: '不允许' },
  cancle: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确认' },
  studentSwapTit: { id: 'app.campus.manage.class.student.swap.title', defaultMessage: '学生异动' },
  searchPlaceholder: {
    id: 'app.campus.manage.class.search.placeholder',
    defaultMessage: '请输入教师姓名进行搜索',
  },
  classN: { id: 'app.campus.manage.basic.class', defaultMessage: '班' },
  dissolutionClassTip1: {
    id: 'app.campus.manage.basic.class.dissolution.tip1',
    defaultMessage: '确认解散',
  },
  dissolutionBtnTit: {
    id: 'app.campus.manage.basic.class.dissolution.btn.title',
    defaultMessage: '解散',
  },
  dissolutionSuccess: {
    id: 'app.campus.manage.basic.class.dissolution.success',
    defaultMessage: '解散成功！',
  },
  dissolutionModalTip1: {
    id: 'app.campus.manage.basic.class.dissolution.modal.tip1',
    defaultMessage: '还有学生数据，请先通知班级负责人调班后，再解散。',
  },
  iKnow: {
    id: 'app.campus.manage.basic.class.dissolution.modal.btn.title',
    defaultMessage: '知道了',
  },
  swapModalTip1: { id: 'app.campus.manage.basic.class.swap.modal.tip1', defaultMessage: '将开启' },
  swapModalTip2: {
    id: 'app.campus.manage.basic.class.swap.modal.tip2',
    defaultMessage: '的本班学生异动期，在此期间内可进行学生导入和调班异动处理，确定开启吗？',
  },
  startSwapBtnTit: {
    id: 'app.campus.manage.basic.class.swap.modal.btn.title',
    defaultMessage: '开启',
  },
  startSwapSuccess: {
    id: 'app.campus.manage.basic.class.start.swap.success',
    defaultMessage: '班级异动开启成功！',
  },
  saveMoveSuccess: {
    id: 'app.campus.manage.basic.class.save.move.success',
    defaultMessage: '保存成功！',
  },
  replaceModalTip1: { id: 'app.campus.manage.basic.class.replace.tip1', defaultMessage: '您选择' },
  replaceModalTip2: { id: 'app.campus.manage.basic.class.replace.tip2', defaultMessage: '替换' },
  replaceModalTip3: { id: 'app.campus.manage.basic.class.replace.tip3', defaultMessage: '作为' },
  replaceModalTip4: {
    id: 'app.campus.manage.basic.class.replace.tip4',
    defaultMessage: '的负责人，确定替换吗',
  },
  replaceBtnTit: { id: 'app.campus.manage.basic.class.replace.btn.title', defaultMessage: '替换' },
  manageConfigSuccess: {
    id: 'app.campus.manage.basic.class.set.manager.success',
    defaultMessage: '班级管理员配置成功！',
  },
  swapTip: {
    id: 'app.teacher.home.swap.hover.tip',
    defaultMessage:
      '异动期内开放添加，批量导入学生，从其他班级调入学生，删除学生，如有学生变动，请在异动期结束之前处理。',
  },
  noneTip: { id: 'app.campus.manage.basic.class.teacher.none.tip', defaultMessage: '未找到该教师' },
  campusManage: { id: 'app.menu.campusmanage', defaultMessage: '校区管理' },
});

@connect(({ campusmanage, loading, login }) => {
  const {
    gradList,
    teachClassList,
    teachingTeacherList,
    teachingTotal,
    classDicList,
    classSwapInfo,
    allSubject,
  } = campusmanage;
  const { campusList } = login;
  const teacherLoading = loading.effects['campusmanage/teachingTeacherList'];

  // 处理用户角色为 非管理员 && 学科管理员 年级权限
  // const campusId = localStorage.getItem('campusId');
  // const currentCampus = campusList.find(tag => tag.campusId === campusId);

  // const subjectManagerGradeList = [];
  // if (currentCampus && currentCampus.gradeList) {
  //   currentCampus.gradeList.forEach(tag => {
  //     const obj = gradList.find(item => item.grade === tag.grade);
  //     if (obj) {
  //       subjectManagerGradeList.push(obj);
  //     }
  //   });
  // }

  return {
    gradList,
    teachClassList,
    teachingTeacherList,
    teachingTotal,
    classDicList,
    classSwapInfo,
    allSubject,
    teacherLoading,
    campusList,
  };
})
class ClassConfigure extends Component {
  allClassList = []; // 所有班级列表

  state = {
    showNoviceNavigation: false, // 新手导航显示
    isFirstGrade: true,
    initLoading: true,
    // loading: false,
    currentGradeId: '',
    currentGradeCode: '',
    currentGradeValue: '',
    currentPage: 1,
    pageSize: 20,
    teacherL: [],
    classList: [], // 处理后的班级列表展示数据
    radioDisabled: true, // 全局异动设置中的radio控制
    swapDays: null, // 异动天数
    lastDays: null, // 剩余多少天
    swapGradeStatus: '', // 是否全校异动
    sureSwapBtnDisabled: true, // 异动pop的确认按钮
    setBtnDisabled: false, // 设置按钮是否可用
    checkboxCheck: false, // 设置按钮是否选中
    subjectCode: '', // 学科code
    subjectId: '', // 学科ID
    subjectName: '', // 学科名称
    isOpen: false,
    filterWord: '',
    isSearch: false,
    clickTeacher: null,
  };

  componentWillMount() {
    this.getAllSubject();
    this.getClassSwap();
    this.getClassDicList();
    this.getTeacherList();
  }

  // 获取校区学科
  getAllSubject = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'campusmanage/allSubject',
      payload: {},
      callback: res => {
        // console.log(res);
        if (res && res.responseCode === '200') {
          const { data } = res;
          if (data.length > 0) {
            // 默认取第一条数据
            const subject = data[0];
            const { subjectCode, id, name } = subject;
            this.setState({
              subjectCode,
              subjectId: id,
              subjectName: name,
            });
          }
          this.getGrade();
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  // 获取班级异动情况
  getClassSwap = () => {
    const { dispatch } = this.props;
    const params = {
      classType: 'TEACHING_CLASS',
    };
    dispatch({
      type: 'campusmanage/classSwap',
      payload: params,
      callback: res => {
        // console.log(res);
        const { swapDays, swapGradeStatus, lastDays } = res.data;
        this.setState({
          swapDays,
          swapGradeStatus,
          lastDays,
          setBtnDisabled: lastDays && Number(lastDays) > 0,
          checkboxCheck: lastDays && Number(lastDays) > 0,
          radioDisabled: lastDays && Number(lastDays) > 0,
        });
      },
    });
  };

  // 班级数据字典
  getClassDicList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'campusmanage/classDic',
      payload: {},
    });
  };

  // 查询年级
  getGrade = () => {
    const { dispatch } = this.props;

    // 处理用户角色为 非管理员 && 学科管理员 年级权限
    const isAdmin = localStorage.getItem('isAdmin');
    const isSubjectAdmin = localStorage.getItem('isSubjectAdmin');

    const params = {};
    if (isAdmin === 'false' && isSubjectAdmin === 'true') {
      // 非管理员、学科管理员角色
      // eslint-disable-next-line dot-notation
      params['teacherId'] = localStorage.getItem('teacherId');
    }

    dispatch({
      type: 'campusmanage/allGrade',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const dataJson = res.data;

          const managerGradeId = dataJson.length > 0 ? dataJson[0].id : '';
          const managerGradeCode = dataJson.length > 0 ? dataJson[0].grade : '';
          const managerGradeValue = dataJson.length > 0 ? dataJson[0].gradeValue : '';

          const gradeId = managerGradeId;
          const gradeCode = managerGradeCode;
          const gradeValue = managerGradeValue;
          this.setState(
            {
              currentGradeId: gradeId,
              currentGradeCode: gradeCode,
              currentGradeValue: gradeValue,
              isFirstGrade: true,
            },
            () => {
              this.getNaturalClass();
            }
          );
        }
      },
    });
  };

  // 查询班级列表
  getNaturalClass = () => {
    const { dispatch } = this.props;

    const { currentGradeId, subjectId, isOpen } = this.state;
    const campusId = localStorage.getItem('campusId');
    const params = {
      gradeId: currentGradeId,
      campusId,
      subjectId,
    };

    dispatch({
      type: 'campusmanage/teacheClassList',
      payload: params,
      callback: data => {
        const { classDicList } = this.props;
        // 1.根据班级字典数据 初始化班级展示数据
        const showData = [];
        classDicList.forEach(it => {
          const classObj = {
            name: '', // 班级别名
            classIndex: it.code, // 班级序号
            grade: '', // 年级
            gradeId: '', // 年级ID
            lastDays: null, // 是否异动
            teachingClassId: '', // 行政班ID
            teacherId: '', // 教师ID
            teacherName: '', // 教师姓名
          };
          showData.push(classObj);
        });
        // 2. 根据已配置管理员的数据处理数据
        if (data.length > 0) {
          data.forEach(it => {
            showData.forEach(obj => {
              if (it.classIndex === obj.classIndex) {
                obj.name = it.name;
                obj.grade = it.grade;
                obj.gradeId = it.gradeId;
                obj.lastDays = it.lastDays;
                obj.teachingClassId = it.teachingClassId;
                obj.teacherId = it.teacherId;
                obj.teacherName = it.teacherName;
              }
            });
          });
        }

        this.allClassList = showData;
        const arr = showData.slice(0, 20);
        this.setState({
          classList: isOpen ? showData : arr,
          initLoading: false,
        });
      },
    });
  };

  // 查询老师列表
  getTeacherList = () => {
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const { pageSize, currentPage, filterWord, isSearch } = this.state;
    const params = {
      pageIndex: isSearch ? 1 : currentPage,
      pageSize,
      campusId,
      filterWord,
    };
    dispatch({
      type: 'campusmanage/teachingTeacherList',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const list = res.data.records;
          this.setState({
            teacherL: list,
          });
        }
      },
    });
  };

  // 绑定管理员
  bingManager = (teacherId, item) => {
    const { dispatch } = this.props;
    // eslint-disable-next-line no-unused-vars
    const {
      currentGradeId,
      currentGradeCode,
      currentGradeValue,
      // eslint-disable-next-line no-unused-vars
      subjectCode,
      subjectId,
      subjectName,
    } = this.state;
    const campusId = localStorage.getItem('campusId');
    const name = `${currentGradeValue}${subjectName}${item.classIndex}`;
    this.setState({
      initLoading: true,
    });
    const params = {
      gradeId: currentGradeId, // 年级ID
      grade: currentGradeCode, // 年级code
      campusId, // 校区ID ,
      classIndex: item.classIndex, // 班级序号 class字典的code
      teacherId, // 教师ID
      teachingClassId: item.teachingClassId, // 行政班ID
      name, // 班级名称 规则：年级+学科+班级序号
      subjectId, // 科目ID
    };
    dispatch({
      type: 'campusmanage/bingTeachingClassManager',
      payload: params,
      callback: () => {
        const mgs = formatMessage(messages.manageConfigSuccess);
        message.success(mgs);
        // 成功后重新拉取班级列表处理数据
        this.getNaturalClass();
        this.getTeacherList();
        this.setState({
          initLoading: false,
        });
      },
    });
  };

  // 班级卡片监听拖拽结束
  handleDropEnd = (teacherObj, item) => {
    // console.log(teacherObj,item);
    if (item.teacherId) {
      // 之前已绑定过老师
      const newTeacher = teacherObj.teacherName;
      const oldTeacher = item.teacherName;
      const classN = formatMessage(messages.classN);
      const { currentGradeValue } = this.state;
      const classNumber = Number(item.classIndex);
      const className = `${currentGradeValue}(${classNumber})${classN}`;
      Modal.confirm({
        content: (
          <div className="cont">
            <span>{formatMessage(messages.replaceModalTip1)}</span>
            <span className="name">{newTeacher}</span>
            <span>{formatMessage(messages.replaceModalTip2)}</span>
            <span className="name">{oldTeacher}</span>
            <span>{formatMessage(messages.replaceModalTip3)}</span>
            <span className="name">{className}</span>
            <span>{formatMessage(messages.replaceModalTip4)}？</span>
          </div>
        ),
        okText: formatMessage(messages.replaceBtnTit),
        centered: true,
        cancelText: formatMessage(messages.cancle),
        onOk: () => {
          this.bingManager(teacherObj.teacherId, item);
        },
      });
    } else {
      this.bingManager(teacherObj.teacherId, item);
    }
  };

  // 切换年级
  handleGradeClick = item => {
    // console.log('click ', item.key);
    const { gradList } = this.props;
    const gradeObj = gradList.find(obj => obj.id === item.key);
    const { grade, gradeValue, id } = gradeObj;
    const firstGrade = gradList[0];
    let isFirstGrade;
    if (item.key === firstGrade.id) {
      isFirstGrade = true;
    } else {
      isFirstGrade = false;
    }
    this.setState(
      {
        currentGradeCode: grade,
        currentGradeId: id,
        currentGradeValue: gradeValue,
        isOpen: false,
        isFirstGrade,
        initLoading: true,
      },
      () => {
        this.getNaturalClass();
      }
    );
  };

  // 设置异动
  onSetMoveChange = e => {
    if (e.target.checked) {
      this.setState(
        {
          radioDisabled: false,
          checkboxCheck: e.target.checked,
        },
        () => {
          this.checkSureBtn();
        }
      );
    } else {
      this.setState(
        {
          radioDisabled: true,
          checkboxCheck: e.target.checked,
        },
        () => {
          this.checkSureBtn();
        }
      );
    }
  };

  // 取消
  cancelSetMove = () => {
    this.setState(
      {
        swapGradeStatus: '',
        swapDays: null,
        radioDisabled: true,
        checkboxCheck: false,
      },
      () => {
        this.checkSureBtn();
      }
    );
  };

  // 全局异动设置
  saveSetMove = () => {
    const { dispatch } = this.props;
    const { swapDays, swapGradeStatus } = this.state;
    const campusId = localStorage.getItem('campusId');
    const params = {
      campusId,
      classId: '',
      classType: 'TEACHING_CLASS',
      swapDays,
      swapGradeStatus,
    };
    dispatch({
      type: 'campusmanage/startClassSwap',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const mgs = formatMessage(messages.saveMoveSuccess);
          message.success(mgs);
          this.getClassSwap();
          this.getNaturalClass();
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  // 搜索教师
  handleValueChange = value => {
    // const list = this.sortTeacher(value);
    // this.setState({
    //   teacherL: list
    // })
    this.setState(
      {
        // eslint-disable-next-line no-unneeded-ternary
        filterWord: value ? value : '', // value为undefind时请求api filterWord没传，导致接口报错
        isSearch: true,
      },
      () => {
        this.getTeacherList();
      }
    );
  };

  // 本地搜索
  sortTeacher = value => {
    const { teachingTeacherList } = this.props;
    const list = [];
    teachingTeacherList.forEach(el => {
      if (el.teacherName.indexOf(value) !== -1) {
        const obj = list.length > 0 ? list.find(item => item.teacherId === el.teacherId) : null;
        if (!obj) {
          list.push(el);
        }
      }
    });
    return list;
  };

  // 教师分页
  onPageChange = e => {
    this.setState(
      {
        currentPage: e,
        isSearch: false,
      },
      () => {
        this.getTeacherList();
      }
    );
  };

  // 加载更多
  onLoadMore = () => {
    // console.log(this.allClassList);
    const data = JSON.parse(JSON.stringify(this.allClassList));
    const arr = data.splice(0, 50);
    this.setState({
      classList: arr,
      isOpen: true,
    });
  };

  // 开启本班异动
  startSwap = item => {
    const { dispatch } = this.props;
    Modal.confirm({
      content: (
        <div className="cont">
          <span>{formatMessage(messages.swapModalTip1)}</span>
          <span className="name">1{formatMessage(messages.day)}</span>
          <span>{formatMessage(messages.swapModalTip2)}</span>
        </div>
      ),
      okText: formatMessage(messages.startSwapBtnTit),
      centered: true,
      cancelText: formatMessage(messages.cancle),
      okButtonProps: {
        style: {
          'background-color': '#03C46B',
          'box-shadow': '0px 10px 50px 0px rgba(0,0,0,0.15)',
        },
      },
      onOk: () => {
        const campusId = localStorage.getItem('campusId');
        const params = {
          campusId,
          classId: item.teachingClassId,
          classType: 'TEACHING_CLASS',
          swapDays: 1,
          swapGradeStatus: 'N',
        };

        dispatch({
          type: 'campusmanage/startClassSwap',
          payload: params,
          callback: res => {
            if (res.responseCode === '200') {
              const mgs = formatMessage(messages.startSwapSuccess);
              message.success(mgs);
              this.getNaturalClass();
            } else {
              const mgs = res.data;
              message.warning(mgs);
            }
          },
        });
      },
    });
  };

  // 解除本班
  dissolutionClass = item => {
    // console.log(item);

    const { dispatch } = this.props;
    const { currentGradeValue } = this.state;
    const classNumber = Number(item.classIndex);
    const classN = formatMessage(messages.classN);
    const className = `${currentGradeValue}(${classNumber})${classN}`;

    Modal.confirm({
      content: (
        <div className="cont">
          <span>{formatMessage(messages.dissolutionClassTip1)}</span>
          <span className="name">{className}</span>
          <span>?</span>
        </div>
      ),
      okText: formatMessage(messages.dissolutionBtnTit),
      centered: true,
      cancelText: formatMessage(messages.cancle),
      onOk: () => {
        const params = {
          teachingClassId: item.teachingClassId,
        };
        dispatch({
          type: 'campusmanage/dissolutionTeachClass',
          payload: params,
          callback: res => {
            if (res.responseCode === '200') {
              const mgs = formatMessage(messages.dissolutionSuccess);
              message.success(mgs);
              this.getNaturalClass();
              this.getTeacherList();
            } else if (res.responseCode === '460') {
              // 有学生数据
              Modal.confirm({
                content: (
                  <div className="cont">
                    <span className="name" style={{ paddingLeft: '0px' }}>
                      {className}
                    </span>
                    <span>{formatMessage(messages.dissolutionModalTip1)}</span>
                  </div>
                ),
                okText: formatMessage(messages.iKnow),
                centered: true,
                className: 'noStuModal',
                cancelText: '',
                cancelButtonProps: { style: { display: 'none' } },
                okButtonProps: {
                  style: {
                    backgroundColor: '#03C46B',
                    boxShadow: '0px 10px 50px 0px rgba(0,0,0,0.15)',
                  },
                },
                onOk: () => {},
              });
            } else {
              const mgs = res.data;
              message.warning(mgs);
            }
          },
        });
      },
    });
  };

  // 天数变更
  dayNumChange = e => {
    // console.log(`radio 天数:${e.target.value}`);
    this.setState(
      {
        swapDays: e.target.value,
      },
      () => {
        this.checkSureBtn();
      }
    );
  };

  // 是否允许
  allowChange = e => {
    // console.log(`radio 是否允许:${e.target.value}`);
    this.setState(
      {
        swapGradeStatus: e.target.value,
      },
      () => {
        this.checkSureBtn();
      }
    );
  };

  // 确定按钮的控制
  checkSureBtn = () => {
    const { swapGradeStatus, swapDays, checkboxCheck } = this.state;
    if (checkboxCheck && swapGradeStatus && swapDays && Number(swapDays) > 0) {
      this.setState({
        sureSwapBtnDisabled: false,
      });
    } else {
      this.setState({
        sureSwapBtnDisabled: true,
      });
    }
  };

  render() {
    const showTeacherClassNavigation = localStorage.getItem('showTeachingClassNavigation');
    const teacherId = localStorage.getItem('teacherId');
    const showClassNavi = `${teacherId}0`;
    if (!showTeacherClassNavigation || showTeacherClassNavigation !== showClassNavi) {
      this.state.showNoviceNavigation = true;
    }
    const { gradList, teachingTotal, teachClassList, containerWidth, teacherLoading } = this.props;

    const {
      showNoviceNavigation,
      initLoading,
      //  loading,
      currentGradeId,
      teacherL,
      currentPage,
      classList,
      pageSize,
      radioDisabled,
      sureSwapBtnDisabled,
      swapDays,
      swapGradeStatus,
      lastDays,
      setBtnDisabled,
      checkboxCheck,
      isOpen,
      isFirstGrade,
      clickTeacher,
    } = this.state;

    const loadMore =
      !initLoading && !isOpen ? (
        <div className={styles.loadMoreBtn} onClick={this.onLoadMore}>
          <i className="iconfont icon-link-arrow-down" />
          <span>{formatMessage(messages.moreBtnTit)}</span>
        </div>
      ) : null;

    let column = 4;
    if (containerWidth < 1450 && containerWidth >= 1235) {
      column = 3;
    } else if (containerWidth < 1235 && containerWidth > 1024) {
      column = 2;
    } else if (containerWidth < 1024 || containerWidth === 1024) {
      column = 1;
    }

    const day = formatMessage(messages.day);
    const content = (
      <div>
        {/* 异动显示 */}
        {lastDays && Number(lastDays) > 0 && (
          <div className={styles.showSwap}>
            <i className="iconfont icon-warning" />
            <span style={{ paddingLeft: '10px' }}>{formatMessage(messages.swapTip1)}</span>
            <span className={styles.tips2}>
              {Number(lastDays) === 1 ? formatMessage(messages.lastDay) : `${lastDays}${day}`}
            </span>
          </div>
        )}

        <div className={styles.setMoveTit}>
          <Checkbox
            onChange={this.onSetMoveChange}
            checked={checkboxCheck}
            disabled={setBtnDisabled}
          />
          <span>{formatMessage(messages.settingTit)}</span>
          <span className={styles.naturalClass}>{formatMessage(messages.teachingClassTit)}</span>
          <span>{formatMessage(messages.swapTip2)}</span>
        </div>
        <div>
          <Radio.Group
            value={swapDays}
            buttonStyle="solid"
            disabled={radioDisabled}
            onChange={this.dayNumChange}
          >
            <Radio.Button value={1}>1{day}</Radio.Button>
            <Radio.Button value={3}>3{day}</Radio.Button>
            <Radio.Button value={7}>7{day}</Radio.Button>
          </Radio.Group>
        </div>
        <div className={styles.setMoveTit}>{formatMessage(messages.isAllowSwapTit)}</div>
        <div>
          <Radio.Group
            value={swapGradeStatus}
            buttonStyle="solid"
            disabled={radioDisabled}
            onChange={this.allowChange}
          >
            <Radio.Button value="Y">{formatMessage(messages.swapOption1)}</Radio.Button>
            <Radio.Button value="N">{formatMessage(messages.swapOption2)}</Radio.Button>
          </Radio.Group>
        </div>
        {lastDays && Number(lastDays) > 0 ? null : (
          <div className={styles.btnPop}>
            <Button onClick={this.cancelSetMove}>{formatMessage(messages.cancle)}</Button>
            <Button onClick={this.saveSetMove} disabled={sureSwapBtnDisabled}>
              {formatMessage(messages.confirm)}
            </Button>
          </div>
        )}
      </div>
    );
    return (
      <div className={styles.classConfig}>
        <div className={styles.top}>
          <div className={styles.tit}>
            {formatMessage(messages.campusManage)}
            <span className={styles.division}>/</span>
            <span className={styles.subTit}>{formatMessage(messages.teachingClassTit)}</span>
          </div>
          <Popover content={content} overlayClassName={styles.pop}>
            <div className={styles.movement}>
              <i className="iconfont icon-set" />
              <span>{formatMessage(messages.studentSwapTit)}</span>
            </div>
          </Popover>
        </div>

        {/* 异动 */}
        {lastDays && Number(lastDays) > 0 && (
          <div className={styles.movementTip}>
            <span className={styles.tip1}>{formatMessage(messages.swapTip3)}</span>
            <span className={styles.tips2}>
              {Number(lastDays) === 1 ? formatMessage(messages.lastDay) : `${lastDays}${day}`}
            </span>
            <Tooltip placement="top" title={formatMessage(messages.swapTip)} arrowPointAtCenter>
              <i style={{ paddingLeft: '6px' }} className="iconfont icon-help" />
            </Tooltip>
          </div>
        )}

        <PageHeaderWrapper
          wrapperClassName={lastDays && Number(lastDays) > 0 ? styles.wrapperMain1 : 'wrapperMain'}
        >
          <div
            className={styles.classConfigCont}
            style={{ height: lastDays && Number(lastDays) > 0 ? 'calc(86vh - 50px)' : '86vh' }}
          >
            <div className={styles.gradeContainer}>
              <Menu
                mode="inline"
                theme="light"
                className={styles.gradeMenu}
                selectedKeys={[currentGradeId]}
                onClick={this.handleGradeClick}
              >
                {gradList.map(item => {
                  return <Menu.Item key={item.id}>{item.gradeValue}</Menu.Item>;
                })}
              </Menu>
            </div>
            <div
              className={styles.classContainer}
              style={lastDays && Number(lastDays) > 0 ? {} : { height: '82vh' }}
            >
              <List
                grid={{ gutter: 16, column }}
                className="demo-loadmore-list"
                loading={initLoading}
                itemLayout="horizontal"
                loadMore={loadMore}
                dataSource={classList}
                renderItem={item => (
                  <List.Item>
                    <ClassItem
                      item={item}
                      clickTeacher={clickTeacher}
                      onStartSwap={() => this.startSwap(item)}
                      onDissolutionClass={() => this.dissolutionClass(item)}
                      onDropEnd={teacherID => this.handleDropEnd(teacherID, item)}
                    />
                  </List.Item>
                )}
              />
            </div>
            <div className={styles.teacherContainer}>
              <div className={styles.search}>
                <SearchBar
                  placeholder={formatMessage(messages.searchPlaceholder)}
                  // onChange={(value)=>this.handleValueChange(value)}
                  onSearch={value => this.handleValueChange(value)}
                />
              </div>
              <div
                className={styles.teacherList}
                style={lastDays && Number(lastDays) > 0 ? {} : { height: '68vh' }}
              >
                {teacherL.length > 0 ? (
                  <List
                    grid={{ gutter: 8, column: 2 }}
                    dataSource={teacherL}
                    renderItem={item => (
                      <List.Item>
                        <ManagerAvatarH
                          key={item.teacherId}
                          item={item}
                          onHandleSelectManager={() => {
                            this.setState({
                              clickTeacher: item,
                            });
                          }}
                          type="classConfig"
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className={styles.none}>
                    <NoData
                      onLoad={teacherLoading}
                      noneIcon={managerPic}
                      tip={
                        teacherLoading
                          ? formatMessage({
                              id: 'app.message.registration.taskinfo.loading.tip',
                              defaultMessage: '信息加载中，请稍等...',
                            })
                          : formatMessage(messages.noneTip)
                      }
                    />
                    {/* <div className={styles.addTip}>找不到该教师，请先去<span>教师管理</span>添加哦~</div> */}
                  </div>
                )}

                {teacherL.length > 0 && (
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={teachingTotal}
                    showLessItems
                    onChange={this.onPageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </PageHeaderWrapper>
        {!initLoading && showNoviceNavigation && isFirstGrade && !teachClassList.length > 0 && (
          <NoviceNavigation
            swap={lastDays && Number(lastDays) > 0}
            onCloseNoviceNavigation={() => {
              const classNavi = `${teacherId}0`;
              localStorage.setItem('showTeachingClassNavigation', classNavi);
              this.setState({
                showNoviceNavigation: false,
              });
            }}
          />
        )}
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => {
    return window.innerHeight;
  },
  getWidth: () => {
    return window.innerWidth;
  },
})(ClassConfigure);
