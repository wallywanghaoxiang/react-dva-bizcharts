/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:11
 * Explain: 添加学生弹框组件
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
  continueSave: { id: 'app.continueSave', defaultMessage: '继续添加' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '添加成功！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功创建' },
  addFailure: { id: 'app.menu.classmanage.addFailure', defaultMessage: '创建失败' },
  studentName: { id: 'app.menu.classmanage.studentName', defaultMessage: '姓名' },
  classID: { id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' },
  studentGender: { id: 'app.menu.classmanage.studentGender', defaultMessage: '性别' },
  isBorrow: { id: 'app.menu.classmanage.isBorrow', defaultMessage: '是否借读' },
  classAlreadyExists: { id: 'app.menu.classmanage.classAlreadyExists', defaultMessage: '本班已有' },
  whetherToSave: { id: 'app.menu.classmanage.whetherToSave', defaultMessage: '，是否继续保存？' },
  sameStudent: { id: 'app.menu.classmanage.sameStudent', defaultMessage: '同性别的重名学生' },
  teachingClass: { id: 'app.menu.classmanage.teachingClass', defaultMessage: '所在教学班' },
  nameCannotEmpty: { id: 'app.menu.classmanage.nameCannotEmpty', defaultMessage: '姓名不可以为空' },
  classIDCannotEmpty: {
    id: 'app.menu.classmanage.classIDCannotEmpty',
    defaultMessage: '班内学号字段不可为空，班内学号为数字，支持最多2位，如：01',
  },
  unitNameIsTooLong: {
    id: 'app.menu.classmanage.name.length.over.limited',
    defaultMessage: '长度不能超过20字',
  },
  unitNameIsTooNumber: {
    id: 'app.menu.classmanage.name.length.over.unitNameIsTooNumber',
    defaultMessage: '班内学号为数字，最多支持2位，如：01',
  },
  isSomeCodeInput: {
    id: 'app.menu.teach.name.length.over.isSomeCodeInput',
    defaultMessage: '新增的班内学号不能相同',
  },
  unitNameIsNodata: {
    id: 'app.menu.teach.name.length.over.unitNameIsNodata',
    defaultMessage: '班内学号只能填两位数',
  },
  unitNameIsNodataing: {
    id: 'app.menu.teach.name.length.over.unitNameIsNodataing',
    defaultMessage: '班内学号不能为空',
  },
  addStudent: { id: 'app.menu.classmanage.addStudent', defaultMessage: '添加学生' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(({ clzss }) => ({
  adminStudents: clzss.adminStudents,
}))
class AddStudentModal extends Component {
  // 数据初始化参数
  constructor(props) {
    super(props);
    this.cumulative = 0; // 累计初始值
    this.displayNewHint = false;
    this.state = {
      sexValue: 'MALE', // 男女
      whetherValue: 'N', // 是否
      displayHint: false,
      isSameCode: false,
      someStudents: [],
      confirmBtn: false,
    };
  }

  componentWillMount() {
    this.cumulative = 0;
  }

  // 取消弹框方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    this.setState({
      displayHint: false,
    });
    this.cumulative = 0;
    this.displayNewHint = false;
    hideModal();
  };

  // 修改成后回调重新列表
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

  // 切换性别
  sexOnChange = e => {
    this.setState({
      sexValue: e.target.value,
    });
  };

  // 选择是否
  whetherOnChange = e => {
    this.setState({
      whetherValue: e.target.value,
    });
  };

  // 同名同性别判断方法
  sameNameSex = (name, sex) => {
    let displayHint = false;
    const someStudentsArr = [];
    const { adminStudents } = this.props;
    if (adminStudents.length > 0) {
      adminStudents.forEach(item => {
        if (item.gender === sex && item.studentName === name) {
          const params = {
            someName: item.studentName,
            someClassCode: item.studentClassCode,
            someAvatar: item.accountId,
          };
          someStudentsArr.push(params);
          displayHint = true;
          this.cumulative = 0;
          return displayHint;
        }
      });
      this.setState({
        someStudents: someStudentsArr,
      });
    }
    return displayHint;
  };

  // 添加学生回调方法
  addingStudentMethod = (studentsArr, params) => {
    const that = this;
    const { form, dispatch } = that.props;
    studentsArr.push(params);
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = that.props;
        if (studentsArr && studentsArr.length > 0) {
          dispatch({
            type: 'clzss/addClassStudents',
            payload: studentsArr,
            callback: res => {
              if (res === 'SUCCESS' || res.responseCode === '200') {
                this.setState({
                  confirmBtn: false,
                  displayHint: false,
                });
                this.cumulative = 0;
                that.getNaturalClass();
                message.success(
                  formatMessage({
                    id: 'app.message.addStudentSuccess',
                    defaultMessage: '添加学生成功',
                  })
                );
              } else {
                this.setState({
                  confirmBtn: false,
                  displayHint: false,
                });
                message.error(formatMessage(messages.addFailure));
              }
            },
          });
        }
        this.setState({
          displayHint: false,
        });
        this.displayNewHint = false;
        hideModal();
      }
    });
  };

  // 添加学生处理方法
  onHandleOK = () => {
    const that = this;
    const studentsArr = [];
    const duplicateArr = [];
    const { naturalClassId, dispatch, onceDeletedModalVisible } = that.props;
    const { sexValue, whetherValue, displayHint, isSameCode } = this.state;
    const nameInput = that.nameInput.value;
    let classCodeInput =
      that.studentIDInput.value.substr(0, 1) !== '0' && that.studentIDInput.value < 10
        ? `0${that.studentIDInput.value}`
        : that.studentIDInput.value;
    if (classCodeInput === '0') {
      classCodeInput = '00';
    }
    const params = {
      campusId: localStorage.getItem('campusId'),
      naturalClassId,
      name: nameInput,
      gender: sexValue,
      studentClassCode: classCodeInput,
      isTransient: whetherValue,
    };
    const isSame = this.sameNameSex(nameInput, sexValue);
    if (isSame && !displayHint) {
      that.setState({
        displayHint: isSame,
      });
    } else {
      const duplicateParams = {
        studentList: [],
        campusId: localStorage.getItem('campusId'),
        naturalClassId,
        name: nameInput,
        gender: sexValue,
        studentClassCode: classCodeInput,
        isTransient: whetherValue,
      };
      duplicateArr.push(duplicateParams);
      if (duplicateArr.length > 0 && !isSameCode) {
        if (isSame && !displayHint) {
          that.setState({
            displayHint: isSame,
          });
        } else {
          dispatch({
            type: 'clzss/postDuplicateStudents',
            payload: duplicateArr,
            callback: res => {
              if (res.responseCode === '200') {
                const resData = res.data;
                const { restoreName } = resData;
                // 最近删除
                if (restoreName.length > 0) {
                  const { hideModal } = this.props;
                  hideModal();
                  that.setState({
                    displayHint: false,
                  });
                  that.cumulative = 0;
                  onceDeletedModalVisible(true, restoreName, studentsArr, params);
                } else {
                  this.addingStudentMethod(studentsArr, params);
                }
              } else {
                const mgs = res.data;
                message.warning(mgs);
              }
            },
          });
        }
      }
    }
  };

  // 判断名称最大长度
  checkInput = (rule, value, callback) => {
    if (value !== '' && value.trim() === '') {
      callback(formatMessage(messages.nameCannotEmpty));
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
    const { adminStudents } = this.props;
    const classCodeInput =
      this.studentIDInput.value.substr(0, 1) !== '0' && this.studentIDInput.value < 10
        ? `0${this.studentIDInput.value}`
        : this.studentIDInput.value;
    if (adminStudents.length > 0) {
      adminStudents.forEach(item => {
        if (item.studentClassCode === classCodeInput && item.isMark === 'N') {
          isSameCode = true;
        }
      });
    }
    this.setState({
      isSameCode,
    });
    if (!isSameCode) {
      callback();
      return;
    }
    callback(formatMessage(messages.isSomeCodeInput));
  };

  // 检查学内号
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
    if (!re.test(value) && value !== '00') {
      callback(formatMessage(messages.unitNameIsNodataing));
      return;
    }
    callback(formatMessage(messages.unitNameIsNodata));
  };

  changeKeyUp = () => {
    if (this.studentIDInput) {
      this.studentIDInput.value = this.studentIDInput.value.replace(/[^\d]+/g, '');
    }
  };

  // jsx语法视图渲染
  render() {
    const { confirmBtn, displayHint, someStudents, isSameCode } = this.state;
    const { form, visibleModal } = this.props;
    const { getFieldDecorator } = form;
    if (
      this.cumulative === 0 &&
      !isSameCode &&
      (this.studentIDInput && this.studentIDInput.value)
    ) {
      this.cumulative++;
      this.displayNewHint = displayHint;
    }
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.addStudent)}
        closable={false}
        confirmLoading={confirmBtn}
        width={460}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={
          this.displayNewHint ? formatMessage(messages.continueSave) : formatMessage(messages.save)
        }
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.addStudentModal}
      >
        <Form layout="vertical">
          <FormItem label="">
            {getFieldDecorator('nameInput', {
              initialValue: '',
              rules: [
                { required: true, message: formatMessage(messages.nameCannotEmpty) },
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
                  ref={nameInput => (this.nameInput = nameInput)}
                  defaultValue=""
                />
              </div>
            )}
          </FormItem>
          <FormItem label="">
            {getFieldDecorator('studentIDInput', {
              initialValue: '',
              rules: [
                { required: true, message: formatMessage(messages.unitNameIsNodataing) },
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
                  ref={studentIDInput => (this.studentIDInput = studentIDInput)}
                  defaultValue=""
                />
              </div>
            )}
          </FormItem>
          {/* <FormItem label="">
            <div className={styles.item}>
              <span className={styles.itemTitle}>{formatMessage(messages.studentGender)}<i>*</i></span>
              <RadioGroup onChange={this.sexOnChange} defaultValue='MALE'>
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
              <RadioGroup onChange={this.whetherOnChange} defaultValue="N">
                <Radio value="Y">
                  {formatMessage({ id: 'app.text.classManage.yes', defaultMessage: '是' })}
                </Radio>
                <Radio value="N">
                  {formatMessage({ id: 'app.text.classManage.no', defaultMessage: '否' })}
                </Radio>
              </RadioGroup>
            </div>
          </FormItem>
          {this.displayNewHint ? (
            <FormItem label="">
              <div className={styles.theSame}>
                <div>
                  <span className={styles.itemTitle}>
                    <i
                      className="iconfont icon-tip"
                      style={{ color: '#FF6E4A', fontSize: '13px' }}
                    />
                    {formatMessage(messages.classAlreadyExists)}
                  </span>
                  <span className={styles.itemTitle2}>{formatMessage(messages.sameStudent)}</span>
                  <span className={styles.itemTitle3}>{formatMessage(messages.whetherToSave)}</span>
                </div>
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
            </FormItem>
          ) : null}
        </Form>
      </Modal>
    );
  }
}

export default AddStudentModal;
