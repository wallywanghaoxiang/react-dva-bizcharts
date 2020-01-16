import React, { Component } from 'react';
import { Button, Form, message, Input } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import classIcon from '@/assets/student/classIcon.png';
import styles from './index.less';
import { Trim } from '@/utils/utils';

const messages = defineMessages({
  title: { id: 'app.student.join.class.title', defaultMessage: '通过“班群号”加入' },
  classNumInputPlaceholder: {
    id: 'app.student.join.class.number.input.placeholder',
    defaultMessage: '输入班群号',
  },
  classStuCodeInputTip: {
    id: 'app.student.join.class.stu.code.input.tip',
    defaultMessage: '输入班内学号',
  },
  joinSuccess: { id: 'app.student.join.class.success.tip', defaultMessage: '成功加入{name}！' },
  btnTit: { id: 'app.student.join.class.comfirm.btn.title', defaultMessage: '确认加入' },
});

@Form.create()
@connect(() => ({}))
class JoinClass extends Component {
  state = {
    okBtnDisabled: true,
    err: '',
    studentClassCodeValue: '',
    classNumberValue: '',
  };

  componentWillMount() {}

  // 班级群号
  handleClassNumChange = e => {
    console.log(e.target.value);
    const { form } = this.props;
    form.setFieldsValue({
      classNumber: e.target.value,
    });
    this.checkData();
  };

  handleClassNumBlur = () => {};

  // 班内学号
  handleClassStuCodeChange = e => {
    const { form } = this.props;
    form.setFieldsValue({
      studentClassCode: e.target.value,
    });
    this.checkData();
  };

  handleClassStuCodeBlur = e => {
    // const { form } = this.props;
    // const {value} = e.target;
    // let newValue;
    // if (value&&value.length<2) {
    //   newValue = `0${value}`;
    // } else {
    //   newValue = value;
    // }
    // form.setFieldsValue({
    //   studentClassCode:newValue
    // })
  };

  // 检测输入
  checkData = () => {
    const { form } = this.props;
    form.validateFields((err, values) => {
      console.log('---err:', err);
      console.log('----values:', values);
      if (!err) {
        const { studentClassCode, classNumber } = values;
        this.setState({
          err: '',
          okBtnDisabled: false,
          studentClassCodeValue: studentClassCode,
          classNumberValue: classNumber,
        });
      } else {
        this.setState({
          okBtnDisabled: true,
        });
      }
    });
  };

  // 确定加入
  clickJoin = () => {
    const { dispatch, onJoinClassSuccess } = this.props;
    const { studentClassCodeValue, classNumberValue } = this.state;
    const code = Trim(studentClassCodeValue, 'g');
    const newValue = code && code.length < 2 ? `0${code}` : code;

    const params = {
      accountId: localStorage.getItem('uid'),
      mobile: localStorage.getItem('mobile'),
      classNumber: classNumberValue,
      gender: localStorage.getItem('gender'),
      name: localStorage.getItem('name'),
      studentClassCode: newValue,
    };

    dispatch({
      type: 'perfect/verifyStudentInfo',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const clsName = res.data.alias ? res.data.alias : res.data.className;
          const mgs = <FormattedMessage values={{ name: clsName }} {...messages.joinSuccess} />;
          message.success(mgs);
          onJoinClassSuccess();
          // window.location.href = '/student/home';
        } else if (res.responseCode === '460') {
          const mgs = res.data;
          this.setState({ err: mgs });
        } else {
          const mgs = res.data;
          message.error(mgs);
        }
      },
    });
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { studentClassCodeValue, classNumberValue, okBtnDisabled, err } = this.state;
    return (
      <div className={styles.joinClassBox}>
        <div className={styles.classIcon}>
          <img src={classIcon} alt="classIcon" />
        </div>
        <div className={styles.title}>{formatMessage(messages.title)}</div>
        <div className={styles.joinClassFormBox}>
          <Form className={styles.joinClassForm}>
            <Form.Item style={{ borderBottom: '1px solid #ccc' }}>
              {getFieldDecorator('classNumber', {
                rules: [
                  {
                    required: true,
                    message: formatMessage(messages.classNumInputPlaceholder),
                  },
                ],
              })(
                <Input
                  placeholder={formatMessage(messages.classNumInputPlaceholder)}
                  onChange={this.handleClassNumChange}
                  onBlur={this.handleClassNumBlur}
                  maxLength={8}
                />
              )}
            </Form.Item>

            <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="message-item">
              {getFieldDecorator('studentClassCode', {
                rules: [{ required: true, message: formatMessage(messages.classStuCodeInputTip) }],
              })(
                <Input
                  placeholder={formatMessage(messages.classStuCodeInputTip)}
                  onChange={this.handleClassStuCodeChange}
                  onBlur={this.handleClassStuCodeBlur}
                  maxLength={2}
                />
              )}
            </Form.Item>
          </Form>
          <div className={styles.errInfo}>{err}</div>
          <Button disabled={okBtnDisabled} onClick={this.clickJoin}>
            {formatMessage(messages.btnTit)}
          </Button>
        </div>
      </div>
    );
  }
}

export default JoinClass;
