/**
 *
 * User: tina.zhang
 * Explain: 班务管理页面
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Table, Button, Modal, message, Tooltip, Empty } from 'antd';
import SearchBar from '@/components/SearchBar';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import HeadNews from './HeadNews';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import AddStudentModal from './AddStudentModal';
import SwithTo from './SwithTo';
import TeachingNoData from './TeachingNoData';
import studentHead from '@/assets/class/student_head.png';
import UserAvatar from '../../../Components/UserAvatar';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import styles from './index.less';

const { confirm } = Modal;
const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
  adminclass: { id: 'app.menu.classallocation.adminclass', defaultMessage: '行政班' },
  addStudent: { id: 'app.menu.classallocation.addStudent', defaultMessage: '调入学生' },
  classwork: { id: 'app.menu.classallocation.classwork', defaultMessage: '班务管理' },
  searchGroup: {
    id: 'app.menu.teachClass.searchGroup',
    defaultMessage: '请输入学生姓名或学号进行搜索',
  },
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  submit: { id: 'app.submit', defaultMessage: '确定' },
  del: { id: 'app.menu.classallocation.del.toast', defaultMessage: '删除' },
  yesorno: { id: 'app.menu.classallocation.del.yesorno', defaultMessage: '是否确认？' },
  delOk: { id: 'app.menu.classallocation.del.delOk', defaultMessage: '删除成功！' },
});

@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/getTeachingStudents'],
  filterTeachStudent: clzss.filterTeachStudent,
  teachingStudents: clzss.teachingStudents,
  teachLastDays: clzss.teachLastDays,
}))
class ClassWork extends Component {
  state = {
    columns: [
      {
        title: formatMessage({ id: 'app.text.classManage.student', defaultMessage: '学生' }),
        defaultSortOrder: 'descend',
        render: text => (
          <div className={styles.teacherInfo}>
            <UserAvatar id={text.accountId} />
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

        render: text => <div>{text.studentClassCode}</div>,
      },
      // {
      //   title: formatMessage({
      //     id: 'app.student.user.center.person.center.gender.title',
      //     defaultMessage: '性别',
      //   }),
      //   dataIndex: 'genderValue',
      //   key: 'genderValue',
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
                {formatMessage({
                  id: 'app.examination.inspect.task.detail.student.borrowing.status',
                  defaultMessage: '借读',
                })}
              </span>
            ) : (
              <span />
            )}
          </div>
        ),
      },
      {
        title: formatMessage({
          id: 'app.teacher.home.natural.class.title',
          defaultMessage: '行政班',
        }),
        dataIndex: 'naturalClassName',
        key: 'naturalClassName',
      },
      {
        title: formatMessage({ id: 'app.text.classManage.operation', defaultMessage: '操作' }),
        key: 'action',
        render: record => (
          <span
            className={styles.delWorkStudent}
            onClick={() => this.delData(record.id, record.studentName)}
          >
            {formatMessage({ id: 'app.menu.classallocation.del.toast', defaultMessage: '删除' })}
          </span>
        ),
      },
    ],
    visibleModal: false,
    visibleSwithToModal: false,
    checkedList: [],
    lastDays: '',
    curItem: {},
  };

  componentWillMount() {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    const that = this;
    dispatch({
      type: 'clzss/getTeachingStudents',
      payload: id,
      callback: data => {
        const { curItem } = that.state;
        curItem.subjectId = data.subjectId;
        curItem.grade = data.grade;
        curItem.curAlias = data.name;
        curItem.id = data.id;
        const { lastDays } = data;
        that.setState({
          lastDays,
          curItem,
        });
        const ShowBtnMessage = () => (
          <div>
            {lastDays === 0 || lastDays === null ? (
              <div style={{ width: '190px', height: '36px', 'line-height': '18px' }}>
                <div>
                  <div style={{ fontSize: 13 }}>
                    {formatMessage({
                      id: 'app.text.Non-AlternatingPeriodNotOperating',
                      defaultMessage: '非异动期不可操作，如需操作',
                    })}
                    ,
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
        if (lastDays === 0 || lastDays === null) {
          this.setState({
            columns: [
              {
                title: formatMessage({
                  id: 'app.text.classManage.student',
                  defaultMessage: '学生',
                }),
                defaultSortOrder: 'descend',
                render: text => (
                  <div className={styles.teacherInfo}>
                    <UserAvatar id={text.accountId} />
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

                render: text => <div>{text.studentClassCode}</div>,
              },
              {
                title: formatMessage({
                  id: 'app.student.user.center.person.center.gender.title',
                  defaultMessage: '性别',
                }),
                dataIndex: 'genderValue',
                key: 'genderValue',
              },
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
                        {formatMessage({
                          id: 'app.examination.inspect.task.detail.student.borrowing.status',
                          defaultMessage: '借读',
                        })}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                ),
              },
              {
                title: formatMessage({
                  id: 'app.teacher.home.natural.class.title',
                  defaultMessage: '行政班',
                }),
                dataIndex: 'naturalClassName',
                key: 'naturalClassName',
              },
              {
                title: formatMessage({
                  id: 'app.text.classManage.operation',
                  defaultMessage: '操作',
                }),
                key: 'action',
                render: () => (
                  <Tooltip
                    placement="top"
                    title={lastDays === 0 || lastDays === null ? <ShowBtnMessage /> : ''}
                  >
                    <Button className={styles.disabledClick} disabled>
                      {formatMessage({
                        id: 'app.menu.classallocation.del.toast',
                        defaultMessage: '删除',
                      })}
                    </Button>
                  </Tooltip>
                ),
              },
            ],
          });
        }
      },
    });
  }

  // 删除该学生
  delData = (id, studentName) => {
    const { dispatch } = this.props;
    const that = this;
    confirm({
      title: '',
      content: (
        <div className="cont">
          <span>
            {formatMessage({ id: 'app.menu.classallocation.del.toast', defaultMessage: '删除' })}
          </span>
          <span className="name">{studentName}</span>
          <span>
            {' '}
            {formatMessage({
              id: 'app.examination.inspect.delete.task.title2',
              defaultMessage: '，是否确认？',
            })}
          </span>
        </div>
      ),
      okText: formatMessage(messages.submit),
      cancelText: formatMessage(messages.cancel),
      onOk() {
        dispatch({
          type: 'clzss/delTeachingStudentsCodes',
          payload: {
            id,
          },
          callback: res => {
            that.setState({
              delVisible: false,
            });
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode, data } = x;
            if (responseCode === '200') {
              that.fetchNaturalClass();
              message.success(formatMessage(messages.delOk));
            } else {
              message.warning(data);
            }
          },
        });
      },
    });
  };

  // 获取该教学班的学生列表
  fetchNaturalClass = () => {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    dispatch({
      type: 'clzss/getTeachingStudents',
      payload: id,
    });
  };

  // 调入学生
  addStudent = () => {
    this.setState({
      visibleModal: true,
    });
  };

  // 关闭转入学生
  hideModalGroup = () => {
    this.setState({
      visibleModal: false,
    });
  };

  // 关闭转入学生确认弹窗
  hideSwithToModal = () => {
    this.setState({
      visibleSwithToModal: false,
    });
  };

  // 保存调入的学生列表
  saveCheckedListData = data => {
    this.setState({ checkedList: data, visibleSwithToModal: true });
  };

  // 搜索
  onSearchKey = value => {
    const { dispatch, teachingStudents } = this.props;
    const students = teachingStudents.filter(
      item =>
        (item.studentClassCode && item.studentClassCode.indexOf(value) > -1) ||
        (item.studentName && item.studentName.indexOf(value) > -1)
    );
    if (value !== '') {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterTeachStudent: students,
        },
      });
    } else {
      dispatch({
        type: 'clzss/filterTeachStudents',
        payload: {
          filterTeachStudent: teachingStudents,
        },
      });
    }
  };

  //
  gotoTeach = () => {
    const { curItem } = this.state;
    router.push({
      pathname: `/classallocation/classmanage/teaching/${curItem.id}`,
    });
  };

  render() {
    const {
      location,
      filterTeachStudent,
      teachingStudents,
      loading,
      match: {
        params: { id },
      },
    } = this.props;
    const {
      columns,
      visibleModal,
      visibleSwithToModal,
      checkedList,
      lastDays,
      curItem,
    } = this.state;
    const ShowBtnMessage = () => (
      <div>
        {lastDays === 0 || lastDays === null ? (
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
    return (
      <div className={styles.classWork}>
        <AddStudentModal
          visible={visibleModal}
          hideModal={this.hideModalGroup}
          id={id}
          grade={curItem.grade}
          subjectId={curItem.subjectId}
          saveCheckedList={data => {
            this.saveCheckedListData(data);
          }}
        />
        {visibleSwithToModal && (
          <SwithTo
            visibleModal={visibleSwithToModal}
            hideModal={this.hideSwithToModal}
            id={id}
            studentList={checkedList || []}
          />
        )}

        <h1 className={styles.menuName}>
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          <span onClick={this.gotoTeach} className={styles.curpointer}>
            {curItem.curAlias}
            <i>/</i>
          </span>
          {formatMessage(messages.classwork)}
        </h1>
        <HeadNews lastDays={lastDays} />
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {teachingStudents.length > 0 && (
            <div>
              <div className={styles.searchTeach}>
                <SearchBar
                  placeholder={formatMessage(messages.searchGroup)}
                  onSearch={data => this.onSearchKey(data)}
                  onChange={data => this.onSearchKey(data)}
                />

                <Tooltip
                  placement="top"
                  title={lastDays === 0 || lastDays === null ? <ShowBtnMessage /> : ''}
                >
                  <div style={{ float: 'right' }}>
                    <Button
                      className={styles.addStudents}
                      onClick={this.addStudent}
                      disabled={lastDays === 0 || lastDays === null}
                    >
                      <i className="iconfont icon-add" />
                      {formatMessage(messages.addStudent)}
                    </Button>
                  </div>
                </Tooltip>
              </div>
              {filterTeachStudent.length === 0 && (
                <Empty
                  image={studentHead}
                  description={formatMessage({
                    id: 'app.text.Norelevantstudentswerefound',
                    defaultMessage: '未搜索到相关的学生！',
                  })}
                  style={{ marginTop: '80px' }}
                />
              )}
              {filterTeachStudent.length > 0 && (
                <Table
                  columns={columns}
                  dataSource={filterTeachStudent}
                  className={styles.studentWork}
                  pagination={false}
                  loading={loading}
                />
              )}
            </div>
          )}

          {teachingStudents.length === 0 && loading === false && (
            <TeachingNoData
              id={id}
              name={curItem.curAlias}
              lastDays={lastDays}
              addStudent={this.addStudent}
            />
          )}
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default ClassWork;
