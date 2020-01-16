/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-04
 * Time: AM 09:45
 * Explain: 申请退学组件
 *
 * */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Form, Select } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
// eslint-disable-next-line no-unused-vars
import TeacherAvatar from '@/assets/class/avarta_teacher.png';
import UserAvatar from '../../../Components/UserAvatar';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;

// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.confirm', defaultMessage: '确定' },
  dropOutSuccess: { id: 'app.menu.classmanage.success.toast', defaultMessage: '申请成功！' },
  dropOutFailure: { id: 'app.menu.classmanage.fail.toast', defaultMessage: '申请失败！' },
  dropOutSchool: { id: 'app.menu.classmanage.editorStudent', defaultMessage: '申请退学' },
  outSchoolReason: { id: 'app.menu.classmanage.outSchoolReason', defaultMessage: '退学原因' },
});

// Create表单
@Form.create()
// connect方法可以拿取models中state值
@connect(({ clzss }) => {
  const { quitReasons } = clzss;
  return {
    quitReasons,
  };
})
class DropOutSchoolModal extends Component {
  // 构造函数初始化数据
  constructor(props) {
    super(props);
    this.state = {
      confirmBtn: false,
      reasons: '',
      reasonValue: '',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const params = {
      type: 'QUIT_COMMENT',
    };
    dispatch({
      type: 'clzss/getQuitReasons',
      payload: params,
      callback: data => {
        const reason = data[0];
        this.setState({
          reasons: reason.code,
          reasonValue: reason.value,
        });
      },
    });
  }

  // 取消方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 申请退学后回调刷新列表
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

  // 选择退学原因
  handleChange = (value, option) => {
    console.log('----option:', option);
    this.setState({
      reasons: value,
      reasonValue: option.props.children,
    });
  };

  // 申请退学方法
  onHandleOK = () => {
    const that = this;
    // const paramsArr = [];
    const { reasons, reasonValue } = this.state;
    const { form, dispatch, currentStudent } = that.props;
    const campusId = localStorage.getItem('campusId');
    const teacherId = localStorage.getItem('teacherId');
    const params = {
      studentId: currentStudent.studentId,
      quitComment: reasons, // 退学原因
      quitCommentValue: reasonValue,
      campusId,
      teacherId,
    };
    // paramsArr.push(params);
    form.validateFields(err => {
      if (!err) {
        const { hideModal } = that.props;
        dispatch({
          type: 'clzss/updateStudentsQuit',
          payload: params,
          callback: res => {
            if (res === 'SUCCESS' || res.responseCode === '200') {
              this.setState({
                confirmBtn: false,
              });
              that.getNaturalClass();
              message.success(
                formatMessage({
                  id: 'app.message.applyForLeaveSchoolSuccess',
                  defaultMessage: '申请退学成功',
                })
              );
            } else if (res.responseCode === '460') {
              this.setState({
                confirmBtn: false,
              });
              that.getNaturalClass();
              const mgs = res.data;
              message.warning(mgs);
            } else {
              this.setState({
                confirmBtn: false,
              });
              message.error(formatMessage(messages.dropOutFailure));
            }
          },
        });
        hideModal();
      }
    });
  };

  // jsx语法视图渲染
  render() {
    const { confirmBtn, reasons } = this.state;
    const { visibleModal, currentStudent, quitReasons } = this.props;
    console.log(quitReasons);

    let name = '';
    if (currentStudent) {
      if (currentStudent.studentName && currentStudent.studentName.length > 4) {
        name = `${currentStudent.studentName.substring(0, 4)}...`;
      } else {
        name = currentStudent.studentName;
      }
    }

    return (
      <Modal
        visible={visibleModal}
        centered
        title={formatMessage(messages.dropOutSchool)}
        closable={false}
        confirmLoading={confirmBtn}
        width={400}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.dropOutSchoolModal}
      >
        {currentStudent && currentStudent.studentId ? (
          <Form layout="vertical">
            <FormItem label="">
              <div className={styles.item}>
                <div className={styles.student}>
                  <span>
                    {formatMessage({ id: 'app.text.classManage.Apply', defaultMessage: '申请' })}
                  </span>
                  <span className={styles.img}>
                    <span className={styles.position}>
                      <UserAvatar id={currentStudent.accountId} />
                      <span
                        title={
                          currentStudent.studentName &&
                          currentStudent.studentName.length > 4 &&
                          currentStudent.studentName
                        }
                      >
                        {name}
                      </span>
                      &nbsp;
                      <span>{currentStudent.studentClassCode}</span>
                    </span>
                  </span>
                  <span>
                    {formatMessage({
                      id: 'app.text.classManage.Drop.out.of.school',
                      defaultMessage: '退学，是否确认',
                    })}
                  </span>
                </div>
                <span className={styles.itemTitle}>
                  {formatMessage(messages.outSchoolReason)}
                  <i>*</i>
                </span>
                <Select
                  style={{ width: 240 }}
                  defaultValue={reasons}
                  optionFilterProp="children"
                  onChange={this.handleChange}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {quitReasons.map(item => {
                    return <Option value={item.code}>{item.value}</Option>;
                  })}
                </Select>
              </div>
            </FormItem>
          </Form>
        ) : null}
      </Modal>
    );
  }
}

export default DropOutSchoolModal;
