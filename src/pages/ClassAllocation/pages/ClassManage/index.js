/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-28
 * Time: AM 09:11
 * Explain: 班级管理入口
 *
 * */
import React, { Component } from 'react';
import { Tabs, Card, List, Tooltip } from 'antd';
import { connect } from 'dva';
import { FormattedMessage,formatMessage } from 'umi/locale';
import router from 'umi/router';
import NoData from './components/NoData';
import admin from '@/assets/class/admin.png';
import styles from './index.less';

const { TabPane } = Tabs;

// connect方法可以拿取models中state值
@connect(({ clzss, loading, login }) => ({
  loading: loading.effects['clzss/fetchClassList'],
  classList: clzss.classList,
  campusID: login.campusID,
}))
class Clzss extends Component {

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'clzss/filterTeachStudents',
      payload: {
        filterTeachStudent: [],
        filterNaturalClass: [],
      },
    });
    this.fetchClassList();
  }

  // 当校区切换时重新请求
  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {
      this.fetchClassList();
    }
  }

  fetchClassList = () => {
    const { dispatch } = this.props;
    const params = {
      campusId: localStorage.getItem('campusId'),
      teacherId: localStorage.getItem('teacherId'),
    };
    dispatch({
      type: 'clzss/fetchClassList',
      payload: params,
    });
  };

  // 行政班-选择单个数据内容
  selectedClass = item => {
    const { dispatch } = this.props;
    const teacherId = localStorage.getItem('teacherId');
    sessionStorage.setItem('curAlias', '');
    sessionStorage.setItem('className', '');
    if (item.teacherId === teacherId) {
      dispatch({
        type: 'clzss/saveCurrentNaturalTeach',
        payload: {
          item,
        },
      });
      router.push({
        pathname: `/classallocation/classmanage/admin/${item.naturalClassId}`
        
      });
    } else {
      dispatch({
        type: 'clzss/saveCurrentNaturalTeach',
        payload: {
          item,
        },
      });
      router.push({
        pathname: `/classallocation/classmanage/nonadmin/${item.naturalClassId}`
       
      });
    }
  };

  // 教学班-选择单个数据内容
  selectedTeacherClass = (item) => {
    // 保存当前教学班信息

    const { dispatch } = this.props;
    dispatch({
      type: 'clzss/saveCurrentTeach',
      payload: {
        item,
      },
    });
    router.push({
      pathname: `/classallocation/classmanage/teaching/${item.id}`,
     
    });
  };

  // 处理省略号全字显示-行政班
  handlingEllipsis = (alias, className) => {
    let newAlias = '';
    let newClassName = '';
    if (alias && alias.length > 10) {
      newAlias = `${alias.substr(0, 10)}...`;
    } else {
      newAlias = alias;
    }
    if (className && className.length > 10) {
      newClassName = `${className.substr(0, 10)}...`;
    } else {
      newClassName = className;
    }
    return newAlias || newClassName;
  };

  // 处理省略号全字显示-教学班
  handlEllipsis = (name) => {
    let newName = '';
    if (name && name.length > 10) {
      newName = `${name.substr(0, 10)}...`;
    } else {
      newName = name;
    }
    return newName;
  };

  // 行政班（单个信息）
  adminClass = item => {
    const teacherId = localStorage.getItem('teacherId');
    return [
      <div className={styles.adminInfo}>
        <div className={styles.headInfo}>
          <div className={styles.headAdmin} hidden={teacherId !== item.teacherId}>
            <img src={admin} alt="" />
          </div>
          <div className={styles.headName}>
            <Tooltip title={item.gradeAlias || item.gradeValue}>{item.gradeAlias || item.gradeValue}</Tooltip>
          </div>
        </div>
        <div className={styles.curClass}>
          <Tooltip title={item.alias || item.className}>{this.handlingEllipsis(item.alias, item.className)}</Tooltip>
        </div>
        <div className={styles.student}>
          <div>
            <span>{formatMessage({id:"app.text.classManage.teacher",defaultMessage:"老师"})}</span>
            <p>{item.teacherNum}</p>
          </div>
          <span className={styles.line} />
          <div>
            <span>{formatMessage({id:"app.text.classManage.student",defaultMessage:"学生"})}</span>
            <p>{item.studentNum}</p>
          </div>
        </div>
        <div className={styles.groupNum}>
          <span>{formatMessage({id:"app.text.classManage.Class.Number",defaultMessage:"班群号"})}：</span>
          <span>{item.classNumber}</span>
        </div>
      </div>,
    ];
  };

  // 教学班 （单个信息）
  teachClass = item => {
    return [
      <div className={styles.teachInfo}>
        <div className={styles.headInfo}>
          <div className={styles.headName}>
            <Tooltip title={item.gradeAlias || item.gradeValue}>{item.gradeAlias || item.gradeValue}</Tooltip>
          </div>
        </div>
        <div className={styles.curClass}>
          <Tooltip title={item.name}>{this.handlEllipsis(item.name)}</Tooltip>
        </div>
        <div className={styles.english}>
          <span>{item.subjectName}</span>
        </div>
        <div className={styles.student}>
          <div>
            <span>{item.studentNumber}</span>&nbsp;
            <span>{formatMessage({id:"app.text.classManageSelectedStudent",defaultMessage:"位学生"})}</span>
          </div>
        </div>
        <div className={styles.groupNum}>
          <span>{formatMessage({id:"app.text.classManage.Class.Number",defaultMessage:"班群号"})}：</span>
          <span>{item.classNumber}</span>
        </div>
      </div>,
    ];
  };

  // jsx语法视图渲染
  render() {
    const { classList } = this.props;
    const { naturalClassList, teachingClassList } = classList;
    const naturalNewClassList = naturalClassList || [];
    const teachingNewClassList = teachingClassList || [];

    // 行政班列表信息
    const AdminListInfo = () => (
      <div className={styles.listInfo}>
        <List
          style={{ marginTop: 10 }}
          grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
          dataSource={naturalNewClassList}
          renderItem={item => (
            <List.Item
              key={item.naturalClassId}
              onClick={() => this.selectedClass(item)}
            >
              <Card hoverable bodyStyle={{ paddingBottom: 20 }}>
                <div className={styles.cardItemContent}>{this.adminClass(item)}</div>
              </Card>
            </List.Item>
          )}
        />
        <div
          style={{
            display: naturalNewClassList && naturalNewClassList.length > 0 ? 'none' : 'block',
          }}
        >
          <NoData curTab="adminlist" />
        </div>
      </div>
    );

    // 教学班列表信息
    const TeachListInfo = () => (
      <div className={styles.listInfo}>
        <List
          style={{ marginTop: 10 }}
          grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
          dataSource={teachingNewClassList}
          renderItem={item => (
            <List.Item
              key={item.teachingClassId}
              className={styles.listItem}
              onClick={() => this.selectedTeacherClass(item)}
            >
              <Card hoverable bodyStyle={{ paddingBottom: 20 }}>
                <div className={styles.cardItemContent}>{this.teachClass(item)}</div>
              </Card>
            </List.Item>
          )}
        />
        <div
          style={{
            display: teachingNewClassList && teachingNewClassList.length > 0 ? 'none' : 'block',
          }}
        >
          <NoData curTab="teachlist" />
        </div>
      </div>
    );

    // 教学班列表信息
    const ClassHeadInfo = () => (
      <div className={styles.classHeadInfo}>
        <div className={styles.distance}>
          <div>{formatMessage({id:"app.menu.classallocation.adminclass",defaultMessage:"行政班"})}</div>
          <div>
            <span className={styles.number}>{naturalNewClassList.length || formatMessage({id:"app.examination.inspect.exam.no.data",defaultMessage:"无"})}</span>
            {naturalNewClassList && naturalNewClassList.length > 0 ? <b>个</b> : <b />}
          </div>
        </div>
        <div className={styles.position}>
          <span className={styles.line} />
        </div>
        <div className={styles.distance}>
          <div>{formatMessage({id:"app.menu.classallocation.teachingclass",defaultMessage:"教学班"})}</div>
          <div>
            <span className={styles.number}>{teachingNewClassList.length || formatMessage({id:"app.examination.inspect.exam.no.data",defaultMessage:"无"})}</span>
            {teachingNewClassList && teachingNewClassList.length > 0 ? <b>个</b> : <b />}
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles.classManage}>
        <ClassHeadInfo />
        <div className={styles.menuTab}>
          <Tabs>
            <TabPane
              tab={<FormattedMessage id="app.classallocation.classmanage.administrative" />}
              key="administrative"
            >
              <AdminListInfo />
            </TabPane>
            <TabPane
              tab={<FormattedMessage id="app.classallocation.classmanage.teaching" />}
              key="teaching"
            >
              <TeachListInfo />
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Clzss;
