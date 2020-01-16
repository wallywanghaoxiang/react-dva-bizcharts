/**
 *
 * User: tina.zhang
 * Explain: 更新学生弹框组件
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
  studentName: { id: 'app.menu.teach.studentName', defaultMessage: '姓名' },
  studentGender: { id: 'app.menu.teach.studentGender', defaultMessage: '性别' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  editFailure: { id: 'app.menu.classmanage.success.editFailure', defaultMessage: '编辑失败！' },
  addSuccess: { id: 'app.menu.classmanage.add.success.toast', defaultMessage: '您已成功创建' },
  classID: { id: 'app.menu.classmanage.classID', defaultMessage: '班内学号' },
  isBorrow: { id: 'app.menu.classmanage.isBorrow', defaultMessage: '是否借读' },
  teachingClass: { id: 'app.menu.classmanage.teachingClass', defaultMessage: '所在教学班' },
  classAlreadyExists: { id: 'app.menu.classmanage.classAlreadyExists', defaultMessage: '本班已有' },
  whetherToSave: { id: 'app.menu.classmanage.whetherToSave', defaultMessage: '，是否继续保存？' },
  sameStudent: { id: 'app.menu.classmanage.sameStudent', defaultMessage: '同性别的重名学生' },
  unitNameIsTooLong: {
    id: 'app.menu.classmanage.name.length.over.limited',
    defaultMessage: '班内学号不能为空',
  },
  unitNameIsTooNumber: {
    id: 'app.menu.classmanage.name.length.over.unitNameIsTooNumber',
    defaultMessage: '班内学号为数字，最多支持2位，如：01',
  },
  unitNameIsNodata: {
    id: 'app.menu.teach.name.length.over.unitNameIsNodata',
    defaultMessage: '班内学号只能填2位数',
  },
  editorStudent: { id: 'app.menu.classmanage.editorStudent', defaultMessage: '编辑学生' },
});

@Form.create()
@connect(({ clzss, loading }) => ({
  loading: loading.effects['clzss/updateTeachingStudentCode'],
  teachingStudents: clzss.teachingStudents,
  currentTeachInfo: clzss.currentTeachInfo,
}))
class EditorStudentModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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

  // 编辑学号回调
  onHandleOK = () => {
    const that = this;
    const { form, dispatch, studentInfo, teachingClassId } = that.props;
    const curAlias = that.nameInput.value;
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = that.props;
        if (curAlias) {
          dispatch({
            type: 'clzss/updateTeachingStudentCode',
            payload: [
              {
                studentId: studentInfo.studentId,
                teachingClassId,
                studentClassCode: curAlias.length === 1 ? `0${curAlias}` : curAlias,
              },
            ],
            callback: res => {
              const x = typeof res === 'string' ? JSON.parse(res) : res;
              const { responseCode, data } = x;
              if (responseCode === '200') {
                that.fetchNaturalClass();
                hideModal();
                message.success(formatMessage(messages.editSuccess));
              } else {
                message.error(data);
              }
            },
          });
        }
      }
    });
  };

  checkInput = (rule, value, callback) => {
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

  render() {
    const { form, visibleModal, studentInfo, loading } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.editorStudent)}
        closable={false}
        confirmLoading={loading}
        width={460}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.editorStudentModal}
      >
        <Form layout="vertical">
          <div className={styles.teaching}>
            <span className="itemTitle">
              {formatMessage(messages.studentName)}
              <i>&nbsp;</i>
            </span>
            {studentInfo.studentName}
          </div>
          <FormItem label="">
            {getFieldDecorator('nameInput', {
              initialValue: studentInfo.studentClassCode || '',
              rules: [
                { required: true, message: formatMessage(messages.unitNameIsTooLong) },
                { validator: this.checkInput },
              ],
            })(
              <div className={styles.item}>
                <span className={styles.itemTitle}>
                  {formatMessage(messages.classID)}
                  <i>*</i>
                </span>
                <input
                  maxLength={3}
                  placeholder={
                    studentInfo.studentClassCode
                      ? studentInfo.studentClassCode
                      : formatMessage(messages.classID)
                  }
                  ref={nameInput => {
                    this.nameInput = nameInput;
                  }}
                  defaultValue={studentInfo.studentClassCode || ''}
                />
              </div>
            )}
          </FormItem>
          {/* <div className={styles.teaching}>
            <span
              className="itemTitle"
            >{formatMessage(messages.studentGender)}<i>&nbsp;</i>
            </span>
            {studentInfo.gender === 'MALE' ? formatMessage({id:"app.text.classManage.sex.male",defaultMessage:"男"}) : formatMessage({id:"app.text.classManage.sex.female",defaultMessage:"女"})}
          </div> */}
        </Form>
      </Modal>
    );
  }
}

export default EditorStudentModal;
