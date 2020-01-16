/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:21
 * Explain: 编辑老师弹框组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Modal, message, Checkbox } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '保存' },
  editSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '编辑成功！' },
  editFailure: { id: 'app.menu.classmanage.success.editFailure', defaultMessage: '编辑失败！' },
  selectedSubject: { id: 'app.menu.classmanage.selectedSubject', defaultMessage: '学科' },
  teacherName: { id: 'app.menu.classmanage.teacherName', defaultMessage: '姓名' },
  selectedOneSubject: { id: 'app.menu.classmanage.selectedOneSubject', defaultMessage: '请至少配置一个学科' },
  editorTeacher: { id: 'app.menu.classmanage.editorTeacher', defaultMessage: '编辑教师' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(() => ({}))
class EditorTeacherModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      confirmBtn: false,
      subjectList: [],
      options: [
        { label: '英语', value: '103' },
      ],
    };
  }

  // 取消弹框方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 方法回调刷新数据
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

  // 组装过滤id参数
  extractIds = (subjectList) => {
    const ids = [];
    if (subjectList && subjectList.length > 0) {
      subjectList.forEach((item) => {
        if (item.selected) {
          ids.push(item.id);
        }
      });
    }
    return ids;
  };

  // 选择科目
  selectedSuject = (item, subjectList) => {
    const tempSubjectList = [];
    if (subjectList && subjectList.length > 0) {
      subjectList.forEach((subject) => {
        if (subject.id === item.id) {
          if (item.selected) {
            subject.selected = false;
          } else {
            subject.selected = true;
          }
        }
        tempSubjectList.push(subject);
      });
    }
    this.setState({
      subjectList: tempSubjectList,
    });
  };

  // 编辑老师方法
  onHandleOK = () => {
    const that = this;
    const { form, dispatch } = that.props;
    const { subjectList } = this.state;
    const ids = this.extractIds(subjectList);
    form.validateFields((err) => {
      if (!err) {
        const { hideModal } = that.props;
        dispatch({
          type: 'clzss/delClassTeachers',
          payload: ids,
          callback: (res) => {
            const x = typeof res === 'string' ? JSON.parse(res) : res;
            const { responseCode, data } = x;
            if (responseCode === '200') {
              this.setState({
                confirmBtn: false,
              });
              that.getNaturalClass();
              message.success(formatMessage(messages.editSuccess));
            } else {
              this.setState({
                confirmBtn: false,
              });
              message.warning(data);
            }
          },
        });
        hideModal();
      }
    });
  };

  // jsx语法视图渲染
  render() {
    const { confirmBtn, options } = this.state;
    const { visibleModal, teacher } = this.props;
    function onChange(checkedValues) {
      console.log('checked = ', checkedValues);
    }
    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.editorTeacher)}
        closable={false}
        confirmLoading={confirmBtn}
        width={460}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.editorTeacherModal}
      >
        <Form layout="vertical">
          <FormItem label="">
            {teacher ? (
              <div className={styles.seeItem}>
                <span className={styles.itemTitle}>{formatMessage(messages.teacherName)}</span>
                <span>{teacher.teacherName}</span>
              </div>
            ) : (
              null
            )}
          </FormItem>
          <FormItem label="">
            <div className={styles.item}>
              <span className={styles.itemTitle}>{formatMessage(messages.selectedSubject)}<i>*</i></span>
              {teacher && teacher.subjectList && teacher.subjectList.length > 0 ? (
                teacher.subjectList.map(item => (
                  <div
                    onClick={() => {
                      this.selectedSuject(item, teacher.subjectList);
                    }}
                  >
                    <CheckboxGroup
                      options={options}
                      defaultValue={[`${item.subjectCode}`]}
                      onChange={onChange}
                    />

                  </div>
                ))
              ) : (
                null
              )}
            </div>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default EditorTeacherModal;
