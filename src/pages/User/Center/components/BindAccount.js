import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import cs from 'classnames';
import { Button, Modal, Checkbox, Form, Input, message } from 'antd';
// import VerificationCode from './VerificationCode';
import ImageCode from '@/components/ImageCode/index';
import { phoneReg } from '@/utils/utils';

import styles from './index.less';

const messages = defineMessages({
  bind: { id: 'app.menu.account.bind', defaultMessage: '账号绑定' },
  userBind: { id: 'app.menu.account.userBind', defaultMessage: '已绑定手机号' },
  bindInfo: {
    id: 'app.menu.account.bindInfo',
    defaultMessage: '绑定手机号可享受手机号登录、密码找回等功能。',
  },
  editBind: { id: 'app.editBind', defaultMessage: '更改号码' },
  nextBind: { id: 'app.next', defaultMessage: '下一步' },
  commit: { id: 'app.commit', defaultMessage: '完成' },
  bindBtn: { id: 'app.menu.account.bindBtn', defaultMessage: '绑定' },
  moreAccount: {
    id: 'app.menu.account.moreAccount',
    defaultMessage: '检测到本手机号绑定了多个账号，请选择需要修改的账号',
  },
  phoneInputTip: { id: 'app.account.phone.input.tip', defaultMessage: '请输入手机号！' },
  phoneInputTip1: { id: 'app.user.login.account.tip1', defaultMessage: '手机输入格式不正确！' },
  validateCodeTip: {
    id: 'app.user.register.validate.code.tip',
    defaultMessage: '请输入短信验证码！',
  },
  phoneInputPlaceholder: {
    id: 'app.account.phone.input.placeholder',
    defaultMessage: '请输入11位手机号',
  },
  messageInputPlaceholder: {
    id: 'app.account.message.input.placeholder',
    defaultMessage: '请输入短信验证码',
  },
  messageIsRegister: {
    id: 'app.account.message.input.messageIsRegister',
    defaultMessage: '该手机号已被注册',
  },
});

@connect(({ login, loading }) => ({
  loading: loading.effects['login/changeMobile'],
  isRegisterLoading: loading.effects['login/isRegister'],
  campusList: login.campusList,
  identityList: login.identityList,
  avatar: login.avatar,
}))
@Form.create()
class BindAccount extends Component {
  state = {
    checkedValues: [],
    mobile: '',
    sendCodeStatus: false,
    mobileOld: localStorage.getItem('mobile'),
    mobileCode: '',
    distributorId: '',
    errorInfo: '',
    step1: false,
    step2: false,
    step3: false,
  };

  componentDidMount() {}

  onChange = checkedValues => {
    this.setState({
      checkedValues,
    });

    console.log('checked = ', checkedValues);
  };

  // 更改手机号
  editMobile = () => {
    // GET /security/account/check-identityAUTH-306：检查手机注册了几个身份
    this.setState({
      sendCodeStatus: false,
    });
    const { dispatch } = this.props;
    const { mobileOld } = this.state;
    if (!mobileOld) {
      this.setState({
        step1: true,
      });
      return;
    }
    dispatch({
      type: 'login/queryMobileTeacher',
      payload: {
        mobile: mobileOld,
      },
      callback: res => {
        if (res.responseCode === '200') {
          if (res.data.length === 1) {
            this.setState({
              step1: true,
            });
            console.log(res);
          } else if (res.data.length > 1) {
            this.setState({
              step2: true,
            });
          }
        } else {
          message.error(res.data);
        }
      },
    });
  };

  //  选择角色 点击下一步
  handleOkStep = () => {
    const { checkedValues } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'login/delIndentity',
      payload: checkedValues,
    });
    this.setState({
      step2: false,
      step1: true,
    });
  };

  // 取消按钮
  handleCancel = () => {
    this.setState({
      step1: false,
      step2: false,
      step3: false,
      mobile: '',
      errorInfo: '',
    });
  };

  // 保存手机号
  saveMobile = e => {
    this.setState({
      mobile: e.target.value,
    });
    const str = e.target.value;
    if (str === '') {
      this.setState({
        errorInfo: formatMessage(messages.phoneInputTip),
      });
    } else if (phoneReg.test(str)) {
      this.setState({
        errorInfo: '',
      });
      const { dispatch, identityList } = this.props;
      const { checkedValues, mobileOld } = this.state;
      const that = this;
      const mobile = e.target.value;
      if (!mobileOld) {
        dispatch({
          type: 'login/isRegister',
          payload: {
            mobile,
            identityId: '1',
          },
          callback: res => {
            console.log(res);
            if (res.responseCode === '200' && res.data === true) {
              // 已注册
              console.log(res.data);
              that.setState({ errorInfo: formatMessage(messages.messageIsRegister) });
            }
          },
        });
        return;
      }
      if (checkedValues.length > 0) {
        checkedValues.forEach(vo => {
          const params = {
            mobile,
            identityId: vo.identityId,
          };
          dispatch({
            type: 'login/isRegister',
            payload: params,
            callback: res => {
              console.log(res);
              if (res.responseCode === '200' && res.data === true) {
                // 已注册
                console.log(res.data);
                that.setState({ errorInfo: formatMessage(messages.messageIsRegister) });
              }
            },
          });
        });
      } else {
        identityList.forEach(vo => {
          const params = {
            mobile,
            identityId: vo.identityId,
          };
          dispatch({
            type: 'login/isRegister',
            payload: params,
            callback: res => {
              console.log(res);
              if (res.responseCode === '200' && res.data === true) {
                // 已注册
                console.log(res.data);
                that.setState({ errorInfo: formatMessage(messages.messageIsRegister) });
              }
            },
          });
        });
      }
    } else {
      this.setState({
        errorInfo: formatMessage(messages.phoneInputTip1),
      });
    }
  };

  // 保存验证码
  saveCode = e => {
    this.setState({
      mobileCode: e.target.value,
    });
  };

  // 验证手机号是否正确
  validateTelephone = () => {
    const { form } = this.props;
    const { errorInfo } = this.state;
    if (errorInfo === '') {
      form.validateFields((err, values) => {
        if (err && err.mobile && err.mobile.errors.length > 0) {
          this.setState({ errorInfo: err.mobile.errors[0].message });
        } else {
          this.setState({ errorInfo: '' });
        }
        console.log(err, values);
      });
    }
  };

  // 渲染验证码发送完成 还是滑动拼图
  sendCodeStatus = status => {
    const { mobile, errorInfo } = this.state;
    const { form, isRegisterLoading } = this.props;
    const { getFieldDecorator } = form;
    const phoneSuffix = (
      <i className="iconfont icon-mobile" style={{ color: '#888', fontSize: '16px' }} />
    );
    const messageSuffix = (
      <i className="iconfont icon-message" style={{ color: '#888', fontSize: '16px' }} />
    );
    if (status) {
      return (
        <div>
          <p className={styles.sendCode}>验证码已发送至{mobile}</p>
          <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="message-item">
            {getFieldDecorator('validateCode', {
              rules: [{ required: true, message: formatMessage(messages.messageInputPlaceholder) }],
            })(
              <Input
                prefix={messageSuffix}
                placeholder={formatMessage(messages.messageInputPlaceholder)}
                onChange={e => this.saveCode(e)}
                maxLength={6}
              />
            )}
          </Form.Item>
        </div>
      );
    }
    return (
      <div>
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
              placeholder={formatMessage(messages.phoneInputPlaceholder)}
              prefix={phoneSuffix}
              onChange={e => this.saveMobile(e)}
              maxLength={11}
            />
          )}
        </Form.Item>
        {/* <VerificationCode  
          errorInfo={errorInfo}
          mobile={mobile} 
          validateMobile={()=>{
             this.validateTelephone()
          }}                     
          onMatch={() => {
            this.sendValidateCodeRequest()
                console.log("code is match")
            }}
        /> */}
        {errorInfo === '' && mobile !== '' && !isRegisterLoading && (
          <div className={styles.imageCodeBox}>
            <ImageCode
              styleObj={{ margin: '0 auto' }}
              onReload={() => {}}
              imageWidth={300}
              onMatch={() => {
                this.sendValidateCodeRequest();
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // 绑定账号
  handleOkBind = () => {
    const { dispatch } = this.props;
    const { mobile, checkedValues, distributorId, mobileCode, mobileOld } = this.state;
    // 绑定账号前先验证短信是否正确
    const that = this;
    dispatch({
      type: 'login/checkSNcode',
      payload: {
        mobile,
        validateCode: mobileCode,
        validateCodeId: distributorId,
      },
      callback: res => {
        if (res.responseCode === '200') {
          console.log(res);
          if (checkedValues.length > 0) {
            checkedValues.forEach(item => {
              let params = {};

              if (item.identityCode === 'ID_TEACHER') {
                params = {
                  teacherAccountId: item.accountId,
                  studentAccountId: '',
                  mobile,
                };
              } else {
                params = {
                  studentAccountId: item.accountId,
                  teacherAccountId: '',
                  mobile,
                };
              }
              dispatch({
                type: 'login/changeMobile',
                payload: params,
                callback: res2 => {
                  if (res2.responseCode === '200') {
                    if (item.identityCode === 'ID_TEACHER') {
                      localStorage.setItem('mobile', mobile);
                      that.setState({
                        mobileOld: mobile,
                      });
                    }

                    that.setState({
                      step2: false,
                      step3: true,
                    });
                  } else {
                    that.setState({
                      step1: true,
                      step2: false,
                    });
                    message.error(res2.data);
                  }
                },
              });
            });
          } else {
            const { identityList } = this.props;
            let params = {};
            if (mobileOld) {
              if (identityList[0].identityCode === 'ID_TEACHER') {
                params = {
                  teacherAccountId: identityList[0].accountId,
                  studentAccountId: '',
                  mobile,
                };
              } else {
                params = {
                  teacherAccountId: '',
                  studentAccountId: identityList[0].accountId,
                  mobile,
                };
              }
            } else {
              params = {
                teacherAccountId: localStorage.getItem('uid'),
                studentAccountId: '',
                mobile,
              };
            }

            dispatch({
              type: 'login/changeMobile',
              payload: params,
              callback: res2 => {
                console.log(res2);
                if (res2.responseCode === '200') {
                  if (mobileOld && identityList[0].identityCode === 'ID_TEACHER') {
                    localStorage.setItem('mobile', mobile);
                    that.setState({
                      mobileOld: mobile,
                    });
                  }
                  if (!mobileOld) {
                    localStorage.setItem('mobile', mobile);
                    that.setState({
                      mobileOld: mobile,
                    });
                  }

                  that.setState({
                    step2: false,
                    step3: true,
                  });
                } else {
                  that.setState({
                    step2: false,
                    step1: true,
                  });
                  message.error(res2.data);
                }
              },
            });
          }
        } else {
          message.error(res.data);
        }
      },
    });
  };

  // 获取验证码请求
  sendValidateCodeRequest() {
    this.setState({
      sendCodeStatus: true,
    });
    const that = this;
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
          that.setState({
            distributorId: res.data,
          });
        } else {
          message.error(res.data);
        }
      },
    });
  }

  render() {
    const {
      checkedValues,
      sendCodeStatus,
      mobileCode,
      errorInfo,
      step2,
      step1,
      step3,
      mobile,
      mobileOld,
    } = this.state;
    const { identityList, loading } = this.props;
    console.log(errorInfo);

    return (
      <div className={styles.basicSet}>
        <h1 className={styles.nowTitle}>{formatMessage(messages.bind)}</h1>
        <div className={styles.userInfo}>
          <div className={styles.userBind}>
            {mobileOld && <b>{formatMessage(messages.userBind)}</b>}
            {mobileOld && <span>{mobileOld}</span>}
            {!mobileOld && (
              <b>
                {formatMessage({
                  id: 'app.message.accountNoBindingMobilePhoneNumber',
                  defaultMessage: '账号暂未绑定手机号',
                })}
              </b>
            )}
            <p>{formatMessage(messages.bindInfo)}</p>
          </div>
          <div>
            <Button className={styles.editBind} onClick={this.editMobile}>
              {mobileOld
                ? formatMessage(messages.editBind)
                : formatMessage({ id: 'app.message.toBind', defaultMessage: '去绑定' })}
            </Button>
          </div>
        </div>
        <Modal
          closable={false}
          className={styles.moreAccount}
          visible={step2}
          centered
          destroyOnClose
          okButtonProps={{ disabled: checkedValues.length === 0 }}
          okText={formatMessage(messages.nextBind)}
          onOk={this.handleOkStep}
          onCancel={this.handleCancel}
          width={360}
        >
          <div className={cs('userBind', styles.userBind)}>
            <b>{formatMessage(messages.userBind)}</b>
            <span>{mobileOld}</span>
            <p className={styles.warning}>
              <i className="iconfont icon-warning" />
              {formatMessage(messages.moreAccount)}
            </p>
          </div>
          <Checkbox.Group style={{ width: '100%' }} onChange={this.onChange}>
            {identityList.length > 0 &&
              identityList
                .filter(vo => vo.identityCode === 'ID_TEACHER' || vo.identityCode === 'ID_STUDENT')
                .map(item => {
                  return (
                    <Checkbox value={item}>
                      {item.identityCode === 'ID_TEACHER' ? '教师账号' : '学生账号'}
                    </Checkbox>
                  );
                })}
          </Checkbox.Group>
        </Modal>

        <Modal
          closable={false}
          className={styles.resultModal}
          visible={step3}
          destroyOnClose
          centered
          okText={formatMessage(messages.commit)}
          onOk={this.handleCancel}
          onCancel={this.handleCancel}
          width={360}
        >
          {step3 && (
            <div className={styles.resultOk}>
              <i className="iconfont icon-right" />
              <p>
                您的
                {identityList.length > 0 &&
                  identityList.map((item, index) => {
                    return (
                      <b>
                        {item.identityCode === 'ID_TEACHER' ? '教师账号' : '学生账号'}
                        {identityList.length - 1 !== index ? `、` : ''}
                      </b>
                    );
                  })}
                新手机号：{mobile}
              </p>
              <span>绑定成功</span>
            </div>
          )}
        </Modal>

        <Modal
          closable={false}
          className={cs(styles.moreAccount, 'moreAccountBind')}
          visible={step1}
          okText={formatMessage(messages.bindBtn)}
          okButtonProps={{ disabled: mobileCode === '' }}
          confirmLoading={loading}
          centered
          onOk={this.handleOkBind}
          destroyOnClose
          onCancel={this.handleCancel}
          width={360}
        >
          <div className={cs('bindSingle', styles.bindSingle)}>
            <Form onSubmit={this.handleSubmit} className="form">
              {this.sendCodeStatus(sendCodeStatus)}
              {errorInfo && (
                <Form.Item>
                  <div className="errorInfo">{errorInfo}</div>
                </Form.Item>
              )}
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}

export default BindAccount;
