import React, { Component } from 'react';
import { List, Switch, Empty, Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import EditInput from './EditInput/index';
import IconTips from '@/components/IconTips';
import studentHead from '@/assets/none_user_pic.png';

const messages = defineMessages({
  Unbind: { id: 'app.teacher.account.unbind', defaultMessage: '未绑定' },
  Bind: { id: 'app.teacher.account.bind', defaultMessage: '已绑定' },
  Stop: { id: 'app.teacher.account.stop', defaultMessage: '已停用' },
  StopDo: { id: 'app.teacher.account.stop.do', defaultMessage: '停用' },
  Start: { id: 'app.teacher.account.start', defaultMessage: '启用' },
  resetPWTipStart: { id: 'app.confirm.reset.pw.teacher.content.start', defaultMessage: '确认重置' },
  resetPWTipEnd: {
    id: 'app.confirm.reset.pw.teacher.content.end',
    defaultMessage: '的教师账户密码？',
  },
  cancelText: { id: 'app.cancel', defaultMessage: '取消' },
  confirm: { id: 'app.confirm', defaultMessage: '确认' },
  noDataTip: { id: 'app.teacher.manager.no.data.tip', defaultMessage: '未找到该教师' },
  deleteBtnTit: { id: 'app.teacher.manager.list.item.delete.btn.title', defaultMessage: '删除' },
  editBtnTit: { id: 'app.teacher.manager.list.item.edit.btn.title', defaultMessage: '编辑' },
  resetBtnTit: {
    id: 'app.teacher.manager.list.item.edit.btn.reset.title',
    defaultMessage: '重置密码',
  },
});

class ItemCard extends Component {
  state = {
    editing: false,
    editItemId: '',
    editType: '', // 编辑类型：重置密码、姓名
  };

  componentWillMount() {}

  componentWillReceiveProps(nextProps) {
    if (!nextProps.editing) {
      this.setState({
        editing: false,
      });
    }
  }

  switchStatus = status => {
    switch (status) {
      case 'REFUSE':
        return formatMessage(messages.Unbind);
      case 'UNBIND':
        return formatMessage(messages.Unbind);
      case null:
        return formatMessage(messages.Unbind);
      case 'BIND':
        return formatMessage(messages.Bind);
      case 'N':
        return formatMessage(messages.Stop);
      default:
        return 0;
    }
  };

  // 编辑老师
  editTeacher = item => {
    this.state.editing = false;
    this.state.editItemId = '';
    this.setState({
      editing: true,
      editType: 'name',
      editItemId: item.id,
    });
  };

  // 删除老师
  deleteTeacher = item => {
    const { onDeleteTeacher } = this.props;
    onDeleteTeacher(item);
  };

  // 重置密码
  resetPWTeacher = item => {
    /*
     ** 确认重置老师密码确认弹窗 **
     */
    Modal.confirm({
      content: (
        <div className="cont">
          {formatMessage(messages.resetPWTipStart)}
          <span className="name">{item.name}</span>
          {formatMessage(messages.resetPWTipEnd)}
        </div>
      ),
      okText: formatMessage(messages.confirm),
      centered: true,
      cancelText: formatMessage(messages.cancelText),
      onOk: () => {
        this.state.editing = false;
        this.state.editItemId = '';
        this.setState({
          editing: true,
          editType: 'password',
          editItemId: item.id,
        });
      },
    });
  };

  // 状态切换
  statusChange = (checked, item) => {
    const { onSwitchStatus } = this.props;
    onSwitchStatus(checked, item);
  };

  // 重新发送
  resend = item => {
    const { onResend } = this.props;
    if (onResend) {
      onResend(item);
    }
  };

  render() {
    const { editing, editItemId, editType } = this.state;
    const { data, teacherList } = this.props;
    const { props } = this;

    return (
      <div>
        {data && data.length === 0 && teacherList && teacherList.length > 0 && (
          <Empty
            image={studentHead}
            description={formatMessage(messages.noDataTip)}
            style={{ marginTop: '80px' }}
          />
        )}

        {data && data.length > 0 && (
          <List
            className="teachCard"
            itemLayout="horizontal"
            grid={{ gutter: 20, xs: 1, sm: 1, md: 1, lg: 1, xl: 2, xxl: 2 }}
            dataSource={data}
            renderItem={item => {
              let name = '';
              if (item.name && item.name.length > 5) {
                name = `${item.name.substring(0, 5)}...`;
              } else {
                // name = item.name;
                const { name: na } = item;
                name = na;
              }
              return (
                <List.Item
                  key={item.id}
                  style={{ padding: editing && editItemId === item.id ? '25px 20px' : '25px 0px' }}
                >
                  {editing && editItemId === item.id ? (
                    <EditInput
                      item={item}
                      type={editType}
                      onCancel={() => {
                        this.setState({
                          editing: false,
                        });
                      }}
                      onSave={(id, nam, phone) => {
                        props.onEditTeacher(id, nam, phone);
                      }}
                      onResetPW={(accountId, newPW) => {
                        this.setState({
                          editing: false,
                          editType: '',
                          editItemId: '',
                        });
                        props.onResetPWTeacher(accountId, newPW);
                      }}
                    />
                  ) : (
                    <span>
                      {item.status === 'Y' && (
                        <span className={styles[`status${item.bindStatus}`]}>
                          {this.switchStatus(item.bindStatus)}
                        </span>
                      )}
                      {item.status === 'N' && (
                        <span className={styles[`status${item.status}`]}>
                          {this.switchStatus(item.status)}
                        </span>
                      )}
                      <span
                        className={styles.accountName}
                        title={item.name && item.name.length > 5 && item.name}
                      >
                        {name}
                      </span>
                      <span className={styles.accountPhone}>{item.mobile}</span>
                      <span className={styles.accountOper}>
                        {item.bindStatus === 'REFUSE' && (
                          <IconTips
                            text={formatMessage({
                              id: 'app.message.resend',
                              defaultMessage: '重新发送',
                            })}
                            iconName="icon-plane"
                            onClick={() => this.resend(item)}
                          />
                        )}

                        {item.status === 'Y' && (
                          <IconTips
                            text={formatMessage(messages.editBtnTit)}
                            iconName="icon-edit"
                            onClick={() => this.editTeacher(item)}
                          />
                        )}

                        {!item.bindStatus ||
                        item.bindStatus === 'UNBIND' ||
                        item.bindStatus === 'REFUSE' ? (
                          <IconTips
                            text={formatMessage(messages.deleteBtnTit)}
                            iconName="icon-detele"
                            onClick={() => this.deleteTeacher(item)}
                          />
                        ) : null}
                        {!item.bindStatus ||
                        item.bindStatus === 'UNBIND' ||
                        item.bindStatus === 'REFUSE' ? null : (
                          <span>
                            {item.status === 'Y' && (
                              <IconTips
                                text={formatMessage(messages.resetBtnTit)}
                                iconName="icon-reset"
                                onClick={() => this.resetPWTeacher(item)}
                              />
                            )}

                            <Switch
                              checkedChildren={formatMessage(messages.StopDo)}
                              onChange={e => this.statusChange(e, item)}
                              unCheckedChildren={formatMessage(messages.Start)}
                              checked={item.status === 'Y'}
                            />
                          </span>
                        )}
                      </span>
                    </span>
                  )}
                </List.Item>
              );
            }}
          />
        )}
      </div>
    );
  }
}

export default ItemCard;
