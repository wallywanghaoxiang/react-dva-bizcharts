/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-29
 * Time: AM 10:24
 * Explain: 管理员列表页面
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, List, Empty, Tooltip } from 'antd';
import Link from 'umi/link';
import { formatMessage, defineMessages } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import AdminNoData from '../components/AdminNoData';
import HeadNews from '../components/HeadNews';
import EditAliasesModal from '../components/EditAliasesModal';
import EditorStudentModal from '../components/EditorStudentModal';
import BoundEditorStudentModal from '../components/BoundEditorStudentModal';
import UpdateNumberModal from '../components/UpdateNumberModal';
import HeadContent from '../components/HeadContent';
import studentHead from '@/assets/class/student_head.png';
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import router from 'umi/router';
import UserAvatar from '../../../Components/UserAvatar';
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
class Administrator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curItem: props.location.state && props.location.state.item ? props.location.state.item : [],
      alias: '',
      id: '',
      studentInfo: {},
      visibleAliasModal: false,
      visibleNumberModal: false,
      visibleBoundStudentModal: false,
      visibleStudentModal: false,
    };
  }

  // 初始化数据调用
  componentWillMount() {
    this.getNaturalClass();
  }

  getNaturalClass = () => {
    const {
      dispatch,
      match: {
        params: { id },
      },
    } = this.props;
    const { curItem } = this.state;
    const that = this;
    const params = {
      id,
    };
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
      callback: data => {
        curItem.alias = sessionStorage.getItem('curAlias') || data.alias;
        curItem.className = sessionStorage.getItem('className') || data.className;
        curItem.classNumber = data.classNumber;
        curItem.studentNum = data.studentList.length;
        curItem.naturalClassId = data.naturalClassId;
        curItem.grade = data.grade;
        that.setState({ curItem });
        const teacherId = localStorage.getItem('teacherId');
        if (data.teacherId !== teacherId) {
          router.push({
            pathname: `/classallocation/classmanage/nonadmin/${data.naturalClassId}`,
          });
        }
        dispatch({
          type: 'clzss/saveCurrentNaturalTeach',
          payload: {
            item: curItem,
          },
        });
      },
    });
  };

  // 关闭设置别名弹窗
  aliasesModalVisible = (flag, curAlias, curId) => {
    this.setState({
      visibleAliasModal: !!flag,
      alias: curAlias,
      id: curId,
    });
  };

  // 关闭更新学号弹框
  numberModalVisible = flag => {
    this.setState({
      visibleNumberModal: !!flag,
    });
  };

  // 关闭编辑学生弹框
  studentModalVisible = flag => {
    this.setState({
      visibleStudentModal: !!flag,
    });
  };

  // 已绑定编辑学生弹框
  boundStudentModalVisible = flag => {
    this.setState({
      visibleBoundStudentModal: !!flag,
    });
  };

  // 展示编辑学生弹框
  showEditStudentModal = (flag, student) => {
    this.setState({
      visibleStudentModal: !!flag,
      studentInfo: student,
    });
  };

  // 展示绑定编辑学生弹框
  showBoundEditStudentModal = (flag, student) => {
    this.setState({
      visibleBoundStudentModal: !!flag,
      studentInfo: student,
    });
  };

  // 学生信息（单个信息）
  classInfo = student => {
    return [
      <div className={styles.admin}>
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
              ) : (
                <span style={{ padding: '0 2px', color: '#03C46B', fontSize: '14px' }}>
                  &nbsp;&nbsp;
                </span>
              )}
            </div>
            <div className={styles.portrait}>
              <UserAvatar id={student.accountId} />
            </div>
            <div className={styles.name}>
              <div>
                <Tooltip title={student.studentName}>
                  <span className={styles.names}>{student.studentName}</span>
                </Tooltip>
                {/* {student.gender === 'FEMALE' && <i className={`iconfont icon-sex-lady ${styles.sexLady}`} />}
                {student.gender === 'MALE' && <i className={`iconfont icon-sex-man ${styles.sexMan}`} />} */}
              </div>
              <div className={styles.state}>
                {student.bindStatus === 'BIND' && student.phone ? (
                  <span className={styles.binding}>
                    {formatMessage({ id: 'app.text.classManage.bind', defaultMessage: '绑定' })}：
                    <span>{student.phone}</span>
                  </span>
                ) : (
                  <span className={styles.unbinding}>
                    <span>
                      {formatMessage({
                        id: 'app.text.classManage.noBind',
                        defaultMessage: '未绑定',
                      })}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {student.bindStatus === 'BIND' && student.phone ? (
          <div
            onClick={e => {
              e.preventDefault();
              this.showBoundEditStudentModal(true, student);
            }}
            className={styles.setting}
          >
            <i className="iconfont icon-edit" />
          </div>
        ) : (
          <div
            onClick={e => {
              e.preventDefault();
              this.showEditStudentModal(true, student);
            }}
            className={styles.setting}
          >
            <i className="iconfont icon-edit" />
          </div>
        )}
      </div>,
    ];
  };

  // jsx语法视图渲染
  render() {
    const {
      loading,
      naturalClass,
      filterNaturalClass,
      adminStudents,
      adminLastDays,
      adminTeacherList,
      currentNaturalTeach,
    } = this.props;
    const {
      visibleAliasModal,
      visibleNumberModal,
      visibleStudentModal,
      visibleBoundStudentModal,
      curItem,
      alias,
      id,
      studentInfo,
    } = this.state;

    return (
      <div className={styles.administrator}>
        <h1 className={styles.menuName}>
          <Link to="/classallocation/classmanage">
            <span>
              {formatMessage(messages.classmanage)}
              <i>/</i>
            </span>
          </Link>
          {(currentNaturalTeach.alias || currentNaturalTeach.className) && (
            <span>
              {currentNaturalTeach.alias || currentNaturalTeach.className}
              <i>/</i>
            </span>
          )}
          {formatMessage(messages.adminclass)}
        </h1>
        {/* 异动显示信息组件 */}
        <HeadNews lastDays={adminLastDays} />
        {/* 设置别名弹框组件 */}
        {naturalClass.naturalClassId && (
          <EditAliasesModal
            visibleModal={visibleAliasModal}
            alias={currentNaturalTeach.alias}
            id={naturalClass.naturalClassId}
            naturalClassId={naturalClass.naturalClassId}
            hideModal={this.aliasesModalVisible}
          />
        )}
        {/* 批量更新学号弹框组件 */}
        {visibleNumberModal && adminStudents && adminStudents.length > 0 && (
          <UpdateNumberModal
            studentList={adminStudents || []}
            naturalClassId={naturalClass.naturalClassId}
            visibleModal={visibleNumberModal}
            hideModal={this.numberModalVisible}
          />
        )}
        {/* 更新绑定学生弹框组件 */}
        {visibleBoundStudentModal && (
          <BoundEditorStudentModal
            visibleModal={visibleBoundStudentModal}
            studentInfo={studentInfo}
            studentList={adminStudents}
            naturalClassId={naturalClass.naturalClassId}
            hideModal={this.boundStudentModalVisible}
          />
        )}
        {/* 更新学生弹框组件 */}
        {visibleStudentModal && (
          <EditorStudentModal
            visibleModal={visibleStudentModal}
            studentInfo={studentInfo}
            studentList={adminStudents}
            naturalClassId={naturalClass.naturalClassId}
            hideModal={this.studentModalVisible}
          />
        )}
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {/* 顶部公共组件 */}
          <HeadContent
            curItem={curItem}
            alias={naturalClass.alias || naturalClass.className}
            studentList={adminStudents || []}
            teacherList={adminTeacherList || []}
            aliasesModalVisible={this.aliasesModalVisible}
            numberModalVisible={this.numberModalVisible}
          />
          {/* 行政班空数据的情况下 */}
          {adminStudents && adminStudents.length === 0 && (
            <AdminNoData curAdminlist="adminNolist" curItem={curItem} />
          )}
          {filterNaturalClass &&
            filterNaturalClass.length === 0 &&
            (adminStudents && adminStudents.length > 0) && (
              <div className={styles.nostudent}>
                <Empty
                  image={studentHead}
                  description={formatMessage({
                    id: 'app.text.Norelevantstudentswerefound',
                    defaultMessage: '未搜索到相关的学生！',
                  })}
                />
              </div>
            )}
          <div className={styles.students}>
            <List
              grid={{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }}
              loading={loading}
              dataSource={filterNaturalClass}
              renderItem={item => (
                <List.Item>
                  <Card hoverable bodyStyle={{ paddingBottom: 20 }}>
                    <div className={styles.cardItemContent}>{this.classInfo(item)}</div>
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

export default Administrator;
