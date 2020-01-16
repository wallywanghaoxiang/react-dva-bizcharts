/**
 *
 * User: tina.zhang
 * Explain: 教学班
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, List, Empty, Tooltip } from 'antd';
import Link from 'umi/link';
import cs from 'classnames';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import TeachingNoData from './components/TeachingNoData';
import EditAliasesModal from './components/EditAliasesModal';
import UpdateNumberModal from './components/UpdateNumberModal';
import EditorStudentModal from './components/EditorStudentModal';
import studentHead from '@/assets/class/student_head.png';
import HeadNews from './components/HeadNews';
import HeadContent from './components/HeadContent';
import userlogo from '@/assets/avarta_teacher.png';
import UserAvatar from '../../Components/UserAvatar';
import styles from './index.less';

const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
  teachingclass: { id: 'app.menu.classallocation.teachingclass', defaultMessage: '教学班' },
});

@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/getTeachingStudents'],
  teachingStudents: clzss.teachingStudents,
  filterTeachStudent: clzss.filterTeachStudent,
  teachLastDays: clzss.teachLastDays,
  teachName: clzss.teachName,
  teachingID: clzss.teachingID,
}))
class TeachingClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curItem: {},
      currentStudent: {},
      visibleAliasModal: false,
      visibleNumberModal: false,
      visibleEditModal: false,
    };
  }

  componentWillMount() {
    this.fetchNaturalClass();
  }

  // 获取该教学班的学生列表
  fetchNaturalClass = () => {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    const { curItem } = this.state;
    const that = this;
    dispatch({
      type: 'clzss/getTeachingStudents',
      payload: id,
      callback: data => {
        curItem.name = data.name;
        curItem.gradeValue = data.gradeValue;
        curItem.grade = data.grade;
        curItem.subjectId = data.subjectId;
        curItem.subjectName = data.subjectName;
        curItem.lastDays = data.lastDays;
        curItem.classNumber = data.classNumber;
        curItem.studentNumber = data.studentList.length;
        curItem.teachingClassId = data.id;
        curItem.classIndex = data.classIndex;
        curItem.id = data.id;
        that.setState({ curItem });
      },
    });
  };

  // 关闭设置别名弹窗
  aliasesModalVisible = flag => {
    this.setState({
      visibleAliasModal: !!flag,
    });
  };

  // 关闭更新学号弹框
  numberModalVisible = flag => {
    this.setState({
      visibleNumberModal: !!flag,
    });
  };

  // 编辑学生
  editerStudent = student => {
    this.setState({
      currentStudent: student,
      visibleEditModal: true,
    });
  };

  editModalVisible = flag => {
    this.setState({
      visibleEditModal: !!flag,
    });
  };

  // 学生信息（单个信息）
  noClassInfo = student => {
    return [
      <div className={styles.admin}>
        <div className={styles.adminInfo}>
          <div className={styles.borrowing}>
            <div hidden={student.isTransient === 'N' || student.isTransient === null}>
              <span>
                {formatMessage({ id: 'app.menu.learngroup.jiedu', defaultMessage: '借读' })}
              </span>
            </div>
          </div>
          <div className={styles.studentInfo}>
            <div className={styles.num}>
              <span>{student.studentClassCode}</span>
            </div>
            <div className={styles.portrait}>
              <UserAvatar id={student.accountId} />
            </div>
            <div className={styles.name}>
              <div className={styles.sex}>
                <span className={styles.studentDetailName}>
                  <Tooltip title={student.studentName}>{student.studentName}</Tooltip>
                </span>
                {/* {(student.gender === 'FEMALE'||student.gender === null)&&<i className="iconfont icon-sex-lady" />}
                {student.gender === 'MALE'&&<i className="iconfont icon-sex-man" />} */}
              </div>
              <div className={styles.grade}>
                <span>{student.naturalClassName}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.setting}>
          <i className="iconfont icon-edit" onClick={() => this.editerStudent(student)} />
        </div>
      </div>,
    ];
  };

  render() {
    const {
      loading,
      filterTeachStudent,
      teachName,
      teachLastDays,
      teachingStudents,
      teachingID,
    } = this.props;
    const {
      visibleAliasModal,
      visibleNumberModal,
      curItem,
      currentStudent,
      visibleEditModal,
    } = this.state;

    return (
      <div className={styles.teachingClass}>
        <h1 className={styles.menuName}>
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          <span>
            {teachName}
            <i>/</i>
          </span>
          {formatMessage(messages.teachingclass)}
        </h1>
        <HeadNews lastDays={teachLastDays} />
        {/* 设置别名弹框组件 */}
        <EditAliasesModal
          alias={teachName}
          curItem={curItem}
          id={curItem.id}
          teachingClassId={curItem.id}
          visibleModal={visibleAliasModal}
          hideModal={this.aliasesModalVisible}
        />
        {/* 批量更新学号弹框组件 */}
        {visibleNumberModal && (
          <UpdateNumberModal
            studentList={teachingStudents || []}
            teachingClassId={curItem.id}
            visibleModal={visibleNumberModal}
            hideModal={this.numberModalVisible}
          />
        )}
        {/* 编辑学生信息 */}
        <EditorStudentModal
          studentInfo={currentStudent}
          visibleModal={visibleEditModal}
          teachingClassId={curItem.id}
          hideModal={this.editModalVisible}
        />
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {curItem && curItem.id && (
            <HeadContent
              curItem={curItem}
              aliasesModalVisible={this.aliasesModalVisible}
              numberModalVisible={this.numberModalVisible}
              curSelected="teaching"
            />
          )}
          {teachingStudents && teachingStudents.length === 0 && loading === false && (
            <TeachingNoData
              grade={curItem.grade}
              name={curItem.name}
              id={curItem.id}
              lastDays={teachLastDays}
              subjectId={curItem.subjectId}
              curItem={curItem}
            />
          )}
          {filterTeachStudent && filterTeachStudent.length === 0 && teachingStudents.length > 0 && (
            <Empty
              image={studentHead}
              description={formatMessage({
                id: 'app.text.Norelevantstudentswerefound',
                defaultMessage: '未搜索到相关的学生！',
              })}
            />
          )}
          <div className={styles.students}>
            <List
              grid={{ gutter: 24, xl: 4, lg: 2, md: 2, sm: 2, xs: 2 }}
              loading={loading}
              dataSource={filterTeachStudent}
              renderItem={item => (
                <List.Item>
                  <Card hoverable bodyStyle={{ paddingBottom: 20 }}>
                    <div className={styles.cardItemContent}>{this.noClassInfo(item)}</div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default TeachingClass;
