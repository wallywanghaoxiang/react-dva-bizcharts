/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:10
 * Explain: 设置别名弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const FormItem = Form.Item;
// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功编辑' },
  settingAliases: { id: 'app.menu.classmanage.settingAliases', defaultMessage: '班级别名' },
  unitNameIsTooLong: { id: 'app.menu.classmanage.name.length.over.limited', defaultMessage: '班级别名不能为空' },
  aliasNamelength: { id: 'app.menu.classmanage.name.aliasNamelength', defaultMessage: '班级别名不能超过20个字符' },
  editAliases: { id: 'app.menu.classmanage.editAliases', defaultMessage: '设置班级别名' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(({ clzss }) => ({
  currentNaturalTeach: clzss.currentNaturalTeach,
}))
class EditAliasesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmBtn: false,
    };
  }

  // 编辑别名取消
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 编辑别名后回调刷新数据
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

  // 编辑别名方法
  onHandleOK = () => {
    const that = this;
    const { form, dispatch, id, currentNaturalTeach } = that.props;
    const curAlias = that.nameInput.value;
    sessionStorage.setItem('curAlias', curAlias)
    sessionStorage.setItem('className', curAlias)
    form.validateFields((err) => {
      console.log(err)
      if (!err) {
        const { hideModal } = that.props;
        
          dispatch({
            type: 'clzss/updateClassAlias',
            payload: {
              id,
              alias: curAlias,
            },
            callback: (res) => {
              if (res === 'SUCCESS' || res.responseCode === '200') {
                currentNaturalTeach.alias = curAlias;
                dispatch({
                  type: 'clzss/saveCurrentNaturalTeach',
                  payload: {
                    item: currentNaturalTeach,
                  },
                });
                this.setState({
                  confirmBtn: false,
                });
                that.getNaturalClass();
                message.success(formatMessage(messages.editSuccess));
              } else {
                this.setState({
                  confirmBtn: false,
                });
                message.error(formatMessage(messages.editFailure));
              }
            },
          });
        
        hideModal();
      }
    });
  };

  // 表单验证最大长度
  checLengThInput = (rule, value, callback) => {
    // if(value!==''&&value.trim()==='') {
    //   callback(formatMessage(messages.unitNameIsTooLong));
    // }
    if (value.length < 21) {
      callback();
      return;
    }
    callback(formatMessage(messages.aliasNamelength));
  };

  // jsx语法视图渲染
  render() {
    const { confirmBtn } = this.state;
    const { form, visibleModal, alias, id } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.editAliases)}
        closable={false}
        confirmLoading={confirmBtn}
        width={360}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.editAliasesModal}
      >
        <Form layout="vertical">
          <FormItem label="">
            {getFieldDecorator('nameInput', {
              initialValue: id ? alias : '',
              rules: [
                { required: false, message: formatMessage(messages.unitNameIsTooLong) },
                { validator: this.checLengThInput },
              ],
            })(
              <div className={styles.item}>
                <span className={styles.itemTitle}>{formatMessage(messages.settingAliases)}</span>
                <input
                  maxLength={20}
                  placeholder={formatMessage(messages.settingAliases)}
                  ref={nameInput => (this.nameInput = nameInput)}
                  defaultValue={id ? alias : ''}
                />
              </div>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default EditAliasesModal;
