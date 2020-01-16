/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:18
 * Explain: 更新学生弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, message, Radio, Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import UserAvatar from '../../../Components/UserAvatar';
import styles from './index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  continueSave: { id: 'app.continueSave', defaultMessage: '继续保存' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功创建' },
  studentName: { id: 'app.menu.classmanage.studentName', defaultMessage: '姓名' },
  classID: { id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' },
  studentGender: { id: 'app.menu.classmanage.studentGender', defaultMessage: '性别' },
  isBorrow: { id: 'app.menu.classmanage.isBorrow', defaultMessage: '是否借读' },
  teachingClass: { id: 'app.menu.classmanage.teachingClass', defaultMessage: '所在教学班' },
  classAlreadyExists: { id: 'app.menu.classmanage.classAlreadyExists', defaultMessage: '本班已有' },
  whetherToSave: { id: 'app.menu.classmanage.whetherToSave', defaultMessage: '，是否继续保存？' },
  sameStudent: { id: 'app.menu.classmanage.sameStudent', defaultMessage: '同性别的重名学生' },
  unitNameIsTooLong: {
    id: 'app.menu.classmanage.name.length.over.limited',
    defaultMessage: '长度不能超过20字',
  },
  nameEmpty: {
    id: 'app.menu.classmanage.name.length.over.nameEmpty',
    defaultMessage: '姓名不能为空',
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
  classCodeEmpty: {
    id: 'app.menu.classmanage.name.length.over.classCodeEmpty',
    defaultMessage: '学号不可以为空',
  },
  editorStudent: { id: 'app.menu.classmanage.editorStudent', defaultMessage: '编辑学生' },
  unitNameIsNodataing: {
    id: 'app.menu.teach.name.length.over.unitNameIsNodataing',
    defaultMessage: '班内学号不能为空',
  },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(({ clzss }) => ({
  adminStudents: clzss.adminStudents,
}))
class EditorStudentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmBtn: false,
      displayHint: false,
      someStudents: [],
      sexValue: props.studentInfo.gender || 'MALE', // 男女
      whetherValue: props.studentInfo.isTransient || 'N', // 是否
    };
  }

  // 取消方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
    this.setState({
      displayHint: false,
    });
  };

  // 切换性别
  sexOnChange = e => {
    this.setState({
      sexValue: e.target.value,
    });
  };

  // 回到方法刷新列表
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

  changeKeyUp = () => {
    if (this.classCodeInput) {
      this.classCodeInput.value = this.classCodeInput.value.replace(/[^\d]+/g, '');
    }
  };

  // 相同同名同性提示
  sameNameSex = (name, sex) => {
    let displayHint = false;
    const someStudentsArr = [];
    const { adminStudents, studentInfo } = this.props;
    if (adminStudents.length > 0) {
      // eslint-disable-next-line consistent-return
      adminStudents.forEach(item => {
        if (
          item.studentId !== studentInfo.studentId &&
          item.gender === sex &&
          item.studentName === name
        ) {
          const params = {
            someName: item.studentName,
            someClassCode: item.studentClassCode,
            someAvatar: item.accountId,
          };
          someStudentsArr.push(params);
          displayHint = true;
          return displayHint;
        }
      });
      this.setState({
        someStudents: someStudentsArr,
      });
    }
    return displayHint;
  };

  // 编辑学生方法
  onHandleOK = () => {
    const that = this;
    const paramsArr = [];
    const { form, dispatch, studentInfo, naturalClassId } = this.props;
    const { whetherValue, sexValue, displayHint } = this.state;
    const nameInput = that.nameInput.value;
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
      name: nameInput,
      gender: sexValue,
      studentClassCode: classCodeInput,
      isTransient: whetherValue,
    };
    console.log(naturalClassId);
    const isSame = this.sameNameSex(nameInput, sexValue);
    if (isSame && !displayHint) {
      this.setState({
        displayHint: isSame,
      });
    } else {
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
          this.setState({
            displayHint: false,
          });
        }
      });
    }
  };

  // 表单判断名称最大长度
  checkInput = (rule, value, callback) => {
    if (value !== '' && value.trim() === '') {
      callback(formatMessage(messages.nameEmpty));
    }
    if (value.length < 21) {
      callback();
      return;
    }
    callback(formatMessage(messages.unitNameIsTooLong));
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

  // 不能是相同班内学号
  checkCodeInput = (rule, value, callback) => {
    const re = /^[0-9]*[1-9][0-9]*$/;
    if (value !== '' && value.trim() === '') {
      callback(formatMessage(messages.unitNameIsNodataing));
    }
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

  // jsx语法视图渲染
  render() {
    const { confirmBtn, displayHint, someStudents } = this.state;
    // eslint-disable-next-line no-unused-vars
    const { form, visibleModal, studentInfo, naturalClassId } = this.props;
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
        okText={displayHint ? formatMessage(messages.continueSave) : formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={displayHint ? styles.editorContinueStudentModal : styles.editorStudentModal}
      >
        <Form layout="vertical">
          <FormItem label="">
            {getFieldDecorator('nameInput', {
              initialValue: studentInfo.studentName || '',
              rules: [
                { required: true, message: formatMessage(messages.nameEmpty) },
                { validator: this.checkInput },
              ],
            })(
              <div className={styles.item}>
                <span className={styles.itemTitle}>
                  {formatMessage(messages.studentName)}
                  <i>*</i>
                </span>
                <input
                  maxLength={20}
                  placeholder={formatMessage(messages.studentName)}
                  // eslint-disable-next-line no-return-assign
                  ref={nameInput => (this.nameInput = nameInput)}
                  defaultValue={studentInfo.studentName || ''}
                />
              </div>
            )}
          </FormItem>
          <FormItem label="">
            {getFieldDecorator('classCodeInput', {
              initialValue: studentInfo.studentClassCode || '',
              rules: [
                { required: true, message: formatMessage(messages.classCodeEmpty) },
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
                  onKeyUp={this.changeKeyUp()}
                  placeholder={formatMessage(messages.classID)}
                  // eslint-disable-next-line no-return-assign
                  ref={classCodeInput => (this.classCodeInput = classCodeInput)}
                  defaultValue={studentInfo.studentClassCode || ''}
                />
              </div>
            )}
          </FormItem>
          {/* <FormItem label="">
            <div className={styles.item}>
              <span className={styles.itemTitle}>{formatMessage(messages.studentGender)}<i>*</i></span>
              <RadioGroup onChange={this.sexOnChange} defaultValue={studentInfo.gender}>
                <Radio value='MALE'>{formatMessage({id:"app.text.classManage.sex.male",defaultMessage:"男"})}</Radio>
                <Radio value='FEMALE'>{formatMessage({id:"app.text.classManage.sex.female",defaultMessage:"女"})}</Radio>
              </RadioGroup>
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
          {displayHint ? (
            <FormItem label="">
              <div className={styles.theSame}>
                <i className="iconfont icon-tip" />
                <span className={styles.itemTitle}>
                  {formatMessage(messages.classAlreadyExists)}
                </span>
                <span className={styles.itemTitle2}>{formatMessage(messages.sameStudent)}</span>
                <span className={styles.itemTitle3}>{formatMessage(messages.whetherToSave)}</span>
                <div>
                  {someStudents &&
                    someStudents.length > 0 &&
                    someStudents.map(item => {
                      return (
                        <div className={styles.clzss}>
                          <div>
                            <UserAvatar id={item.someAvatar} />
                            <Tooltip placement="top" title={item.someName}>
                              <span className={styles.name}>{item.someName}</span>
                            </Tooltip>
                            <span>{item.someClassCode}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </FormItem>
          ) : null}
        </Form>
      </Modal>
    );
  }
}

export default EditorStudentModal;
