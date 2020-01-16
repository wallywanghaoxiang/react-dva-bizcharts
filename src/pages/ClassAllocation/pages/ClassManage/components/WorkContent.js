/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: AM 09:42
 * Explain: 班务管理-内容头部信息
 *
 * */
import React, { Component } from 'react';
import { Tooltip, Divider, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import { connect } from 'dva';
import SearchBar from '@/components/SearchBar';
// import pencil from '@/assets/class/pencil.png';
import trash from '@/assets/class/trash.png';
import callOut from '@/assets/class/call_out.png';
import callOutHover from '@/assets/class/call_out_hover.png';
import teacherManagement from '@/assets/class/teacher_management.png';
import people from '@/assets/class/people.png';
import peopleHover from '@/assets/class/people_hover.png';
import importHover from '@/assets/class/import_hover.png';
import importIonc from '@/assets/class/import.png';
import ShowAvatar from '@/components/ShowAvatar';

import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  searchGroup: {
    id: 'app.menu.classallocation.searchGroup',
    defaultMessage: '请输入学生姓名或学号进行搜索',
  },
  transferStudents: { id: 'app.menu.classallocation.transferStudents', defaultMessage: '调入学生' },
  warningHints: {
    id: 'app.menu.classallocation.warningHints',
    defaultMessage: '单科目英语只能添加一位老师',
  },
});

// connect方法可以拿取models中state值
@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/fetchNaturalClass'],
  filterTeachStudent: clzss.filterTeachStudent,
  adminStudents: clzss.adminStudents,
  adminTeacherList: clzss.adminTeacherList,
  adminLastDays: clzss.adminLastDays,
}))
class workContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hideSelected: props.curSelected, // 非管理员隐藏
    };
  }

  // 显示编辑老师弹框组件
  showEditorTeacherModal = (flag, teacher) => {
    const { teacherModalVisible } = this.props;
    teacherModalVisible(flag, teacher);
  };

  // 显示删除老师弹框组件
  showDelTeacherModal = (flag, teacher) => {
    const { delModalVisible } = this.props;
    delModalVisible(flag, teacher);
  };

  // 显示添加老师弹框组件-(添加老师需求矛盾)
  // eslint-disable-next-line consistent-return
  showAddTeacherModal = flag => {
    const { addModalVisible } = this.props;
    const { adminTeacherList } = this.props;
    // 目前单学科-英语
    if (
      adminTeacherList &&
      adminTeacherList.length < 2 &&
      (adminTeacherList[0].subjectList && adminTeacherList[0].subjectList.length === 0)
    ) {
      addModalVisible(flag);
      return false;
    }
    message.warning(formatMessage(messages.warningHints));
  };

  // 显示添加学生弹框组件
  // eslint-disable-next-line consistent-return
  showAddStudentModal = (flag, adminLastDays) => {
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    const { addStudentModalVisible } = this.props;
    addStudentModalVisible(flag);
  };

  // 显示调入学生弹框组件
  // eslint-disable-next-line consistent-return
  showTransferStudentModal = (flag, adminLastDays) => {
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    const { transferStudentModalVisible } = this.props;
    transferStudentModalVisible(flag);
  };

  // 多个学生调出
  // eslint-disable-next-line consistent-return
  multipleCallouts = adminLastDays => {
    const { multipleCalloutsMethod } = this.props;
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    multipleCalloutsMethod();
  };

  // 跳转到学生导入
  // eslint-disable-next-line consistent-return
  gotoImportingstudents = adminLastDays => {
    const { naturalClassId, curItem } = this.props;
    sessionStorage.setItem('curAlias', '');
    sessionStorage.setItem('className', '');
    if (adminLastDays === 0 || adminLastDays === null) {
      return false;
    }
    router.push({
      pathname: `/classallocation/classmanage/importingstudents/${naturalClassId}`,
      state: {
        curItem,
      },
    });
  };

  // 搜索
  onSearchKey = value => {
    const { dispatch, adminStudents } = this.props;
    const students = adminStudents.filter(
      item =>
        (item.studentClassCode && item.studentClassCode.indexOf(value) > -1) ||
        (item.studentName && item.studentName.indexOf(value) > -1)
    );
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

  // jsx语法视图渲染
  render() {
    const { hideSelected } = this.state;
    const { adminTeacherList, adminStudents, adminLastDays } = this.props;
    const logoTeacherId = localStorage.getItem('teacherId');
    const ShowMessage = () => (
      <div className={styles.message}>
        {adminLastDays > 0 ? (
          <div>
            <div style={{ fontSize: 13 }}>
              {formatMessage({
                id: 'app.text.Marked.students.do.not.occupy',
                defaultMessage: '被标记的学生不会占用班内学号',
              })}
              ，
            </div>
            <div style={{ fontSize: 13 }}>
              {formatMessage({
                id: 'app.text.exams.and.training',
                defaultMessage: '也不能参与 考试和训练',
              })}
            </div>
          </div>
        ) : (
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
        )}
      </div>
    );
    const ShowBtnMessage = () => (
      <div className={styles.message}>
        {adminLastDays === 0 || adminLastDays === null ? (
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
        ) : null}
      </div>
    );
    return (
      <div className={styles.workContent}>
        <div className={styles.baseInfo}>
          {adminTeacherList && adminTeacherList.length > 0 ? (
            adminTeacherList.map((teacher, index) => (
              <div className={styles.addTeacher}>
                <div className={styles.header}>
                  <ShowAvatar id={teacher.accountId} key={teacher.accountId} />
                  {/* {(teacher.avatar) ? (
                    <ShowAvatar id={teacher.avatar} />
                    
                  ) : (
                    <img src={TeacherAvatar} alt='' />
                  )} */}
                </div>
                <div className={styles.name}>
                  <div className={styles.admin}>
                    <Tooltip placement="top" title={teacher.teacherName}>
                      {teacher.teacherName}
                    </Tooltip>

                    {logoTeacherId === teacher.teacherId ? (
                      <img src={teacherManagement} alt="" />
                    ) : null}
                  </div>
                  <div className={styles.subject}>
                    {teacher.subjectList && teacher.subjectList.length > 0
                      ? teacher.subjectList.map(subject => (
                          // eslint-disable-next-line react/jsx-indent
                          <div>
                            <span>{subject.subjectValue}</span>
                          </div>
                        ))
                      : null}
                  </div>
                </div>

                {/* <div
                    className={styles.pencil}
                    onClick={e => {
                      e.preventDefault();
                      this.showEditorTeacherModal(true, teacher);
                    }}
                  >
                    <img src={pencil} alt="" />
                  </div> */}

                {logoTeacherId !== teacher.teacherId ? (
                  <div className={styles.hover}>
                    <div
                      className={styles.trash}
                      onClick={e => {
                        e.preventDefault();
                        this.showDelTeacherModal(true, teacher);
                      }}
                    >
                      <img src={trash} alt="" />
                    </div>
                  </div>
                ) : null}

                {index !== adminTeacherList.length - 1 && <div className={styles.line} />}
              </div>
            ))
          ) : (
            <div />
          )}
          {/* <div
            className={styles.addNewTeacher}
            onClick={e => {
              e.preventDefault();
              this.showAddTeacherModal(true);
            }}
          >
            <div className={styles.addBtn}>
              <span>+</span>
            </div>
          </div> */}
        </div>
        <div className={styles.search}>
          {adminStudents && adminStudents.length > 0 && (
            <div className={styles.search_l}>
              <span style={{ color: '#888888', fontSize: '13px' }}>
                {formatMessage({ id: 'app.menu.learngroup.checkall', defaultMessage: '全选' })}
              </span>
              <Divider type="vertical" />

              <div style={{ position: 'relative', bottom: '60px', left: '50px' }}>
                <span
                  className={styles.call}
                  onClick={e => {
                    e.preventDefault();
                    this.multipleCallouts(adminLastDays);
                  }}
                >
                  {adminLastDays > 0 && <img className={styles.callOut} src={callOut} alt="" />}
                  {(adminLastDays === 0 || adminLastDays === null) && (
                    <img className={styles.callOutDis} src={callOut} alt="" />
                  )}
                  {adminLastDays > 0 && (
                    <img className={styles.callOutHover} src={callOutHover} alt="" />
                  )}
                  <Tooltip placement="top" title={<ShowMessage />}>
                    <span
                      className={
                        adminLastDays === 0 || adminLastDays === null ? styles.notSubmint : ''
                      }
                    >
                      {formatMessage({
                        id: 'app.text.classManage.Mark.callout',
                        defaultMessage: '标记调出',
                      })}
                    </span>
                  </Tooltip>
                </span>
              </div>
            </div>
          )}
          <div className={styles.search_r}>
            {adminStudents && adminStudents.length > 0 && (
              <div className={styles.goto}>
                <div className={styles.userName}>
                  {adminStudents && adminStudents.length > 0 && (
                    <SearchBar
                      placeholder={formatMessage(messages.searchGroup)}
                      onSearch={data => this.onSearchKey(data)}
                      onChange={data => this.onSearchKey(data)}
                    />
                  )}
                </div>
                <Tooltip placement="top" title={adminLastDays > 0 ? '' : <ShowBtnMessage />}>
                  <div
                    className={
                      adminLastDays === 0 || adminLastDays === null
                        ? styles.notSubmint
                        : styles.update_btn
                    }
                    hidden={hideSelected === 'noAdmin'}
                  >
                    <div
                      className={styles.position_stu}
                      onClick={() => {
                        this.showTransferStudentModal(true, adminLastDays);
                      }}
                    >
                      <img className={styles.import} src={importIonc} alt="" />
                      <img className={styles.importHover} src={importHover} alt="" />
                      <span>
                        {formatMessage({
                          id: 'app.menu.classallocation.transferStudents',
                          defaultMessage: '调入学生',
                        })}
                      </span>
                    </div>
                  </div>
                </Tooltip>
                <Tooltip placement="top" title={adminLastDays > 0 ? '' : <ShowBtnMessage />}>
                  <div
                    className={
                      adminLastDays === 0 || adminLastDays === null
                        ? styles.notSubmint
                        : styles.update_btn
                    }
                    hidden={hideSelected === 'noAdmin'}
                  >
                    <div
                      className={styles.position}
                      onClick={() => {
                        this.showAddStudentModal(true, adminLastDays);
                      }}
                    >
                      <span>+</span>
                      <span>
                        {formatMessage({
                          id: 'app.menu.classmanage.addStudent',
                          defaultMessage: '添加学生',
                        })}
                      </span>
                    </div>
                  </div>
                </Tooltip>
                <Tooltip placement="top" title={adminLastDays > 0 ? '' : <ShowBtnMessage />}>
                  <div
                    className={
                      adminLastDays === 0 || adminLastDays === null
                        ? styles.notSubmint
                        : styles.update_btn
                    }
                    hidden={hideSelected === 'noAdmin'}
                  >
                    <div
                      className={styles.position_peo}
                      onClick={() => this.gotoImportingstudents(adminLastDays)}
                    >
                      <img className={styles.people} src={people} alt="" />
                      <img className={styles.peopleHover} src={peopleHover} alt="" />
                      <span>
                        {formatMessage({
                          id: 'app.text.classManage.Batch.import',
                          defaultMessage: '批量导入',
                        })}
                      </span>
                    </div>
                  </div>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default workContent;
