import React, { Component } from 'react';
import './index.less';
import { Input, Button, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { isAvailableIphone, Trim } from '@/utils/utils';

const messages = defineMessages({
  teacherBtnTit: { id: 'app.teacher.login.btn.title', defaultMessage: '教师登录' },
  teacherNammeInputPlaceholder: {
    id: 'app.add.teacher.modal.name.input.placeholder',
    defaultMessage: '请输入老师姓名',
  },
  teacherNammeInputTip: {
    id: 'app.add.teacher.modal.name.input.tip',
    defaultMessage: '请输入老师姓名！',
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
  cancelText: { id: 'app.cancel', defaultMessage: '取消' },
  saveText: { id: 'app.save', defaultMessage: '保存' },
  newPWInputPlaceholder: {
    id: 'app.add.teacher.item.password.input.placeholder',
    defaultMessage: '请输入新密码',
  },
  passwordTip: { id: 'app.add.teacher.item.password.input.tip', defaultMessage: '请输入新密码！' },
  passwordTip1: { id: 'app.user.login.password.tip1', defaultMessage: '密码为6位以上非中文字符' },
});

class EditInput extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  save = () => {
    const { onSave, item, type, onResetPW } = this.props;
    if (type === 'name') {
      // 修改名字和手机号
      const { nameInput, phoneInput } = this;
      const name = Trim(nameInput.state.value, 'g');
      const phone = phoneInput.state.value ? Trim(phoneInput.state.value, 'g') : '';
      if (!name) {
        const mgs = formatMessage(messages.teacherNammeInputTip);
        message.warning(mgs);
      } else if (phone && !isAvailableIphone(phone)) {
        const mgs = formatMessage(messages.phoneInputTip1);
        message.warning(mgs);
      } else {
        onSave(item.id, name, phone);
      }
    } else {
      // 重置密码
      const { pwInput } = this;
      const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
      const va = pwInput.state.value;
      let pwValue = '';
      if (va) {
        pwValue = Trim(pwInput.state.value, 'g');
      }

      if (!pwValue) {
        const mgs = formatMessage(messages.passwordTip);
        message.warning(mgs);
      } else if (reg.test(pwValue)) {
        const mgs = formatMessage(messages.passwordTip1);
        message.warning(mgs);
      } else if (pwValue.length >= 0 && pwValue.length > 5) {
        onResetPW(item.accountId, pwValue);
      } else {
        const mgs = formatMessage(messages.passwordTip1);
        message.warning(mgs);
      }
    }
  };

  pwValidate = (rules, value, callback) => {
    const valueLength = String(value).length;
    if (valueLength >= 0 && valueLength > 5) {
      callback();
    } else {
      const mgs = formatMessage(messages.passwordTip1);
      callback(mgs);
    }
  };

  /**
   *    UNBIND  :  未绑定
   *    BIND    :  已绑定
   *    REFUSE  :  已拒绝
   */
  render() {
    const { item, onCancel, type } = this.props;
    return (
      <div className="edit-teacher-wrapper">
        {type === 'name' && (
          <Input
            placeholder={formatMessage(messages.teacherNammeInputPlaceholder)}
            defaultValue={item.name}
            maxLength={20}
            ref={tag => {
              this.nameInput = tag;
            }}
            style={{ marginRight: '10px' }}
          />
        )}
        {type === 'name' && (
          <Input
            className={item.bindStatus && item.bindStatus !== 'UNBIND' ? 'disabled' : ''}
            placeholder={
              item.bindStatus && item.bindStatus === 'BIND' && !item.mobile
                ? ''
                : formatMessage(messages.phoneInputPlaceholder)
            }
            defaultValue={item.mobile}
            disabled={item.bindStatus && item.bindStatus !== 'UNBIND'}
            maxLength={11}
            ref={tag => {
              this.phoneInput = tag;
            }}
          />
        )}

        {type === 'password' && (
          <Input
            placeholder={formatMessage(messages.newPWInputPlaceholder)}
            maxLength={20}
            ref={tag => {
              this.pwInput = tag;
            }}
            style={{ marginRight: '10px' }}
          />
        )}

        <Button className="save" type="primary" onClick={this.save}>
          {formatMessage(messages.saveText)}
        </Button>
        <Button className="cancel" type="primary" onClick={onCancel}>
          {formatMessage(messages.cancelText)}
        </Button>
      </div>
    );
  }
}

export default EditInput;
