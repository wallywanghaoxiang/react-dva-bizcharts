import React, { Component } from 'react';
import { Tabs, Button, Modal, Form, Input, message } from 'antd';
import { Link } from 'dva/router';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { Trim, phoneReg } from '@/utils/utils';
import ItemCard from './components/ItemCard';
import NoData from './components/NoData';
import SearchBar from '@/components/SearchBar';
import styles from './index.less';

const messages = defineMessages({
  teacherNammeInputPlaceholder: {
    id: 'app.add.teacher.modal.name.input.placeholder',
    defaultMessage: '请输入教师姓名',
  },
  teacherNammeInputTip: {
    id: 'app.add.teacher.modal.name.input.tip',
    defaultMessage: '请输入教师姓名！',
  },
  phoneInputPlaceholder: {
    id: 'app.add.teacher.modal.phone.input.placeholder',
    defaultMessage: '请输入教师注册手机号',
  },
  phoneInputTip: {
    id: 'app.add.teacher.modal.phone.input.tip',
    defaultMessage: '请输入教师注册手机号！',
  },
  phoneInputTip1: {
    id: 'app.add.teacher.modal.phone.input.tip1',
    defaultMessage: '手机输入格式不正确！',
  },
  addModalTitle: { id: 'app.add.teacher.modal.title', defaultMessage: '添加教师' },
  okText: { id: 'app.save', defaultMessage: '保存' },
  cancelText: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确认' },
  delete: { id: 'app.delete', defaultMessage: '删除' },
  stopBtn: { id: 'app.stop.account.btn.title', defaultMessage: '停用' },
  startBtn: { id: 'app.start.account.btn.title', defaultMessage: '启用' },
  deleteTipStart: { id: 'app.confirm.delete.teacher.content.start', defaultMessage: '确认删除' },
  deleteTipEnd: { id: 'app.confirm.delete.teacher.content.end', defaultMessage: '的教师信息？' },

  stopAccountTipStart: {
    id: 'app.confirm.stop.account.teacher.content.start',
    defaultMessage: '确认停用',
  },
  startAccountTipStart: {
    id: 'app.confirm.start.account.teacher.content.start',
    defaultMessage: '确认启用',
  },
  stopAccountTipEnd: {
    id: 'app.confirm.stop.account.teacher.content.end',
    defaultMessage: '的教师账号？',
  },
  TeacherManage: { id: 'app.teacer.manage', defaultMessage: '教师管理' },
  CountPeople: { id: 'app.teacher.account.count', defaultMessage: '总人数' },
  Unbind: { id: 'app.teacher.account.unbind', defaultMessage: '未绑定' },
  People: { id: 'app.teacher.account.people', defaultMessage: '人' },
  Add: { id: 'app.teacher.account.add', defaultMessage: '添加' },
  Import: { id: 'app.teacher.account.import', defaultMessage: '导入' },
  Search: { id: 'app.teacher.account.search', defaultMessage: '请输入姓名/手机号搜索教师信息' },
  All: { id: 'app.teacher.account.all', defaultMessage: '全部' },
  Bind: { id: 'app.teacher.account.bind', defaultMessage: '已绑定' },
  Stop: { id: 'app.teacher.account.stop', defaultMessage: '已停用' },
  resetPwTip: {
    id: 'app.confirm.reset.teacher.pw.content',
    defaultMessage: '确认重置该教师密码？',
  },
  addSuccessToast: { id: 'app.teacher.add.success.tip', defaultMessage: '教师添加成功！' },
  editSuccessToast: { id: 'app.teacher.edit.success.tip', defaultMessage: '教师信息修改成功！' },
  deleteSuccessToast: { id: 'app.teacher.delete.success.tip', defaultMessage: '教师删除成功！' },
  resetPwSuccessToast: {
    id: 'app.teacher.reset.pw.success.tip',
    defaultMessage: '重置教师账号密码成功！',
  },
  iKnow: { id: 'app.teacher.stop.account.modal.btn.title', defaultMessage: '我知道了' },
  stopAccTip: {
    id: 'app.teacher.stop.account.tip',
    defaultMessage: '该教师名下仍存在班级，请更换班级教师或解散班级后再停用！',
  },
  teacher: { id: 'app.teacher.submenu.title', defaultMessage: '教师' },
});

const { TabPane } = Tabs;

@connect(({ teachermanage, login, loading }) => ({
  loading: loading.effects['teachermanage/fetchTeacherList'],
  teacherInfoList: teachermanage.teacherInfoList,
  filterTeacherInfoList: teachermanage.filterTeacherInfoList,
  campusID: login.campusID,
}))
class TeacherManage extends Component {
  state = {
    addTeacherPopup: false,
    modalLoading: false,
    editing: true,
    errorInfo: '',
  };

  componentWillMount() {
    this.fetchTeacherList('');
  }

  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {
      this.fetchTeacherList('');
    }
  }

  onSearch(data) {
    this.fetchTeacherList(data);
  }

  fetchTeacherList = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'teachermanage/fetchTeacherList',
      payload: {
        filterWord: data ? encodeURI(data) : '',
      },
    });
  };

  toggleAddTeacherPopup = tag => {
    const { addTeacherPopup } = this.state;
    const newVal = typeof tag !== 'boolean' ? !addTeacherPopup : tag;
    this.setState({ addTeacherPopup: newVal, errorInfo: '' });
  };

  // 显示添加教师弹窗
  addTeacher = () => {
    this.toggleAddTeacherPopup();
  };

  // 编辑老师
  editTeacher = (id, name, phone) => {
    const { dispatch } = this.props;
    const params = {
      name,
      mobile: phone,
      teacherId: id,
    };

    dispatch({
      type: 'teachermanage/edit',
      payload: params,
      callback: res => {
        if (res && res.responseCode !== '200') {
          const mgs = res.data;
          message.warning(mgs);
        } else {
          // 编辑成功
          this.setState({
            editing: false,
          });
          const mgs = formatMessage(messages.editSuccessToast);
          message.success(mgs);
          this.fetchTeacherList('');
        }
      },
    });
  };

  // 删除老师
  deleteTeacher = item => {
    const { dispatch } = this.props;
    Modal.confirm({
      content: (
        <div className="cont">
          {formatMessage(messages.deleteTipStart)}
          <span className="name">{item.name}</span>
          {formatMessage(messages.deleteTipEnd)}
        </div>
      ),
      okText: formatMessage(messages.delete),
      centered: true,
      cancelText: formatMessage(messages.cancelText),
      onOk: () => {
        const params = {
          teacherId: item.id,
        };
        dispatch({
          type: 'teachermanage/delete',
          payload: params,
          callback: res => {
            if (res && res.responseCode !== '200') {
              const mgs = res.data;
              message.warning(mgs);
            } else {
              const mgs = formatMessage(messages.deleteSuccessToast);
              message.success(mgs);
              this.fetchTeacherList('');
            }
          },
        });
      },
    });
  };

  // 切换状态
  switchStatus = (status, item) => {
    const { dispatch } = this.props;
    let okBtn;
    if (status) {
      // 启用
      okBtn = formatMessage(messages.startBtn);
    } else {
      // 停用
      okBtn = formatMessage(messages.stopBtn);
    }
    Modal.confirm({
      content: (
        <div className="cont">
          {status
            ? formatMessage(messages.startAccountTipStart)
            : formatMessage(messages.stopAccountTipStart)}
          <span className="name">{item.name}</span>
          {formatMessage(messages.stopAccountTipEnd)}
        </div>
      ),
      okText: okBtn,
      centered: true,
      cancelText: formatMessage(messages.cancelText),
      onOk: () => {
        const params = {
          teacherId: item.id,
          status: status ? 'Y' : 'N',
        };
        dispatch({
          type: 'teachermanage/changeStatus',
          payload: params,
          callback: res => {
            if (res && res.responseCode === '200') {
              const mgs = status ? (
                <FormattedMessage
                  id="app.teacher.status.start.success.tip"
                  values={{ name: item.name }}
                  defaultMessage="您已成功启用 {name} 的教师账号！"
                />
              ) : (
                <FormattedMessage
                  id="app.teacher.status.stop.success.tip"
                  values={{ name: item.name }}
                  defaultMessage="您已成功停用 {name} 的教师账号！"
                />
              );
              message.success(mgs);
              this.fetchTeacherList('');
            } else if (res.responseCode === '460') {
              Modal.confirm({
                content: (
                  <div className="cont">
                    <span>{formatMessage(messages.stopAccTip)}</span>
                  </div>
                ),
                okText: formatMessage(messages.iKnow),
                centered: true,
                className: 'noStuModal',
                cancelText: '',
                cancelButtonProps: { style: { display: 'none' } },
                okButtonProps: {
                  style: {
                    'background-color': '#FFFFFF',
                    'border-radius': '18px',
                    border: '1px solid rgba(204,204,204,1)',
                    'box-shadow': 'none',
                    color: '#888',
                    'text-shadow': 'none',
                  },
                },
                onOk: () => {},
              });
            } else {
              const mgs = res.data;
              message.warning(mgs);
            }
          },
        });
      },
    });
  };

  // 重置密码
  resetPWTeacher = (accountId, value) => {
    const { dispatch } = this.props;
    const params = {
      accountId,
      password: value,
    };

    dispatch({
      type: 'login/resetPWInfo',
      payload: params,
      callback: () => {
        const mgs = formatMessage(messages.resetPwSuccessToast);
        message.success(mgs);
        this.fetchTeacherList('');
      },
    });
  };

  // 去空格
  checkBlankSpace = (rules, value, callback) => {
    const str = Trim(value, 'g');
    if (str === '') {
      const mgs = formatMessage(messages.teacherNammeInputTip);
      callback(mgs);
    } else {
      callback();
    }
  };

  // 重新发送邀请
  handleResend = item => {
    const { dispatch } = this.props;
    const params = {
      teacherId: item.id,
    };

    dispatch({
      type: 'login/resendInvitation',
      payload: params,
      callback: () => {
        const mgs = formatMessage({
          id: 'app.message.resend.success',
          defaultMessage: '邀请发送成功！',
        });
        message.success(mgs);
        this.fetchTeacherList('');
      },
    });
  };

  // 添加老师
  importTeacher = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'teachermanage/importTeacher',
      payload: params,
      callback: res => {
        if (res && res.responseCode !== '200') {
          const mgs = res.data;
          message.warning(mgs);
        } else {
          // 添加成功
          const mgs = formatMessage(messages.addSuccessToast);
          message.success(mgs);
          this.toggleAddTeacherPopup();
          this.fetchTeacherList('');
        }
        this.setState({
          modalLoading: false,
        });
      },
    });
  };

  render() {
    const { addTeacherPopup, modalLoading, editing, errorInfo } = this.state;
    const { form, teacherInfoList, loading, filterTeacherInfoList } = this.props;
    const { teacherList, bindNum, totalNum, unbindNum, unActiveNum } = teacherInfoList;
    const { getFieldDecorator } = form;
    console.log(loading);
    return (
      <div className={styles['teacher-manager']}>
        {/* <h1 className={styles.stylesName}>{formatMessage(messages.TeacherManage)}</h1> */}
        <h1 className={styles.tit}>
          {formatMessage(messages.TeacherManage)}
          <span className={styles.division}>/</span>
          <span className={styles.subTit}>{formatMessage(messages.teacher)}</span>
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <div
            style={{
              display: teacherList && teacherList.length > 0 ? 'none' : 'block',
            }}
          >
            {loading === false && totalNum > 0 && <NoData addTeach={this.addTeacher} />}
          </div>

          <div
            style={{
              display: teacherList && teacherList.length > 0 ? 'block' : 'none',
            }}
          >
            <div className={styles.teacherAll}>
              <span className={styles.itemNumber}>
                <span>{formatMessage(messages.CountPeople)}</span>
                <i>{totalNum}</i>
                <b>{formatMessage(messages.People)}</b>
              </span>
              <span className={styles.itemNumber}>
                <span>{formatMessage(messages.Bind)}</span>
                <i>{bindNum}</i>
                <b>{formatMessage(messages.People)}</b>
              </span>
              <span className={styles.itemNumber}>
                <span>{formatMessage(messages.Unbind)}</span> <i>{unbindNum}</i>
                <b>{formatMessage(messages.People)}</b>
              </span>
              <span className={styles.itemNumberLast}>
                <span>{formatMessage(messages.Stop)}</span> <i>{unActiveNum}</i>
                <b>{formatMessage(messages.People)}</b>
              </span>

              <Link to="/campusmanage/teacherMange/import">
                <Button className={styles.upload}>
                  <i className="iconfont icon-upload" />
                  {formatMessage(messages.Import)}
                </Button>
              </Link>
              <Button className={styles.add} onClick={this.addTeacher}>
                <i className="iconfont icon-add" />
                {formatMessage(messages.Add)}
              </Button>
            </div>
            <div className={styles.result}>
              <SearchBar
                placeholder={formatMessage(messages.Search)}
                onSearch={data => this.onSearch(data)}
              />
              <div className={styles.cardName}>
                <Tabs defaultActiveKey="1" type="card">
                  <TabPane tab={formatMessage(messages.All)} key="1">
                    <ItemCard
                      editing={editing}
                      onEditTeacher={(id, name, phone) => this.editTeacher(id, name, phone)}
                      onDeleteTeacher={item => this.deleteTeacher(item)}
                      onResend={item => this.handleResend(item)}
                      onSwitchStatus={(status, item) => this.switchStatus(status, item)}
                      onResetPWTeacher={(getAccountId, value) =>
                        this.resetPWTeacher(getAccountId, value)
                      }
                      data={filterTeacherInfoList.teacherList}
                      teacherList={teacherList}
                    />
                  </TabPane>
                  <TabPane tab={formatMessage(messages.Bind)} key="2">
                    <ItemCard
                      editing={editing}
                      onEditTeacher={(id, name, phone) => this.editTeacher(id, name, phone)}
                      onDeleteTeacher={item => this.deleteTeacher(item)}
                      onResend={item => this.handleResend(item)}
                      onSwitchStatus={(status, item) => this.switchStatus(status, item)}
                      onResetPWTeacher={(getAccountId, value) =>
                        this.resetPWTeacher(getAccountId, value)
                      }
                      data={
                        filterTeacherInfoList.teacherList &&
                        filterTeacherInfoList.teacherList.filter(data => data.bindStatus === 'BIND')
                      }
                      teacherList={teacherList}
                    />
                  </TabPane>
                  <TabPane tab={formatMessage(messages.Unbind)} key="3">
                    <ItemCard
                      editing={editing}
                      onEditTeacher={(id, name, phone) => this.editTeacher(id, name, phone)}
                      onDeleteTeacher={item => this.deleteTeacher(item)}
                      onResend={item => this.handleResend(item)}
                      onSwitchStatus={(status, item) => this.switchStatus(status, item)}
                      onResetPWTeacher={(getAccountId, value) =>
                        this.resetPWTeacher(getAccountId, value)
                      }
                      data={
                        filterTeacherInfoList.teacherList &&
                        filterTeacherInfoList.teacherList.filter(
                          data =>
                            data.bindStatus === 'UNBIND' ||
                            data.bindStatus === null ||
                            data.bindStatus === 'REFUSE'
                        )
                      }
                      teacherList={teacherList}
                    />
                  </TabPane>
                  <TabPane tab={formatMessage(messages.Stop)} key="4">
                    <ItemCard
                      editing={editing}
                      onEditTeacher={(id, name, phone) => this.editTeacher(id, name, phone)}
                      onDeleteTeacher={item => this.deleteTeacher(item)}
                      onResend={item => this.handleResend(item)}
                      onSwitchStatus={(status, item) => this.switchStatus(status, item)}
                      onResetPWTeacher={(getAccountId, value) =>
                        this.resetPWTeacher(getAccountId, value)
                      }
                      data={
                        filterTeacherInfoList.teacherList &&
                        filterTeacherInfoList.teacherList.filter(data => data.status === 'N')
                      }
                      teacherList={teacherList}
                    />
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </div>
        </PageHeaderWrapper>

        {/* 添加教师 */}
        <Modal
          title={formatMessage(messages.addModalTitle)}
          okText={formatMessage(messages.okText)}
          cancelText={formatMessage(messages.cancelText)}
          width={360}
          closable={false}
          centered
          visible={addTeacherPopup}
          okButtonProps={{ loading: modalLoading }}
          onCancel={this.toggleAddTeacherPopup}
          destroyOnClose
          onOk={() => {
            form.validateFields((err, values) => {
              // console.log(err, values);
              const { dispatch } = this.props;
              if (err) {
                const { phone, teachername } = err;
                if (teachername) {
                  const nameErr = teachername.errors;
                  const mgs = nameErr[0].message;
                  this.setState({
                    errorInfo: mgs,
                  });
                  return;
                }
                if (phone) {
                  const phoneErr = phone.errors;
                  const mgs = phoneErr[0].message;
                  this.setState({
                    errorInfo: mgs,
                  });
                  return;
                }
              }
              if (!err) {
                // VB-4006 单独添加老师需求变更

                // 1.检查手机号是否已存在
                const campusId = localStorage.getItem('campusId');
                const { teachername: name, phone } = values;
                const teachers = [
                  {
                    campusId,
                    name,
                    mobile: phone,
                    index: 0,
                  },
                ];
                dispatch({
                  type: 'teachermanage/checkMobile',
                  payload: teachers,
                  callback: res => {
                    if (res.responseCode === '200') {
                      const { data } = res;
                      if (data && data.length > 0 && data[0].isSameMobile) {
                        this.setState({
                          errorInfo: '该手机号码已存在，不可重复添加',
                        });
                      } else {
                        // 2.不存在则添加
                        this.setState({
                          errorInfo: '',
                          modalLoading: true,
                        });
                        const obj = {
                          campusId, // 校区id
                          name,
                          mobile: phone,
                        };
                        const params = [];
                        params.push(obj);
                        this.importTeacher(params);
                      }
                    }
                  },
                });
              }
            });
          }}
          className="addTeacherModal"
        >
          <div className="add-teacher">
            <Form>
              <Form.Item style={{ borderBottom: '1px solid #E5E5E5' }}>
                {getFieldDecorator('teachername', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage(messages.teacherNammeInputTip),
                    },
                    {
                      validator: this.checkBlankSpace,
                    },
                  ],
                })(
                  <Input
                    placeholder={formatMessage(messages.teacherNammeInputPlaceholder)}
                    maxLength={20}
                  />
                )}
              </Form.Item>
            </Form>
            <Form.Item style={{ borderBottom: '1px solid #E5E5E5' }}>
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: formatMessage(messages.phoneInputTip),
                  },
                  {
                    pattern: phoneReg,
                    message: formatMessage(messages.phoneInputTip1),
                  },
                ],
              })(
                <Input placeholder={formatMessage(messages.phoneInputPlaceholder)} maxLength={11} />
              )}
            </Form.Item>
            <Form.Item>{errorInfo && <div className="errorInfo">{errorInfo}</div>}</Form.Item>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(TeacherManage);
