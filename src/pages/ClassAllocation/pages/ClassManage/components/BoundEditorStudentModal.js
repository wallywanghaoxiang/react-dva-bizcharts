/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:19
 * Explain: 已经绑定学生弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, message, Radio } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功编辑' },
  studentName: { id: 'app.menu.classmanage.studentName', defaultMessage: '姓名' },
  classID: { id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' },
  studentGender: { id: 'app.menu.classmanage.studentGender', defaultMessage: '性别' },
  isBorrow: { id: 'app.menu.classmanage.isBorrow', defaultMessage: '是否借读' },
  unitNameIsTooLong: {
    id: 'app.menu.classmanage.name.length.over.limited',
    defaultMessage: '班级别名不能为空',
  },
  unitNameIsTooNumber: {
    id: 'app.menu.classmanage.name.length.over.unitNameIsTooNumber',
    defaultMessage: '班内学号为数字，最多支持2位，如：01',
  },
  isSomeCodeInput: {
    id: 'app.menu.teach.name.length.over.isSomeCodeInput',
    defaultMessage: '修改后的班内学号不能相同',
  },
  unitNameIsNodata: {
    id: 'app.menu.teach.name.length.over.unitNameIsNodata',
    defaultMessage: '班内学号只能填两位数',
  },
  editorStudent: { id: 'app.menu.classmanage.editorStudent', defaultMessage: '编辑学生' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(({ clzss }) => ({
  adminStudents: clzss.adminStudents,
}))
class BoundEditorStudentModal extends Component {
  // 数据初始化参数
  constructor(props) {
    super(props);
    this.state = {
      confirmBtn: false,
      whetherValue: props.studentInfo.isTransient || 'N', // 是否
    };
  }

  // 取消弹框方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 编辑学生方法回调
  getNaturalClass = naturalClassId => {
    const { dispatch } = this.props;
    const params = {
      id: naturalClassId,
    };
    dispatch({
      type: 'clzss/fetchNaturalClass',
      payload: params,
    });
  };

  // 选择是否
  whetherOnChange = e => {
    this.setState({
      whetherValue: e.target.value,
    });
  };

  // 绑定编辑学生的修改
  onHandleOK = () => {
    const that = this;
    const paramsArr = [];
    const { form, dispatch, studentInfo, naturalClassId } = this.props;
    const { whetherValue } = this.state;
    let classCodeInput =
      that.classCodeInput.value.substr(0, 1) !== '0' && that.classCodeInput.value < 10
        ? `0${that.classCodeInput.value}`
        : that.classCodeInput.value;
    if (classCodeInput === '0') {
      classCodeInput = '00';
    }
    const params = {
      naturalClassId,
      id: studentInfo.studentId,
      name: studentInfo.name,
      gender: studentInfo.gender,
      studentClassCode: classCodeInput,
      isTransient: whetherValue,
    };
    paramsArr.push(params);
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = that.props;
        if (studentInfo) {
          dispatch({
            type: 'clzss/updateStudents',
            payload: paramsArr,
            callback: res => {
              if (res.responseCode === '200') {
                this.setState({
                  confirmBtn: false,
                });
                that.getNaturalClass(naturalClassId);
                message.success(formatMessage(messages.editSuccess));
              } else {
                this.setState({
                  confirmBtn: false,
                });
                message.error(res.data);
              }
            },
          });
        }
        hideModal();
      }
    });
  };

  // 检查学内号
  checkCodeInput = (rule, value, callback) => {
    const re = /^[0-9]*[1-9][0-9]*$/;
    if (!re.test(value) || value === '00' || value === '0') {
      callback(formatMessage(messages.unitNameIsTooNumber));
      return;
    }
    if (value.length < 3) {
      callback();
      return;
    }
    callback(formatMessage(messages.unitNameIsNodata));
  };

  // 不能是相同班内学号
  checkSomeCodeInput = (rule, value, callback) => {
    let isSameCode = false;
    const { adminStudents, studentInfo } = this.props;
    const classCodeInput =
      this.classCodeInput.value.substr(0, 1) !== '0' && this.classCodeInput.value < 10
        ? `0${this.classCodeInput.value}`
        : this.classCodeInput.value;
    if (adminStudents.length > 0) {
      adminStudents.forEach(item => {
        if (
          item.studentId !== studentInfo.studentId &&
          item.studentClassCode === classCodeInput &&
          item.isMark === 'N'
        ) {
          isSameCode = true;
        }
      });
    }
    console.log(studentInfo);
    if (!isSameCode) {
      callback();
      return;
    }
    if (studentInfo.isMark === 'Y') {
      callback();
      return;
    }
    callback(formatMessage(messages.isSomeCodeInput));
  };

  // jsx语法视图渲染
  render() {
    const { confirmBtn } = this.state;
    const { form, visibleModal, studentInfo } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.editorStudent)}
        closable={false}
        confirmLoading={confirmBtn}
        width={460}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.boundEditorStudentModal}
      >
        <Form layout="vertical">
          <FormItem label="">
            <div className={styles.seeItem}>
              <span className={styles.itemTitle}>{formatMessage(messages.studentName)}</span>
              <span>{studentInfo.studentName}</span>
            </div>
          </FormItem>
          <FormItem label="">
            {getFieldDecorator('classCodeInput', {
              initialValue: studentInfo.studentClassCode || '',
              rules: [
                { required: true, message: formatMessage(messages.unitNameIsTooLong) },
                { validator: this.checkCodeInput },
                { validator: this.checkSomeCodeInput },
              ],
            })(
              <div className={styles.item}>
                <span className={styles.itemTitle}>
                  {formatMessage(messages.classID)}
                  <i>*</i>
                </span>
                <input
                  maxLength={2}
                  placeholder={formatMessage(messages.classID)}
                  // eslint-disable-next-line no-return-assign
                  ref={classCodeInput => (this.classCodeInput = classCodeInput)}
                  defaultValue={studentInfo.studentClassCode || ''}
                />
              </div>
            )}
          </FormItem>
          {/* <FormItem label="">
            <div className={styles.sexItem}>
              <span className={styles.itemTitle}>{formatMessage(messages.studentGender)}</span>
              <span hidden={studentInfo.gender === 'FEMALE'}>{formatMessage({id:"app.text.classManage.sex.male",defaultMessage:"男"})}</span>
              <span hidden={studentInfo.gender === 'MALE'}>{formatMessage({id:"app.text.classManage.sex.female",defaultMessage:"女"})}</span>
            </div>
          </FormItem> */}
          <FormItem label="">
            <div className={styles.item}>
              <span className={styles.itemTitle}>
                {formatMessage(messages.isBorrow)}
                <i>*</i>
              </span>
              <RadioGroup onChange={this.whetherOnChange} defaultValue={studentInfo.isTransient}>
                <Radio value="Y">
                  {formatMessage({ id: 'app.text.classManage.yes', defaultMessage: '是' })}
                </Radio>
                <Radio value="N">
                  {formatMessage({ id: 'app.text.classManage.no', defaultMessage: '否' })}
                </Radio>
              </RadioGroup>
            </div>
          </FormItem>
          {studentInfo && studentInfo.teachingClass
            ? studentInfo.teachingClass.length > 0 && (
                // eslint-disable-next-line react/jsx-indent
                <div className={styles.teachList}>
                  <div>
                    {formatMessage({
                      id: 'app.menu.classmanage.teachingClass',
                      defaultMessage: '所在教学班',
                    })}
                    :
                  </div>
                  {studentInfo.teachingClass.map(vo => {
                    return <span>{vo.name}</span>;
                  })}
                </div>
              )
            : ''}
        </Form>
      </Modal>
    );
  }
}

export default BoundEditorStudentModal;
