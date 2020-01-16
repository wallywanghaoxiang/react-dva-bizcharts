/**
 *
 * User: tina.zhang
 * Explain: 设置别名弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const FormItem = Form.Item;
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功创建' },
  settingAliases: { id: 'app.menu.classmanage.settingAliases', defaultMessage: '班级别名' },
  unitNameIsNolimited: { id: 'app.menu.classmanage.name.length.over.unitNameIsNolimited', defaultMessage: '班级别名不能为空' },
  unitNameIsTooLong: { id: 'app.menu.classmanage.name.length.over.unitNameIsTooLong', defaultMessage: '长度不能超过20字' },
  editAliases: { id: 'app.menu.classmanage.editAliases', defaultMessage: '设置班级别名' },
});

@Form.create()
@connect(({ clzss,loading }) => ({
  loading: loading.effects['clzss/updateTeachingAlias'],
  currentTeachInfo: clzss.currentTeachInfo,
}))
class EditAliasesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  fetchNaturalClass = () => {
    const { dispatch, teachingClassId } = this.props;
    dispatch({
      type: 'clzss/getTeachingStudents',
      payload: teachingClassId,
    });
  };

  // 编辑别名回调
  onHandleOK = () => {
    const that = this;
    const { form, dispatch, id,curItem } = that.props;
    let curAlias = that.nameInput.value||curItem.gradeValue+curItem.subjectName+(curItem.classIndex||'');
    form.validateFields((err) => {
      if (!err) {
        const { hideModal } = that.props;      
          dispatch({
            type: 'clzss/updateTeachingAlias',
            payload: {
              id,
              name: curAlias,
            },
            callback: (res) => {
              if (res === '200') {
                that.fetchNaturalClass();
                message.success(formatMessage(messages.editSuccess));
              } else {
                message.error(formatMessage(messages.editFailure));
              }
            },
          });
        
        hideModal();
      }
    });
  };

  checkInput = (rule, value, callback) => {
    if(value!==''&&value.trim()==='') {
      callback(formatMessage(messages.unitNameIsNolimited));
    }
    if (value.length < 21) {
      callback();
      return;
    }
    callback(formatMessage(messages.unitNameIsTooLong));
  };

  render() {
    const { form, visibleModal, alias, id,loading} = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.editAliases)}
        closable={false}
        confirmLoading={loading}
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
                { required: false, message: formatMessage(messages.unitNameIsNolimited) },
                { validator: this.checkInput },
              ],
            })(
              <div className={styles.item}>
                <span className={styles.itemTitle}>{formatMessage(messages.settingAliases)}</span>
                <input
                  maxLength={20}
                  placeholder={formatMessage(messages.settingAliases)}
                  ref={nameInput => {
                    this.nameInput = nameInput;
                  }}
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
