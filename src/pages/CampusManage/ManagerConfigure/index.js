import React, { Component } from 'react';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ManagerAvatar from '../Components/ManagerAvatar/index';
import AddManagerModal from '../Components/AddManagerModal/index';

const messages = defineMessages({
  deleteModalTip1: {
    id: 'app.campus.manage.manager.delete.modal.tip1',
    defaultMessage: '确认解除',
  },
  deleteModalTip2: {
    id: 'app.campus.manage.manager.delete.modal.tip2',
    defaultMessage: '的学科管理员权限吗',
  },
  dissolutionBtnTit: {
    id: 'app.campus.manage.manager.delete.modal.btn.title',
    defaultMessage: '解除',
  },
  cancle: { id: 'app.cancel', defaultMessage: '取消' },
  deleteSuccess: { id: 'app.campus.manage.manager.delete.success', defaultMessage: '解除成功！' },
  campusManage: { id: 'app.menu.campusmanage', defaultMessage: '校区管理' },
  managerConfigTit: { id: 'app.campus.manage.manager.config.title', defaultMessage: '学科管理员' },
  campusManagerTit: { id: 'app.campus.manager.title', defaultMessage: '校区管理员' },
  subjectManagerTit: { id: 'app.subject.manager.title', defaultMessage: '学科管理员' },
  addManagerTip: { id: 'app.manager.btn.tip', defaultMessage: '指定管理员' },
});
@connect(({ campusmanage }) => {
  const { campusConfigInfo, allSubject } = campusmanage;

  return { campusConfigInfo, allSubject };
})
class ManagerConfigure extends Component {
  state = {
    addManagerModalVisable: false,
    campusOwner: null, // 校区管理员
    subjectOwners: [], // 学科管理员
  };

  componentWillMount() {
    this.getCampusManager(false);
    this.getAllSubject();
    this.getTeacherList();
  }

  // 获取学科管理老师
  getTeacherList = () => {
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const pageSize = 0x7fffffff; // int类型的最大值
    const params = {
      pageIndex: 1,
      pageSize,
      campusId,
      filterWord: '',
    };
    dispatch({
      type: 'campusmanage/subjectTeacherList',
      payload: params,
    });
  };

  // 获取校区所有管理员
  getCampusManager = isDelete => {
    const { dispatch } = this.props;
    dispatch({
      type: 'campusmanage/campusManager',
      payload: {},
      callback: res => {
        if (res.responseCode === '200') {
          const campusOwner = res.data.find(item => item.roleCode === 'CampusOwner');
          const subjectOwners = res.data.filter(
            item => item.roleCode === 'CampusAdmin' || item.roleCode === null
          );
          this.setState(
            {
              campusOwner,
              subjectOwners,
            },
            () => {
              // 删除管理员重新获取管理员信息后关闭弹窗
              if (isDelete) {
                Modal.destroyAll();
              }
            }
          );
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  // 获取校区学科
  getAllSubject = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'campusmanage/allSubject',
      payload: {},
    });
  };

  addManager = () => {
    this.setState({
      addManagerModalVisable: true,
    });
  };

  // 指定管理员
  addSubjectManager = (item, grade) => {
    // console.log(item);
    const { dispatch, allSubject } = this.props;
    const subject = allSubject[0];
    const { subjectCode } = subject;
    const { teacherId } = item;
    const campusId = localStorage.getItem('campusId');
    const params = {
      campusId,
      subjectCode, // 科目代码
      teacherId,
      gradeId: grade,
    };
    dispatch({
      type: 'campusmanage/addSubjectManager',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          this.setState({
            addManagerModalVisable: false,
          });
          this.getCampusManager();
          this.getTeacherList();
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  // 删除学科管理员
  deleteSubjectManager = item => {
    // console.log(item);
    const { dispatch } = this.props;

    Modal.confirm({
      content: (
        <div className="cont">
          <span>{formatMessage(messages.deleteModalTip1)}</span>
          <span className="name">{item.teacherName}</span>
          <span>{formatMessage(messages.deleteModalTip2)}？</span>
        </div>
      ),
      okText: formatMessage(messages.dissolutionBtnTit),
      centered: true,
      cancelText: formatMessage(messages.cancle),
      onOk: () => {
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
          const params = {
            adminId: item.id,
          };
          dispatch({
            type: 'campusmanage/deleteSubjectManager',
            payload: params,
            callback: res => {
              const resJson = JSON.parse(JSON.stringify(res));
              if (resJson.responseCode === '200') {
                const mgs = formatMessage(messages.deleteSuccess);
                message.success(mgs);
                this.getCampusManager(true);
                this.getTeacherList();
              } else {
                const mgs = res.data;
                message.warning(mgs);
              }
              // Modal.destroyAll();
            },
          });
        }).catch(() => console.log('Oops errors!'));
      },
    });
  };

  render() {
    const { addManagerModalVisable, campusOwner, subjectOwners } = this.state;
    return (
      <div className={styles.managerCampusConfigure}>
        <h1 className={styles.tit}>
          {formatMessage(messages.campusManage)}
          <span className={styles.division}>/</span>
          <span className={styles.subTit}>{formatMessage(messages.managerConfigTit)}</span>
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {/* 校区管理员 */}
          <div className={styles.campusManager}>
            <div className={styles.setTitle}>{formatMessage(messages.campusManagerTit)}</div>
            <div className={styles.campusManagerCont}>
              <ManagerAvatar
                key={campusOwner ? campusOwner.id : 'ownerAvatar'}
                item={campusOwner}
              />
            </div>
          </div>
          {/* 学科管理员 */}
          <div className={styles.campusManager}>
            <div className={styles.setTitle}>{formatMessage(messages.subjectManagerTit)}</div>
            <div className={styles.subjectManagerCont}>
              {subjectOwners.map(item => {
                return (
                  <ManagerAvatar
                    key={item.id}
                    item={item}
                    onDelete={() => this.deleteSubjectManager(item)}
                  />
                );
              })}
            </div>
          </div>
          <div className={styles.addBtn} onClick={this.addManager}>
            <i className="iconfont icon-add" />
          </div>
          <div className={styles.addBtnTip}>{formatMessage(messages.addManagerTip)}</div>
        </PageHeaderWrapper>
        <AddManagerModal
          visible={addManagerModalVisable}
          onCancel={() => {
            this.setState({
              addManagerModalVisable: false,
            });
          }}
          onAddManager={(item, grade) => this.addSubjectManager(item, grade)}
        />
      </div>
    );
  }
}

export default ManagerConfigure;
