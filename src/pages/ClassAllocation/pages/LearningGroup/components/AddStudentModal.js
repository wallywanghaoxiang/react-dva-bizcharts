import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, List, message, Empty } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import SearchBar from '@/components/SearchBar';
import StudentTip from '@/components/StudentTip';
import studentHead from '@/assets/none_user_pic.png';

import styles from './index.less';

// formatMessage(
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  submit: { id: 'app.submit', defaultMessage: '确认' },
  addStudent: { id: 'app.menu.learninggroup.addStudent', defaultMessage: '添加学生' },
  addStudentOk: { id: 'app.menu.learninggroup.addStudentOk', defaultMessage: '添加学生到小组成功' },
  cancelGroup: { id: 'app.menu.learninggroup.cancelGroup', defaultMessage: '取消分组' },
  addCurrentGroup: { id: 'app.menu.learninggroup.addCurrentGroup', defaultMessage: '加入现有小组' },
  studentSearch: {
    id: 'app.menu.learninggroup.studentSearch',
    defaultMessage: '请输入学生姓名或学号进行搜索',
  },
  tips1: { id: 'app.menu.learninggroup.tips1', defaultMessage: '请从' },
  tips2: { id: 'app.menu.learninggroup.tips2', defaultMessage: '选择学生加入' },
  tips3: { id: 'app.menu.learninggroup.tips3', defaultMessage: '小组' },
  studentSearchNoData: {
    id: 'app.menu.learninggroup.studentSearchNoData',
    defaultMessage: '请选择需要添加的学生',
  },
});

@connect(({ learn }) => {
  const {
    naturalStudentList,
    naturalClassId,
    name,
    currentGroupName,
    currentLearnGroupID,
    naturalStudentListFilter,
  } = learn;
  return {
    naturalStudentList,
    naturalClassId,
    name,
    currentGroupName,
    currentLearnGroupID,
    naturalStudentListFilter,
  };
})
class AddStudentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
      confirmBtn: false,
    };
  }

  componentDidMount() {}

  delFilter = () => {
    const { dispatch, naturalStudentList } = this.props;
    dispatch({
      type: 'learn/saveNaturalClassList',
      payload: {
        studentList: naturalStudentList,
      },
    });
  };

  onHandleCancel = () => {
    const { hideModal } = this.props;
    this.delFilter();
    hideModal();
  };

  // 加入现有小组

  onHandleOK = () => {
    const { hideModal, dispatch } = this.props;
    const that = this;
    const { checkedList } = this.state;
    this.setState({
      confirmBtn: true,
    });
    if (checkedList.length === 0) {
      message.warning(formatMessage(messages.studentSearchNoData));
      return;
    }
    dispatch({
      type: 'learn/moreGroupStudentAdd',
      payload: checkedList,
      callback: res => {
        if (res.responseCode === '200') {
          that.setState({
            confirmBtn: false,
            checkedList: [],
          });
          hideModal();
          that.fetchGroup();
          that.delFilter();
          message.success(
            formatMessage({ id: 'app.message.addStudentSuccess', defaultMessage: '添加学生成功' })
          );
        } else {
          message.warning(res.data);
          this.setState({
            confirmBtn: false,
            checkedList: [],
          });
        }
      },
    });
  };

  // 获取小组列表 以及该小组里的学生列表
  fetchGroup = () => {
    const { dispatch, currentLearnGroupID, naturalClassId } = this.props;
    dispatch({
      type: 'learn/fetchGroupList',
      payload: {
        campusId: localStorage.getItem('campusId'),
        teacherId: localStorage.getItem('teacherId'),
      },
    });
    dispatch({
      type: 'learn/fetchStudentList',
      payload: {
        id: currentLearnGroupID,
      },
    });
    dispatch({
      type: 'learn/fetchNaturalClassList',
      payload: {
        naturalClassId,
        campusId: localStorage.getItem('campusId'),
        teacherId: localStorage.getItem('teacherId'),
      },
    });
  };

  // 添加学生到小组
  addStudentList = id => {
    let { checkedList } = this.state;
    const { currentLearnGroupID } = this.props;
    const hasStudent = checkedList.find(obj => obj.studentId === id);
    if (hasStudent) {
      const checked = checkedList.filter(item => item.studentId !== id);
      checkedList = checked;
    } else {
      checkedList.push({
        studentId: id,
        learningGroupId: currentLearnGroupID,
      });
    }

    this.setState({
      checkedList,
    });
  };

  // 根据姓名或学号搜索 该行政班的学生
  onSearchKey = value => {
    const { naturalStudentList, dispatch, naturalClassId } = this.props;
    const students = naturalStudentList.filter(
      item =>
        (item.studentClassCode && item.studentClassCode.indexOf(value) > -1) ||
        (item.name && item.name.indexOf(value) > -1)
    );
    if (value !== '') {
      dispatch({
        type: 'learn/saveNaturalClassList',
        payload: {
          studentList: students,
        },
      });
    } else {
      dispatch({
        type: 'learn/fetchNaturalClassList',
        payload: {
          naturalClassId,
          campusId: localStorage.getItem('campusId'),
          teacherId: localStorage.getItem('teacherId'),
        },
      });
    }
  };

  render() {
    const {
      visible,
      name,
      currentGroupName,
      naturalStudentListFilter,
      naturalStudentList,
    } = this.props;
    const { checkedList, confirmBtn } = this.state;
    console.log(naturalStudentListFilter);
    return (
      <Modal
        visible={visible}
        centered
        title={formatMessage({ id: 'app.menu.learngroup.addStudent', defaultMessage: '添加学生' })}
        closable={false}
        confirmLoading={confirmBtn}
        width={598}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.submit)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.AddStudentModal}
        okButtonProps={{ disabled: checkedList.length === 0 || false }}
      >
        <h1 className={styles.addTitle}>
          {formatMessage(messages.tips1)} <span>{name}</span> {formatMessage(messages.tips2)}
          <span>{currentGroupName}</span> {formatMessage(messages.tips3)}
        </h1>
        <div className={styles.itemModal}>
          <SearchBar
            placeholder={formatMessage(messages.studentSearch)}
            onSearch={data => this.onSearchKey(data)}
            onChange={data => this.onSearchKey(data)}
          />
          <div className={styles.students}>
            {naturalStudentListFilter.length > 0 && (
              <List
                className={styles.paperInfo}
                dataSource={naturalStudentListFilter}
                renderItem={item => (
                  <List.Item
                    onClick={() => this.addStudentList(item.id)}
                    className={
                      checkedList.length > 0 && checkedList.find(obj => obj.studentId === item.id)
                        ? styles.checkedStudent
                        : ''
                    }
                    hidden={item.isMark === 'Y'}
                  >
                    <StudentTip item={item} isMark />
                  </List.Item>
                )}
              />
            )}
            {naturalStudentList.length === 0 && (
              <Empty
                image={studentHead}
                description={formatMessage({
                  id: 'app.text.classManage. students.in.class',
                  defaultMessage: '该班级还没有学生!',
                })}
              />
            )}
            {naturalStudentListFilter.length === 0 && naturalStudentList.length > 0 && (
              <Empty
                image={studentHead}
                description={formatMessage({
                  id: 'app.text.classManage.No.relevant.students.searched',
                  defaultMessage: '暂未搜索到相关学生!',
                })}
              />
            )}
          </div>
        </div>
        <div className={styles.selected}>
          已选：<span>{checkedList.length}</span>人
        </div>
      </Modal>
    );
  }
}

export default AddStudentModal;
