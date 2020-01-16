import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider } from 'antd';
import router from 'umi/router';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import noClassPic from '@/assets/student/index_none_class_pic.png';
import schoolGirl from '@/assets/student/female.png';
import schoolBoy from '@/assets/student/male.png';
import smallLogo from '@/assets/student/user_id_icon.png';
import ClassTag from '../Center/components/BasicInfo/ClassTag/index';
import noDataPic from '@/assets/student/nodata_student.png';
import TaskItem from '../LearnCenter/components/TaskItem/index';

const messages = defineMessages({
  welcomTxt1: { id: 'app.student.home.welcom.tip1', defaultMessage: '欢迎来到' },
  welcomTxt2: { id: 'app.student.home.welcom.tip2', defaultMessage: '高耘AI' },
  welcomTxt3: { id: 'app.student.home.welcom.tip3', defaultMessage: '的有趣世界' },
  joinClassTip: {
    id: 'app.student.home.join.class.tip',
    defaultMessage: '快快加入你所在学校的班级，和小伙伴们一起学习吧',
  },
  joinClassBtnTit: { id: 'app.student.home.join.class.btn.title', defaultMessage: '立即加入班级' },
  learnCenter: { id: 'app.student.learning.center', defaultMessage: '学情中心' },
  more: { id: 'app.student.home.load.more.btn.title', defaultMessage: '更多' },
  noDataTip1: { id: 'app.student.home.no.data.tip1', defaultMessage: '暂时还没有任务哦,' },
  noDataTip2: { id: 'app.student.home.no.data.tip2', defaultMessage: '先休息一下吧^_^' },
});
@connect(({ login, file, student, loading }) => {
  const { studentInfoList } = login;
  const { userImgPath } = file;
  const { list } = student;
  const listLoading = loading.effects['student/homeList'];
  const studentInfoLoading = loading.effects['login/queryStudentInfoList'];
  return {
    studentInfoList,
    userImgPath,
    list,
    listLoading,
    studentInfoLoading,
  };
})
class StudentHome extends Component {
  state = {};

  componentWillMount() {
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const studentId = localStorage.getItem('studentId');
    if (campusId && studentId) {
      dispatch({
        type: 'student/homeList',
        payload: {
          campusId,
          studentId,
        },
      });
    }
  }

  // 加入班级
  goJoinClass = () => {
    router.push('/student/center');
  };

  // 更多
  clickMore = () => {
    router.push('/student/learncenter');
  };

  render() {
    const { studentInfoList, userImgPath, list, listLoading, studentInfoLoading } = this.props;
    const gender = localStorage.getItem('gender');
    const defaultAvatar = gender === 'MALE' ? schoolBoy : schoolGirl;
    const userName = localStorage.getItem('name');
    const vbNumber = localStorage.getItem('vbNumber');

    const campusId = localStorage.getItem('campusId');
    let currentCampus = null;
    if (campusId) {
      currentCampus = studentInfoList.find(tag => tag.campusId === campusId);
    } else {
      const [firstCampus] = studentInfoList;
      currentCampus = firstCampus;
    }
    const campusName =
      localStorage.getItem('campusName') ||
      (currentCampus && currentCampus.campusName ? currentCampus.campusName : '');
    // console.log('-----currentCampus:',currentCampus);
    return (
      <div className={styles.studentHomeContainer}>
        {/* 未加入班级 */}
        {studentInfoList.length === 0 && !studentInfoLoading && (
          <div className={styles.noClassBox}>
            <img src={noClassPic} alt="noClassPic" />
            <div className={styles.welcomTxt}>
              {formatMessage(messages.welcomTxt1)}
              <span>{formatMessage(messages.welcomTxt2)}</span>
              {formatMessage(messages.welcomTxt3)}
            </div>
            <div className={styles.tip}>{formatMessage(messages.joinClassTip)}</div>
            <div className={styles.addBtn} onClick={this.goJoinClass}>
              {formatMessage(messages.joinClassBtnTit)}
            </div>
          </div>
        )}

        {/* 已加入班级 */}
        {studentInfoList.length > 0 && (
          <div className={styles.alreadyJoinBox}>
            <div className={styles.left}>
              {/* 个人信息 */}
              <div className={styles.headerBox}>
                <img className={styles.avatarImg} src={userImgPath || defaultAvatar} alt="avatar" />
                <div className={styles.name}>{userName}</div>
                <div className={styles.VBNumber}>
                  <img src={smallLogo} alt="smallLogo" />
                  <Divider type="vertical" />
                  <span>{vbNumber}</span>
                </div>
              </div>
              {/* 学校信息 */}
              <div className={styles.joinCampusInfo}>
                <div className={styles.campusName}>{campusName}</div>
                {currentCampus && (
                  <div className={styles.classList}>
                    {currentCampus.classList.map(tag => {
                      return <ClassTag data={tag} key={tag.classId} />;
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.top}>
                <div className={styles.topLeft}>
                  <Divider type="vertical" />
                  <span className={styles.tit}>{formatMessage(messages.learnCenter)}</span>
                </div>
                <div className={styles.topRight} onClick={this.clickMore}>
                  <span>{formatMessage(messages.more)}</span>
                  <i className="iconfont icon-link-arrow" />
                </div>
              </div>
              {/* 数据列表 */}
              {list.length > 0 ? (
                <div className={styles.listBox}>
                  {list.map((item, idx) => {
                    return (
                      <TaskItem
                        key={item.taskId + idx}
                        item={item}
                        onEditTaskName={() => {}}
                        onDeleteTask={() => {}}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={styles.dataBox}>
                  <div className={styles.noData}>
                    <img src={noDataPic} alt="noData" />
                    <div className={styles.noTip}>
                      {formatMessage(messages.noDataTip1)}
                      <br />
                      {formatMessage(messages.noDataTip2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default StudentHome;
