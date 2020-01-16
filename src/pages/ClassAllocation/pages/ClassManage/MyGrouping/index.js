/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: PM 13:16
 * Explain: 我的分组页面
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Input, Icon, Card, List, Tooltip } from 'antd';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import GroupingNoData from '../components/GroupingNoData';
import HeadNews from '../components/HeadNews';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import UserAvatar from '../../../Components/UserAvatar';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
  adminclass: { id: 'app.menu.classallocation.adminclass', defaultMessage: '行政班' },
  mygrouping: { id: 'app.menu.classallocation.mygrouping', defaultMessage: '我的分组' },
});

// connect方法可以拿取models中state值
@connect(({ clzss, loading, login }) => ({
  loading: loading.effects['clzss/fetchMyGroups'],
  myGroups: clzss.myGroups,
  filterMyGroup: clzss.filterMyGroup,
  initialMyGroup: clzss.initialMyGroup,
  campusID: login.campusID,
  currentNaturalTeach: clzss.currentNaturalTeach,
  classList: clzss.classList,
}))
class MyGrouping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminLastDays: props.location.state.adminLastDays,
      selectedItem: props.location.state.selectedItem,
      userName: '',
      isEmptyData: true,
    };
  }

  componentWillMount() {
    this.fetchMyGroups();
  }

  // 当校区切换时重新请求
  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {
      this.fetchMyGroups();
    }
  }

  // 数据初始化
  fetchMyGroups = () => {
    const { selectedItem } = this.state;
    const params = {
      campusId: localStorage.getItem('campusId'),
      naturalClassId: selectedItem.naturalClassId,
      teacherId: localStorage.getItem('teacherId'),
    };
    const { dispatch } = this.props;
    dispatch({
      type: 'clzss/fetchMyGroups',
      payload: params,
    });
    selectedItem.alias = sessionStorage.getItem('curAlias') || selectedItem.alias;
    selectedItem.className = sessionStorage.getItem('className') || selectedItem.className;
    dispatch({
      type: 'clzss/saveCurrentNaturalTeach',
      payload: {
        item: selectedItem,
      },
    });
  };

  // 搜索条件中的信息
  onSearchInfo = search => {
    const { dispatch, myGroups, initialMyGroup } = this.props;
    const myNewGroups = [];
    let isEmpty = false;
    if (search === 'empty') {
      this.getNaturalClass();
    }
    if (myGroups && myGroups.length > 0) {
      myGroups.forEach(groups => {
        const myTempGroups = {
          learningGroupId: groups.learningGroupId,
          name: groups.name,
          studentList: [],
        };
        if (groups.studentList && groups.studentList.length > 0) {
          const students = groups.studentList.filter(
            item =>
              (item.studentClassCode && item.studentClassCode.indexOf(search) > -1) ||
              (item.name && item.name.indexOf(search) > -1)
          );
          myTempGroups.studentList = students;
        }
        myNewGroups.push(myTempGroups);
      });
    }
    if (myNewGroups && myNewGroups.length > 0) {
      myNewGroups.forEach(newGroup => {
        if (newGroup.studentList && newGroup.studentList.length > 0) {
          isEmpty = true;
          return false;
        }
      });
      if (!isEmpty) {
        this.setState({ isEmptyData: false });
      } else {
        this.setState({ isEmptyData: true });
      }
    }
    if (search !== '') {
      dispatch({
        type: 'clzss/filterMyGroups',
        payload: {
          filterMyGroup: myNewGroups,
        },
      });
    } else {
      dispatch({
        type: 'clzss/filterMyGroups',
        payload: {
          filterMyGroup: initialMyGroup,
        },
      });
    }
  };

  // 点击取消按钮回调
  emitEmpty = () => {
    const { dispatch, initialMyGroup } = this.props;
    this.userNameInput.focus();
    dispatch({
      type: 'clzss/filterMyGroups',
      payload: {
        filterMyGroup: initialMyGroup,
      },
    });
    this.setState({
      userName: '',
      isEmptyData: true,
    });
  };

  // 跳转到行政班页面
  gotoAdmin = item => {
    const { classList } = this.props;
    const { selectedItem } = this.state;
    console.log(classList.naturalClassList);
    const natural = selectedItem.naturalClassId;
    const teacherId = localStorage.getItem('teacherId');
    const current = classList.naturalClassList.find(vo => vo.naturalClassId === natural);
    if (teacherId === current.teacherId) {
      router.push({
        pathname: `/classallocation/classmanage/admin/${item.naturalClassId}`,
      });
    } else {
      router.push({
        pathname: `/classallocation/classmanage/nonadmin/${item.naturalClassId}`,
      });
    }
  };

  onChangeUserName = e => {
    const { dispatch, initialMyGroup } = this.props;
    this.setState({ userName: e.target.value });
    const searchName = e.target.value;
    this.onSearchInfo(searchName);
    if (!e.target.value) {
      dispatch({
        type: 'clzss/filterMyGroups',
        payload: {
          filterMyGroup: initialMyGroup,
        },
      });
      this.setState({
        userName: '',
        isEmptyData: true,
      });
    }
  };

  // 学生信息（单个信息）
  myGroupingInfo = student => {
    return [
      <div className={styles.adminInfo}>
        <div className={student.isTransient === 'Y' ? `${styles.borrowing}` : ''}>
          {student.isTransient === 'Y' && (
            <div>
              <span>
                {formatMessage({ id: 'app.menu.learngroup.jiedu', defaultMessage: '借读' })}
              </span>
            </div>
          )}
        </div>
        <div className={styles.studentInfo}>
          <div className={styles.num}>
            <span>{student.studentClassCode}</span>
            {student.isMark === 'Y' ? (
              <span style={{ padding: '0 2px', color: '#03C46B', fontSize: '14px' }}>T</span>
            ) : null}
          </div>
          <div className={styles.portrait}>
            <UserAvatar id={student.accountId} />
          </div>
          <div className={styles.name}>
            <div>
              <Tooltip title={student.name}>
                {' '}
                <span className={styles.names}>{student.name}</span>
              </Tooltip>
              {/* {student.gender === 'FEMALE' && <i className={`iconfont icon-sex-lady ${styles.sexLady}`} />}
              {student.gender === 'MALE' && <i className={`iconfont icon-sex-man ${styles.sexMan}`} />} */}
            </div>
          </div>
        </div>
      </div>,
    ];
  };

  // jsx语法视图渲染
  render() {
    const { filterMyGroup, myGroups, currentNaturalTeach } = this.props;
    const { userName, adminLastDays, selectedItem, isEmptyData } = this.state;
    const suffix = userName ? (
      <i className="iconfont icon-error clear" onClick={this.emitEmpty} />
    ) : null;
    return (
      <div className={styles.myGrouping}>
        <h1 className={styles.menuName}>
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          {(currentNaturalTeach.alias || currentNaturalTeach.className) && (
            <span onClick={() => this.gotoAdmin(selectedItem)}>
              {currentNaturalTeach.alias || currentNaturalTeach.className}
              <i>/</i>
            </span>
          )}
          {formatMessage(messages.mygrouping)}
        </h1>
        <HeadNews lastDays={adminLastDays} />
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {myGroups && myGroups.length > 0 && (
            <div className={styles.search}>
              <div className={styles.userName}>
                <Input
                  placeholder={formatMessage({
                    id: 'app.menu.teachClass.searchGroup',
                    defaultMessage: '请输入学生姓名或学号进行搜索',
                  })}
                  prefix={
                    <Icon
                      type="search"
                      onClick={() => this.onSearchInfo(userName)}
                      style={{ color: 'rgba(0,0,0,.25)' }}
                    />
                  }
                  onChange={this.onChangeUserName}
                  suffix={suffix}
                  value={userName}
                  ref={node => {
                    this.userNameInput = node;
                  }}
                />
              </div>
            </div>
          )}
          {filterMyGroup && filterMyGroup.length > 0 && isEmptyData ? (
            <List
              grid={{ gutter: 24 }}
              dataSource={filterMyGroup.filter(vo => vo.isMark !== 'Y')}
              renderItem={item => (
                <List.Item key={item.studentId}>
                  <div className={styles.title} hidden={item.studentList.length === 0}>
                    {item.name}
                  </div>
                  <div className={styles.students} hidden={item.studentList.length === 0}>
                    <List
                      grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
                      dataSource={item.studentList}
                      renderItem={student => (
                        <List.Item key={student.studentId}>
                          <Card hoverable bodyStyle={{ paddingBottom: 20 }}>
                            <div className={styles.cardItemContent}>
                              {this.myGroupingInfo(student)}
                            </div>
                          </Card>
                        </List.Item>
                      )}
                    />
                  </div>
                </List.Item>
              )}
            />
          ) : (myGroups && myGroups.length > 0) || !isEmptyData ? (
            <div>
              <GroupingNoData />
            </div>
          ) : (
            <div />
          )}
          {myGroups && myGroups.length === 0 && isEmptyData ? (
            <div>
              <GroupingNoData />
            </div>
          ) : (
            <div />
          )}
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default MyGrouping;
