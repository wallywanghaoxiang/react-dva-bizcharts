// 学生列表
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import classNames from 'classnames';
import SearchBar from '@/components/SearchBar';
import { Button, List, Checkbox, Tooltip, Empty } from 'antd';
import NoData from './NoData';
import userlogo from '@/assets/avarta_teacher.png';
import studentHead from '@/assets/class/student_head.png';
import UserAvatar from '../../../Components/UserAvatar';
import styles from '../index.less';

const CheckboxGroup = Checkbox.Group;

const messages = defineMessages({
  group: { id: 'app.menu.learngroup.group', defaultMessage: '重新分组' },
  addStudent: { id: 'app.menu.learngroup.addStudent', defaultMessage: '添加学生' },
  checkall: { id: 'app.menu.learngroup.checkall', defaultMessage: '全选' },
  searchGroup: {
    id: 'app.menu.learngroup.searchGroup',
    defaultMessage: '请输入学生姓名或学号进行搜索',
  },
  jiedu: { id: 'app.menu.learngroup.jiedu', defaultMessage: '借读' },
});

@connect(({ learn }) => {
  const { studentList, groupList, currentLearnGroupID, studentListFilter } = learn;
  return { studentList, groupList, currentLearnGroupID, studentListFilter };
})
class ListItem extends Component {
  state = {
    checkedList: [],
    indeterminate: false,
    checkAll: false,
  };

  componentWillMount() {}

  componentWillReceiveProps(nextProps) {
    const { studentList } = nextProps;
    const { props } = this;
    if (studentList.length !== props.studentList.length) {
      this.setState({
        checkedList: [],
        indeterminate: false,
        checkAll: false,
      });
    }
  }

  onChange = checkedList => {
    const { studentListFilter } = this.props;
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && checkedList.length < studentListFilter.length,
      checkAll: checkedList.length === studentListFilter.length,
    });
  };

  // 全选
  onCheckAllChange = e => {
    const { studentListFilter } = this.props;
    this.setState({
      checkedList: e.target.checked ? studentListFilter : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  };

  // 新增学生
  newUser = () => {};

  // 无学生
  renderNoData = () => {
    const { studentList, addStudent, groupList } = this.props;
    const groupMyList = [];
    if (groupList.length > 0) {
      groupList.forEach(item => {
        if (item.learningGroupList.length > 0) {
          item.learningGroupList.forEach(vo => {
            groupMyList.push(vo);
          });
        }
      });
    }
    return studentList.length === 0 && groupMyList.length > 0 && <NoData addStudent={addStudent} />;
  };

  // 搜索
  onSearchKey = value => {
    this.setState({
      checkAll: false,
      checkedList: [],
      indeterminate: false,
    });
    const { studentList, dispatch, currentLearnGroupID } = this.props;
    const students = studentList.filter(
      item =>
        (item.studentClassCode && item.studentClassCode.indexOf(value) > -1) ||
        (item.studentName && item.studentName.indexOf(value) > -1)
    );
    if (value !== '') {
      dispatch({
        type: 'learn/saveStudentList',
        payload: {
          studentList: students,
        },
      });
    } else {
      dispatch({
        type: 'learn/fetchStudentList',
        payload: {
          id: currentLearnGroupID,
        },
      });
    }
  };

  reGroupModal = id => {
    const { dispatch, currentLearnGroupID, reGroup } = this.props;
    const { checkedList } = this.state;
    if (id) {
      // 单个进行分组  保存需要分组的数据
      dispatch({
        type: 'learn/saveCurrentGroupInfo',
        payload: {
          changeGroupData: [
            {
              id,
              learningGroupId: currentLearnGroupID,
            },
          ],
        },
      });
    } else {
      // 多个进行分组  保存需要分组的数据
      const data = [];
      checkedList.forEach(item => {
        data.push({
          id: item.id,
          learningGroupId: currentLearnGroupID,
        });
      });
      dispatch({
        type: 'learn/saveCurrentGroupInfo',
        payload: {
          changeGroupData: data,
        },
      });
    }
    reGroup();
  };

  render() {
    const { indeterminate, checkAll, checkedList } = this.state;
    const { addStudent, studentList, studentListFilter, groupList } = this.props;
    console.log(studentListFilter);
    const groupMyList = [];
    if (groupList.length > 0) {
      groupList.forEach(item => {
        if (item.learningGroupList.length > 0) {
          item.learningGroupList.forEach(vo => {
            groupMyList.push(vo);
          });
        }
      });
    }
    return (
      <div className={styles.learnRight}>
        {this.renderNoData()}

        {studentList.length > 0 && groupMyList.length > 0 && (
          <div className={styles.rightTop}>
            <Checkbox
              indeterminate={indeterminate}
              onChange={this.onCheckAllChange}
              checked={checkAll}
            >
              {formatMessage(messages.checkall)}
            </Checkbox>
            <span
              className={classNames(
                checkedList.length === 0 ? 'unAbleReGroup' : '',
                styles.reGroup
              )}
              onClick={() => (checkedList.length === 0 ? {} : this.reGroupModal())}
            >
              <i className="iconfont icon-layer" />
              {formatMessage(messages.group)}
            </span>
            <div className={styles.searRight}>
              <Button className={styles.addStudents} onClick={addStudent}>
                <i className="iconfont icon-add" />
                {formatMessage(messages.addStudent)}
              </Button>
              <SearchBar
                placeholder={formatMessage(messages.searchGroup)}
                onSearch={data => this.onSearchKey(data)}
                onChange={data => this.onSearchKey(data)}
              />
            </div>
          </div>
        )}
        {studentList.length > 0 && studentListFilter.length === 0 && (
          <Empty
            image={studentHead}
            description={formatMessage({
              id: 'app.text.classManage.No.relevant.students.searched',
              defaultMessage: '暂未搜索到相关学生!',
            })}
            style={{ marginTop: '80px' }}
          />
        )}
        {studentList.length > 0 && groupMyList.length > 0 && studentListFilter.length > 0 && (
          <div className={styles.studentList}>
            <CheckboxGroup value={checkedList} onChange={this.onChange}>
              <List
                grid={{ gutter: 20, xs: 1, sm: 1, md: 1, lg: 1, xl: 2, xxl: 3 }}
                className={styles.paperInfo}
                dataSource={studentListFilter}
                renderItem={item => (
                  <List.Item>
                    <Tooltip title={formatMessage(messages.group)}>
                      <i
                        className={classNames(
                          checkedList.length > 0 &&
                            checkedList.find(obj => obj.studentId === item.studentId)
                            ? 'unAble'
                            : '',
                          'iconfont',
                          'icon-layer'
                        )}
                        onClick={() =>
                          checkedList.length > 0 &&
                          checkedList.find(obj => obj.studentId === item.studentId)
                            ? {}
                            : this.reGroupModal(item.id)
                        }
                      />
                    </Tooltip>
                    <Checkbox value={item} />
                    <div hidden={item.isTransient === 'N'} className={styles.isTransient}>
                      <span>{formatMessage(messages.jiedu)}</span>
                    </div>
                    <span className={styles.classNum}>{item.studentClassCode}</span>
                    <UserAvatar id={item.accountId} className={styles.pic} key={item.accountId} />
                    <span className={styles.userName}>
                      <Tooltip title={item.studentName}>{item.studentName}</Tooltip>
                    </span>
                    {/* {item.gender === 'FEMALE' && <i className="iconfont icon-sex-lady" />}
                    {item.gender !== 'FEMALE' && <i className="iconfont icon-sex-man" />} */}
                  </List.Item>
                )}
              />
            </CheckboxGroup>
          </div>
        )}
      </div>
    );
  }
}

export default ListItem;
