/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:18
 * Explain: 删除老师弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Form } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.confirm', defaultMessage: '确定' },
  delSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '删除成功！' },
  delFailure: { id: 'app.menu.classmanage.fail.toast', defaultMessage: '删除失败！' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(() => ({}))
class DelTeacherModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmBtn: false,
    };
  }

  // 取消方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 删除成功后回调刷新列表
  getNaturalClass = () => {
    const { dispatch, naturalClassId } = this.props;
    const params = {
      id: naturalClassId,
    };
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
    });
  };

  // 组装id入参
  extractIds = (subjectList) => {
    const ids = [];
    if (subjectList && subjectList.length > 0) {
      subjectList.forEach(item => {
        ids.push(item.id);
      });
    }
    return ids;
  };

  // 刪除当前老师方法
  onHandleOK = () => {
    const that = this;
    const { form, dispatch, teacher } = that.props;
    const ids = this.extractIds(teacher.subjectList);
    this.setState({
      confirmBtn: true,
    });
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = that.props;
        dispatch({
          type: 'clzss/delClassTeachers',
          payload: ids,
          callback: res => {
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode,data } = x;
            if (responseCode === '200') {
              this.setState({
                confirmBtn: false,
              });
              that.getNaturalClass();
              message.success(formatMessage(messages.delSuccess));
            } else {
              this.setState({
                confirmBtn: false,
              });
              message.error(data);
            }
          },
        });
        hideModal();
      }
    });
  };

  // jsx语法视图渲染
  render() {
    const { confirmBtn } = this.state;
    const { visibleModal, teacher } = this.props;
    return (
      <Modal
        visible={visibleModal}
        centered
        closable={false}
        confirmLoading={confirmBtn}
        width={400}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.delTeacherModal}
      >
        <div className={styles.tipsInfo}>
          <span>{formatMessage({id:"app.menu.classallocation.del.toast",defaultMessage:"删除"})} </span>
          <span>{teacher.teacherName}</span>
          <span> ，{formatMessage({id:"app.menu.classallocation.del.yesorno",defaultMessage:"是否确认？"})}</span>
        </div>
      </Modal>
    );
  }
}

export default DelTeacherModal;
