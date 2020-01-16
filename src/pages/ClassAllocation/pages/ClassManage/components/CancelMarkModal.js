/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:23
 * Explain: 取消标记弹框组件
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
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '取消标记成功！' },
  editFailure: { id: 'app.menu.classmanage.editFailure', defaultMessage: '取消标记失败！' },
  studentName: { id: 'app.menu.classmanage.studentName', defaultMessage: '姓名' },
  classID: { id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' },
  classIDPlaceholder: {
    id: 'app.menu.classmanage.placeholder.classID',
    defaultMessage: '请输入2位以内，如：02',
  },
  studentGender: { id: 'app.menu.classmanage.studentGender', defaultMessage: '性别' },
  sameStudent: { id: 'app.menu.classmanage.sameStudent', defaultMessage: '同性别的重名学生' },
  numberEempty: {
    id: 'app.menu.classmanage.name.numberEempty',
    defaultMessage: '班内学号不可以为空',
  },
  unitNameIsTooNumber: {
    id: 'app.menu.classmanage.name.length.over.unitNameIsTooNumber',
    defaultMessage: '班内学号为数字，最多支持2位，如：01',
  },
  unitNameIsNodata: {
    id: 'app.menu.teach.name.length.over.unitNameIsNodata',
    defaultMessage: '班内学号只能填两位数',
  },
  cancelMark: { id: 'app.menu.classmanage.cancelMark', defaultMessage: '取消标记' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(() => ({}))
class CancelMarkModal extends Component {
  // 数据初始化参数
  constructor(props) {
    super(props);
    this.cumulative = 0;
    this.state = {
      confirmBtn: false,
      sameCode: false,
    };
  }

  // 取消弹框方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    this.setState({
      sameCode: false,
    });
    this.cumulative = 0;
    hideModal();
  };

  // 取消标注方法回调
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

  // 相同学号方法
  sameStudentClassCode = (studentClassCode, studentId) => {
    let sameCode = false;
    const { studentList } = this.props;
    if (studentList && studentList.length > 0) {
      studentList.forEach(item => {
        if (
          item.studentId !== studentId &&
          item.studentClassCode === studentClassCode &&
          item.isMark === 'N'
        ) {
          sameCode = true;
          return sameCode;
        }
      });
    }
    this.setState({
      sameCode,
    });
    return sameCode;
  };

  // 检查学内号
  checkCodeInput = (rule, value, callback) => {
    const re = /^[0-9]*[1-9][0-9]*$/;
    if (value.length < 3) {
      callback();
      return;
    }
    if (!re.test(value) && value !== '00') {
      callback(formatMessage(messages.unitNameIsTooNumber));
      return;
    }
    callback(formatMessage(messages.unitNameIsNodata));
  };

  // 取消标记方法
  onHandleOK = () => {
    const that = this;
    const paramsArr = [];
    const { form, dispatch, naturalClassId, currentStudent } = that.props;
    const studentClassCode = that.classIDInput.value;
    const params = {
      naturalClassId: naturalClassId,
      studentId: currentStudent.studentId,
      studentClassCode,
    };
    const isSame = this.sameStudentClassCode(studentClassCode, currentStudent.studentId);
    if (isSame) {
      this.setState({
        sameCode: isSame,
      });
    } else {
      paramsArr.push(params);
      form.validateFields(err => {
        if (!err) {
          const { hideModal } = that.props;
          dispatch({
            type: 'clzss/updateStudentsUnmark',
            payload: paramsArr,
            callback: res => {
              if (res === 'SUCCESS' || res.responseCode === '200') {
                this.setState({
                  confirmBtn: false,
                });
                this.cumulative = 0;
                that.getNaturalClass();
                message.success(
                  formatMessage({ id: 'app.message.unmarkSuccess', defaultMessage: '取消标记成功' })
                );
              } else {
                this.setState({
                  confirmBtn: false,
                });
                message.error(
                  formatMessage({ id: 'app.message.unmarkFailure', defaultMessage: '取消标记失败' })
                );
              }
            },
          });
          this.setState({
            sameCode: false,
          });
          this.cumulative = 0;
          hideModal();
        }
      });
    }
  };

  // jsx语法视图渲染
  render() {
    let sameNewCode = '';
    const { confirmBtn, sameCode } = this.state;
    const { form, visibleModal, currentStudent } = this.props;
    const { getFieldDecorator } = form;
    if (currentStudent && this.cumulative === 0) {
      this.cumulative++;
      this.sameStudentClassCode(currentStudent.studentClassCode, currentStudent.studentId);
    }
    sameNewCode = sameCode;
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.cancelMark)}
        closable={false}
        confirmLoading={confirmBtn}
        width={460}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.cancelMarkModal}
      >
        {currentStudent ? (
          <Form layout="vertical">
            {sameNewCode ? (
              <div className={styles.prompts}>
                <i className="iconfont icon-tip" />
                <span>
                  {formatMessage({
                    id: 'app.text.classManage.studentNumber.repeat',
                    defaultMessage: '班内学号重复，请重新输入！',
                  })}
                </span>
              </div>
            ) : null}
            <FormItem label="">
              <div className={styles.seeItem}>
                <span className={styles.itemTitle}>{formatMessage(messages.studentName)}</span>
                <span>{currentStudent.studentName}</span>
              </div>
            </FormItem>
            <FormItem label="">
              {getFieldDecorator('classIDInput', {
                initialValue: currentStudent.studentClassCode,
                rules: [
                  { required: true, message: formatMessage(messages.numberEempty) },
                  { validator: this.checkCodeInput },
                ],
              })(
                <div className={styles.item}>
                  <span className={styles.itemTitle}>
                    {formatMessage(messages.classID)}
                    <i>*</i>
                  </span>
                  <input
                    maxLength={2}
                    placeholder={formatMessage(messages.classIDPlaceholder)}
                    ref={classIDInput => (this.classIDInput = classIDInput)}
                    defaultValue={currentStudent.studentClassCode}
                  />
                </div>
              )}
            </FormItem>
            {/* <FormItem label="">
              <div className={styles.sexItem}>
                <span className={styles.itemTitle}>{formatMessage(messages.studentGender)}</span>
                <span hidden={currentStudent.gender === 'FEMALE'}>{formatMessage({id:"app.text.classManage.sex.male",defaultMessage:"男"})}</span>
                <span hidden={currentStudent.gender === 'MALE'}>{formatMessage({id:"app.text.classManage.sex.female",defaultMessage:"女"})}</span>
              </div>
            </FormItem> */}
          </Form>
        ) : null}
      </Modal>
    );
  }
}

export default CancelMarkModal;
