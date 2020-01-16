/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-29
 * Time: AM 10:26
 * Explain: 非管理员列表页面
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, List, Tooltip,Empty } from 'antd';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import HeadContent from '../components/HeadContent';
import HeadNews from '../components/HeadNews';
import UserAvatar from '../../../Components/UserAvatar.js';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';

import studentHead from '@/assets/class/student_head.png';
import styles from './index.less';
// 国际化适配方式
const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
  adminclass: { id: 'app.menu.classallocation.adminclass', defaultMessage: '行政班' },
});

// connect方法可以拿取models中state值
@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/fetchNaturalClass'],
  naturalClass: clzss.naturalClass,
  filterNaturalClass: clzss.filterNaturalClass,
  adminStudents: clzss.adminStudents,
  adminTeacherList: clzss.adminTeacherList,
  adminLastDays: clzss.adminLastDays,
  currentNaturalTeach: clzss.currentNaturalTeach,
}))
class NonAdministrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curItem: (props.location.state && props.location.state.item) ? props.location.state.item : [],
    };
  }

  // 数据初始化
  componentWillMount() {
    this.getNaturalClass();
  }

  getNaturalClass = () => {
    const { dispatch,match:{params:{id}} } = this.props;
    const { curItem } = this.state;
    const that = this;
    const params = {
      id
    };
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
      callback:(data)=>{
        curItem.alias = sessionStorage.getItem('curAlias') || data.alias;
        curItem.className = sessionStorage.getItem('className') || data.className;
        curItem.classNumber =  data.classNumber;
        curItem.studentNum=data.studentList.length;
        curItem.naturalClassId=data.naturalClassId;
        curItem.grade=data.grade;
        that.setState({curItem})
        dispatch({
          type: 'clzss/saveCurrentNaturalTeach',
          payload: {
            item: curItem,
          },
        });
      }
    });
  };

  // 学生信息（单个信息）
  noClassInfo = student => {
    return [
      <div className={styles.adminInfo}>
        <div className={student.isTransient === 'Y'?`${styles.borrowing}`:''}>
          {student.isTransient === 'Y' && <div><span>{formatMessage({id:"app.menu.learngroup.jiedu",defaultMessage:"借读"})}</span></div>}
        </div>
        <div className={styles.studentInfo}>
          <div className={styles.num}>
            <span>{student.studentClassCode}</span>
            {(student.isMark === 'Y') ? (
              <span style={{ padding: '0 2px', color: '#03C46B', fontSize: '14px' }}>T</span>
            ) : (
              null
            )}
          </div>
          <div className={styles.portrait}>
            <UserAvatar id={student.accountId} />
          </div>
          <div className={styles.name}>
            <div>
              <Tooltip title={student.studentName}><span className={styles.names}>{student.studentName}</span></Tooltip>
              {student.gender === 'FEMALE' && <i className={`iconfont icon-sex-lady ${styles.sexLady}`} />}
              {student.gender !== 'FEMALE' && <i className={`iconfont icon-sex-man ${styles.sexMan}`} />}
            </div>
          </div>
        </div>
      </div>,
    ];
  };

  // jsx语法视图渲染
  render() {
    const { loading, filterNaturalClass, currentNaturalTeach, adminStudents, adminLastDays, adminTeacherList } = this.props;
    const { curItem } = this.state;

    // 行政班学生列表信息
    const NoAdminStudents = () => (
      <div className={styles.students}>
        <List
          grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
          loading={loading}
          dataSource={filterNaturalClass}
          renderItem={item => (
            <List.Item key={item.studentId}>
              <Card hoverable bodyStyle={{ paddingBottom: 20 }}>
                <div className={styles.cardItemContent}>{this.noClassInfo(item)}</div>
              </Card>
            </List.Item>
          )}
        />
        <div
          style={{
            display:
              filterNaturalClass && filterNaturalClass.length === 0 && (adminStudents && adminStudents.length > 0) 
                ? 'block'
                : 'none',
          }}
        >
          <div className={styles.nostudent}>
            <Empty image={studentHead} description={formatMessage({id:"app.text.Norelevantstudentswerefound",defaultMessage:"未搜索到相关的学生！"})} />
          </div>
        </div>
        <div
          style={{
            display:
              adminStudents && adminStudents.length === 0 
                ? 'block'
                : 'none',
          }}
        >
          <div className={styles.nostudent}>
            <Empty image={studentHead} description={formatMessage({id:"app.text.classManage.Administrators.not.added",defaultMessage:"管理员还未添加学生！"})} />
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles.nonAdministrator}>
        <h1 className={styles.menuName}>
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          {(currentNaturalTeach.alias || currentNaturalTeach.className) && <span>
            {currentNaturalTeach.alias || currentNaturalTeach.className}
            <i>/</i>
          </span>}
          {formatMessage(messages.adminclass)}
        </h1>
        {/* <HeadNews lastDays={adminLastDays} /> */}
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <HeadContent
            curItem={curItem}
            lastDays={adminLastDays}
            studentList={adminStudents || []}
            teacherList={adminTeacherList || []}
            curSelected="noAdmin"
          />
          <NoAdminStudents />
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default NonAdministrator;
