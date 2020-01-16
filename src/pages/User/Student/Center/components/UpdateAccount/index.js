import React, { Component } from 'react';
import { Modal, Button, Form, message, Input } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import ImageCode from '@/components/ImageCode/index';
import { phoneReg } from '@/utils/utils';
import styles from './index.less';

const messages = defineMessages({
  title: { id: 'app.student.user.center.update.account.title', defaultMessage: '已绑定手机号' },
  tip: {
    id: 'app.student.user.center.update.account.tip',
    defaultMessage: '绑定手机号可享受手机号登录、密码找回等功能。',
  },
  updateBtnTit: {
    id: 'app.student.user.center.update.account.btn.title',
    defaultMessage: '更改号码',
  },
  phonePlaceholder: {
    id: 'app.student.user.center.update.account.phone.input.placeholder',
    defaultMessage: '请输入11位新手机号',
  },
  phoneInputTip: { id: 'app.account.phone.input.tip', defaultMessage: '请输入手机号' },
  phoneInputTip1: {
    id: 'app.student.user.center.update.account.phone.input.tip1',
    defaultMessage: '手机号输入格式不正确',
  },
  messageInputPlaceholder: {
    id: 'app.account.message.input.placeholder',
    defaultMessage: '请输入短信验证码',
  },
  sendCodeSuccessTip: {
    id: 'app.find.pw.send.code.success.tip',
    defaultMessage: '验证码已发送至{mobile}',
  },
  isRegisterTip: {
    id: 'app.student.user.center.update.account.bing.tip',
    defaultMessage: '该手机已经绑定其它账号',
  },
  bingSuccessTip1: {
    id: 'app.student.user.center.update.account.bing.success.tip1',
    defaultMessage: '新手机号',
  },
  bingSuccessTip2: {
    id: 'app.student.user.center.update.account.bing.success.tip2',
    defaultMessage: '绑定成功',
  },
  submitText: {
    id: 'app.student.user.center.update.account.bing.finish.btn.title',
    defaultMessage: '完成',
  },
  bingBtnTit: { id: 'app.menu.account.bindBtn', defaultMessage: '绑定' },
  cancelBtnTit: {
    id: 'app.cancel',
    defaultMessage: '取消',
  },
});

@connect(({ loading }) => ({
  loading: loading.effects['login/queryMobileTeacher'],
  isRegisterLoading: loading.effects['findpassword/isRegister'],
}))
@Form.create()
class UpdateAccount extends Component {
  state = {
    visible: false,
    step: 1,
    mobile: '',
    step1Tip: '',
    isValidPhone: false,
    validateCodeSuccess: false,
    bingBtnDisabled: true,
    validateCodeId: '',
  };

  componentWillMount() {}

  updateAccount = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    const { dispatch } = this.props;
    const { mobile, validateCodeId, validateCode } = this.state;
    const params = {
      mobile,
      validateCodeId,
      validateCode,
    };

    dispatch({
      type: 'login/checkSNcode',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          // 手机号验证码 验证通过
          const uid = localStorage.getItem('uid');
          dispatch({
            type: 'login/EditMobile',
            payload: {
              accountId: uid,
              mobile,
            },
            callback: res1 => {
              if (res1.responseCode === '200') {
                this.setState({
                  step: 2,
                });
                localStorage.setItem('mobile', mobile);
              } else {
                const err = res.data;
                this.setState({
                  step1Tip: err,
                });
              }
            },
          });
        } else {
          const err = res.data;
          this.setState({
            step1Tip: err,
          });
        }
      },
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleAfterClose = () => {
    this.setState({
      step: 1,
      mobile: '',
      step1Tip: '',
      isValidPhone: false,
      validateCodeId: '',
    });
  };

  // 手机号输入框
  handlePhoneChange = e => {
    const { value } = e.target;
    if (value && value.length === 11) {
      this.setState(
        {
          mobile: e.target.value,
        },
        () => {
          this.validateTelephone();
        }
      );
    } else {
      this.setState(
        {
          mobile: e.target.value,
        },
        () => {
          this.validateTelephone();
        }
      );
    }
  };

  handlePhoneBlur = () => {
    // this.validateTelephone();
  };

  // 验证手机号是否正确
  validateTelephone = () => {
    const { form } = this.props;
    form.validateFields(err => {
      // console.log(err,values)
      if (err && err.mobile && err.mobile.errors.length > 0) {
        this.setState({ step1Tip: err.mobile.errors[0].message, isValidPhone: false });
      } else {
        this.setState({ step1Tip: '', isValidPhone: true });
        this.checkIsRegister();
      }
    });
  };

  // 判断手机号是否已绑定
  checkIsRegister = () => {
    const { mobile } = this.state;
    const { dispatch } = this.props;
    const params = {
      mobile,
      identityId: '2',
    };
    dispatch({
      type: 'findpassword/isRegister',
      payload: params,
      callback: data => {
        if (data) {
          // 已注册
          const tip = formatMessage(messages.isRegisterTip);
          this.setState({
            step1Tip: tip,
          });
        } else {
          // 未注册
          this.setState({
            step1Tip: '',
          });
        }
      },
    });
  };

  // 发送验证码
  sendValidateCodeRequest = () => {
    const { dispatch } = this.props;
    const { mobile } = this.state;
    const params = {
      telephone: String(mobile),
    };
    dispatch({
      type: 'login/validateCode',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const validateCodeId = res.data;
          this.setState({
            validateCodeSuccess: true,
            validateCodeId,
          });
        } else {
          message.error(res.data);
        }
      },
    });
  };

  // 验证码输入框
  saveCode = e => {
    const { value } = e.target;
    if (value) {
      this.setState({
        bingBtnDisabled: false,
        validateCode: value,
      });
    } else {
      this.setState({
        bingBtnDisabled: true,
        validateCode: value,
      });
    }
  };

  render() {
    const {
      visible,
      mobile,
      step1Tip,
      step,
      validateCodeSuccess,
      bingBtnDisabled,
      isValidPhone,
    } = this.state;
    const { form, isRegisterLoading } = this.props;
    const { getFieldDecorator } = form;

    const phoneSuffix = (
      <i className="iconfont icon-mobile" style={{ color: '#888', fontSize: '16px' }} />
    );
    const messageSuffix = (
      <i className="iconfont icon-message" style={{ color: '#888', fontSize: '16px' }} />
    );
    const phone = localStorage.getItem('mobile');
    return (
      <div className={styles.updateAccountBox}>
        <div className={styles.phoneBox}>
          <span className={styles.tit}>{formatMessage(messages.title)}</span>
          <span className={styles.phone}>{phone}</span>
        </div>
        <div className={styles.tip}>{formatMessage(messages.tip)}</div>
        <div className={styles.changeBtn} onClick={this.updateAccount}>
          {formatMessage(messages.updateBtnTit)}
        </div>
        {/* 更改号码弹窗 */}
        <Modal
          wrapClassName={styles.updateAccModal}
          title=""
          visible={visible}
          destroyOnClose
          closable={false}
          onCancel={this.handleCancel}
          afterClose={this.handleAfterClose}
          centered
          maskClosable={false}
          width={390}
        >
          <div className={styles.modalContent}>
            <div className={styles.top}>
              {/* 第一步 */}
              {step === 1 && (
                <div className={styles.step1Box}>
                  <Form className="updateAccForm">
                    {!validateCodeSuccess && (
                      <Form.Item style={{ borderBottom: '1px solid #ccc' }}>
                        {getFieldDecorator('mobile', {
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
                          <Input
                            placeholder={formatMessage(messages.phonePlaceholder)}
                            prefix={phoneSuffix}
                            onChange={this.handlePhoneChange}
                            onBlur={this.handlePhoneBlur}
                            maxLength={11}
                            autoComplete="off"
                          />
                        )}
                      </Form.Item>
                    )}

                    {validateCodeSuccess && (
                      <div>
                        <p className={styles.sendCode}>
                          <FormattedMessage values={{ mobile }} {...messages.sendCodeSuccessTip} />
                        </p>
                        <Form.Item
                          style={{ borderBottom: '1px solid #ccc' }}
                          className="message-item"
                        >
                          {getFieldDecorator('validateCode', {
                            rules: [
                              {
                                required: true,
                                message: formatMessage(messages.messageInputPlaceholder),
                              },
                            ],
                          })(
                            <Input
                              style={{ letterSpacing: '2px' }}
                              prefix={messageSuffix}
                              placeholder={formatMessage(messages.messageInputPlaceholder)}
                              onChange={e => this.saveCode(e)}
                            />
                          )}
                        </Form.Item>
                      </div>
                    )}
                  </Form>

                  <div className={styles.errorInfo}>{step1Tip}</div>
                  {!validateCodeSuccess && !step1Tip && isValidPhone && !isRegisterLoading && (
                    <div className={styles.imageCodeBox}>
                      <ImageCode
                        styleObj={{ margin: '0 auto' }}
                        onReload={() => {}}
                        onMatch={() => {
                          this.sendValidateCodeRequest();
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 绑定完成 */}
              {step === 2 && (
                <div className={styles.registerSuccess}>
                  <div className={styles.successIcon}>
                    <i className="iconfont icon-right" />
                  </div>
                  <p className={styles.bingTip}>
                    {formatMessage(messages.bingSuccessTip1)}：<span>{mobile}</span>
                    {formatMessage(messages.bingSuccessTip2)}
                  </p>
                  <Button
                    type="primary"
                    className={styles.finishBtn}
                    onClick={() => {
                      this.setState({
                        visible: false,
                        step: 1,
                        validateCodeSuccess: false,
                      });
                    }}
                  >
                    {formatMessage(messages.submitText)}
                  </Button>
                </div>
              )}
            </div>
            {step === 1 && (
              <div className={styles.footer}>
                <Button onClick={this.handleOk} disabled={bingBtnDisabled}>
                  {formatMessage(messages.bingBtnTit)}
                </Button>
                <Button onClick={this.handleCancel}>{formatMessage(messages.cancelBtnTit)}</Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default UpdateAccount;
