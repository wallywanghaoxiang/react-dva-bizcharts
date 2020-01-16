/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:21
 * Explain: 添加老师弹框
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, message, Radio, List } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import SearchBar from '@/components/SearchBar';
import studentHead from '@/assets/class/student_head.png';
// import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import UserAvatar from '../../../Components/UserAvatar';
import styles from './index.less';

const RadioGroup = Radio.Group;

const FormItem = Form.Item;
// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确定' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功添加' },
  addFailure: { id: 'app.menu.classmanage.add.fail.toast', defaultMessage: '添加失败！' },
  teacherName: { id: 'app.menu.classmanage.teacherName', defaultMessage: '姓名' },
  selectedSubject: { id: 'app.menu.classmanage.selectedSubject', defaultMessage: '选择学科' },
  teacherCannotEmpty: {
    id: 'app.menu.classmanage.name.teacherCannotEmpty',
    defaultMessage: '老师名称不能为空',
  },
  addTeacher: { id: 'app.menu.classmanage.addTeacher', defaultMessage: '添加教师' },
  teacherNoData: { id: 'app.menu.classallocation.teacherNoData', defaultMessage: '未查询到该老师' },
  selectedTeacher: {
    id: 'app.menu.classallocation.selectedTeacher',
    defaultMessage: '请选择需要添加的教师',
  },
  searchTeacher: {
    id: 'app.menu.classallocation.searchTeacher',
    defaultMessage: '请输入姓名搜索教师',
  },
  searchTeachers: {
    id: 'app.menu.classallocation.searchTeachers',
    defaultMessage: '按姓名搜索老师',
  },
});

@Form.create()
@connect(({ clzss }) => ({
  teacherLists: clzss.teacherLists,
}))
class AddTeacherModal extends Component {
  // 数据初始化参数
  constructor(props) {
    super(props);
    this.state = {
      showNoData: true,
      filterTeacherList: [],
      confirmBtn: false,
      selectedTeacherId: '',
      subjectValue: '',
    };
  }

  // 初始化获取老师列表信息
  componentWillMount() {
    this.setState({
      selectedTeacherId: '',
      subjectValue: '',
    });
    this.getTeacherList();
  }

  getTeacherList = () => {
    const { dispatch, type } = this.props;
    const params = {
      pageIndex: 1,
      pageSize: 10000,
      campusId: localStorage.getItem('campusId'),
      filterWord: '',
    };
    if (type === 'tsmk') {
      params.teacherId = localStorage.getItem('teacherId');
    }
    dispatch({
      type: 'clzss/getTeacherList',
      payload: params,
    });
  };

  // 取消弹框方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
    this.setState({
      showNoData: true,
      filterTeacherList: [],
      selectedTeacherId: '',
      subjectValue: '',
    });
  };

  // 获取老师信息
  gettingTeacherList = value => {
    const newTeacherList = [];
    const { teacherLists } = this.props;
    if (value) {
      if (teacherLists.records && teacherLists.records.length > 0) {
        teacherLists.records.forEach(item => {
          if (item.selected) {
            // eslint-disable-next-line no-param-reassign
            item.selected = false;
          }
          if (item.teacherName.indexOf(value) > -1) {
            newTeacherList.push(item);
          }
        });
      }
      if (newTeacherList.length === 0) {
        this.setState({
          showNoData: false,
        });
      }
      this.setState({
        filterTeacherList: newTeacherList,
        selectedTeacherId: '',
      });
    } else {
      this.setState({
        filterTeacherList: [],
        selectedTeacherId: '',
      });
    }
  };

  // 添加老师成功后回调列表
  getNaturalClass = () => {
    const { dispatch, naturalClassId } = this.props;
    const params = {
      id: naturalClassId,
    };
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
    });
  };

  // 当前选中的老师
  selectedTeacher = (item, filterTeacherList) => {
    const tempTeacherList = [];
    const { selectedTeacherId } = this.state;
    if (filterTeacherList && filterTeacherList.length > 0) {
      filterTeacherList.forEach(teacher => {
        if (item.teacherId === teacher.teacherId && selectedTeacherId !== item.teacherId) {
          // eslint-disable-next-line no-param-reassign
          teacher.selected = true;
        } else {
          // eslint-disable-next-line no-param-reassign
          teacher.selected = false;
        }
        tempTeacherList.push(teacher);
      });
    }

    console.log(selectedTeacherId, item.teacherId);
    this.setState({
      filterTeacherList: tempTeacherList,
      selectedTeacherId: selectedTeacherId === item.teacherId ? '' : item.teacherId,
    });
  };

  // 输入框指变化
  changeValueSearch = value => {
    if (value === '') {
      this.setState({
        filterTeacherList: [],
        selectedTeacherId: '',
      });
    }
  };

  // 添加老师方法
  onHandleOK = () => {
    const that = this;
    const { form, dispatch, naturalClassId, type } = that.props;
    const { filterTeacherList, selectedTeacherId } = this.state;
    if (type === 'tsmk') {
      // eslint-disable-next-line no-restricted-syntax
      for (const i in filterTeacherList) {
        if (filterTeacherList[i].teacherId === selectedTeacherId) {
          // eslint-disable-next-line react/destructuring-assignment
          this.props.callback(filterTeacherList[i]);
          break;
        }
      }
      // eslint-disable-next-line react/destructuring-assignment
      this.props.hideModal();
    } else if (filterTeacherList && filterTeacherList.length > 0) {
      const params = {
        naturalClassId,
        teacherId: selectedTeacherId,
        subjectCode: '103',
      };
      form.validateFields(err => {
        if (!err) {
          const { hideModal } = that.props;
          if (params) {
            dispatch({
              type: 'clzss/addClassTeachers',
              payload: params,
              callback: res => {
                if (res.responseCode === '200') {
                  this.setState({
                    confirmBtn: false,
                  });
                  that.getNaturalClass();
                  message.success(formatMessage(messages.addSuccess));
                } else {
                  message.error(res.data);
                }
              },
            });
          }
          this.setState({
            showNoData: true,
            filterTeacherList: [],
            selectedTeacherId: '',
            subjectValue: '',
          });
          hideModal();
        }
      });
    }
  };

  onChange = e => {
    this.setState({
      subjectValue: e.target.value,
    });
  };

  render() {
    const {
      confirmBtn,
      filterTeacherList,
      showNoData,
      selectedTeacherId,
      subjectValue,
    } = this.state;
    const { form, visibleModal, type, title } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visibleModal}
        centered
        title={title || formatMessage(messages.addTeacher)}
        closable={false}
        confirmLoading={confirmBtn}
        width={500}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.confirm)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.addTeacherModal}
        okButtonProps={
          type === 'tsmk'
            ? { disabled: !selectedTeacherId || filterTeacherList.length === 0 || false }
            : {
                disabled:
                  !subjectValue || !selectedTeacherId || filterTeacherList.length === 0 || false,
              }
        }
      >
        <Form layout="vertical">
          <FormItem label="">
            {getFieldDecorator('nameInput', {
              initialValue: '',
            })(
              <div className={styles.item}>
                <SearchBar
                  placeholder={
                    type === 'tsmk'
                      ? formatMessage(messages.searchTeachers)
                      : formatMessage(messages.searchTeacher)
                  }
                  onSearch={value => this.gettingTeacherList(value)}
                  onChange={value => this.changeValueSearch(value)}
                  style={{ width: 440 }}
                />
              </div>
            )}
          </FormItem>
          <FormItem label="" style={{ maxHeight: '200px', overflowX: 'hidden', overflowY: 'auto' }}>
            {filterTeacherList && filterTeacherList.length > 0 ? (
              <List
                grid={{
                  gutter: 16,
                  xs: 3,
                  sm: 3,
                  md: 3,
                  lg: 3,
                  xl: 3,
                  xxl: 3,
                }}
                dataSource={filterTeacherList}
                renderItem={item => (
                  <List.Item>
                    {
                      <div className={styles.clzss}>
                        <div
                          className={!item.selected ? styles.region : styles.active}
                          onClick={() => {
                            this.selectedTeacher(item, filterTeacherList);
                          }}
                        >
                          <div>
                            <UserAvatar id={item.accountId} />
                          </div>
                          <div>
                            <div className={styles.name} title={item.teacherName}>
                              {item.teacherName}
                            </div>
                            <div className={styles.phone}>
                              {item.mobile ||
                                formatMessage({
                                  id: 'app.message.notBindingMobilePhone',
                                  defaultMessage: '未绑定手机',
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </List.Item>
                )}
              />
            ) : (
              <div className={styles.teacherNoData} hidden={showNoData}>
                <img className={styles.classImg} src={studentHead} alt="" />
                <div>{formatMessage(messages.teacherNoData)}</div>
              </div>
            )}
          </FormItem>
          {type !== 'tsmk' && filterTeacherList.length > 0 && (
            <FormItem label="">
              <div className={styles.item}>
                <span className={styles.itemTitle}>
                  {formatMessage(messages.selectedSubject)}
                  <i>*</i>
                </span>
                <div>
                  <RadioGroup onChange={this.onChange}>
                    <Radio value={103}>
                      {formatMessage({
                        id: 'app.text.classManage.english',
                        defaultMessage: '英语',
                      })}
                    </Radio>
                  </RadioGroup>
                </div>
              </div>
            </FormItem>
          )}
        </Form>
      </Modal>
    );
  }
}

export default AddTeacherModal;
