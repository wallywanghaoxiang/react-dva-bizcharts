/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-25
 * Time: PM 13:02
 * Explain: 同名同姓提示
 *
 * */
import React, { Component } from 'react';
import { Modal, List } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import StudentAvatar from './StudentAvatar';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  cancel: { id: 'app.cancel', defaultMessage: '取消' },
  save: { id: 'app.save', defaultMessage: '确认' },
  deletedStuTipTit: {
    id: 'app.deleted.student.confirm.tip.title',
    defaultMessage: '本班有同性别同姓名的学生',
  },
  deletedStuTip1: {
    id: 'app.deleted.student.confirm.tip.title1',
    defaultMessage: '选择右侧学生，会进行数据合并，且',
  },
  deletedStuTip2: { id: 'app.deleted.student.confirm.tip.title2', defaultMessage: '不可撤销' },
  deletedStuTip3: {
    id: 'app.deleted.student.confirm.tip.title3',
    defaultMessage: '不选择学生，则表示调入学生为一个新的学生',
  },
});

class SameNameAndGenderModal extends Component {
  // 数据初始化参数
  constructor(props) {
    super(props);
    this.recoveryData = []; // 存储恢复的数据
    this.state = {
      selectItem: [],
    };
  }

  handleOk = () => {
    const { onOK } = this.props;
    onOK(this.recoveryData);
  };

  // 取消弹框方法
  onHandleCancel = () => {
    const { hideModal } = this.props;
    hideModal();
  };

  // 添加老师方法
  onHandleOK = () => {
    const { hideModal, restoreName, duplicateName } = this.props;
    if (restoreName.length > 0) {
      const restoreNameDel =
        restoreName.filter(v2 => {
          const student = this.recoveryData.find(v3 => v3.studentId === v2.studentId);
          if (student) {
            return false;
          }
          return true;
        }) || [];
      if (restoreNameDel.length > 0) {
        this.showModalWarn(restoreNameDel, this.recoveryData);
        hideModal(false, duplicateName, restoreNameDel, this.recoveryData);
      } else {
        this.handleOk();
      }
    } else {
      this.handleOk();
    }
  };

  // 近期删除学生提示弹窗
  showModalWarn = (restoreName, recoveryData) => {
    const { nearFutureDeleteModalVisible } = this.props;
    nearFutureDeleteModalVisible(true, restoreName, recoveryData);
  };

  // 选择一个管理员
  selectManager = (obj, item) => {
    const { selectItem } = this.state;
    const currentIndex = selectItem.findIndex(
      vo => vo.id === item.id && vo.objStudentId === obj.studentId
    );
    if (currentIndex >= 0) {
      selectItem.splice(currentIndex, 1);
    } else {
      const studentIndex = selectItem.findIndex(vo => vo.id === item.id);
      if (studentIndex >= 0) {
        selectItem.splice(studentIndex, 1);
      }
      // eslint-disable-next-line no-param-reassign
      item.objStudentId = obj.studentId;
      selectItem.push(item);
    }
    if (obj.select && obj.select.length > 0) {
      const studentIndex = selectItem.findIndex(vo => vo.id === obj.select[0].id);
      if (studentIndex >= 0) {
        selectItem.splice(studentIndex, 1);
      }
      // eslint-disable-next-line no-param-reassign
      obj.select = [];
    }
    // eslint-disable-next-line no-param-reassign
    obj.select =
      obj.studentList.filter(v2 => {
        const student = selectItem.find(v3 => v3.id === v2.id && v3.objStudentId === obj.studentId);
        if (student) {
          return true;
        }
        return false;
      }) || [];
    console.log(obj.select);

    this.setState({
      selectItem,
    });

    if (this.recoveryData && this.recoveryData.length > 0) {
      let status = true;
      this.recoveryData.forEach((j, i) => {
        // 根据学号判断是否已近存入
        if (
          j.select &&
          obj.select &&
          j.select.length > 0 &&
          j.studentId !== obj.studentId &&
          j.select[0].id === obj.select[0].id
        ) {
          this.recoveryData[i].select = [];
        }
        if (selectItem.length === 0) {
          this.recoveryData[i].select = [];
        }
        if (j.studentId === obj.studentId) {
          status = false;
          this.recoveryData.splice(i, 1, obj);
        }
      });
      if (status) {
        this.recoveryData.push(obj);
      }
    } else {
      this.recoveryData.push(obj);
    }
    this.recoveryData = this.recoveryData.filter(v => v.select.length > 0);
  };

  render() {
    const { confirmBtn, selectItem } = this.state;
    const { visibleModal, duplicateName } = this.props;
    return (
      <Modal
        visible={visibleModal}
        centered
        closable={false}
        confirmLoading={confirmBtn}
        width={500}
        maskClosable={false}
        destroyOnClose
        cancelText={formatMessage(messages.cancel)}
        okText={formatMessage(messages.save)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.addTeacherModal}
      >
        <div className="content">
          <div className="cont">
            <div
              style={{
                padding: '10px 10px',
                background: '#FFF8E6',
                borderRadius: '5px',
                fontSize: '13px',
              }}
            >
              <div>
                <i className="iconfont icon-tip" style={{ color: '#FF6E4A', fontSize: '13px' }} />
                <span style={{ paddingLeft: '5px' }}>
                  {formatMessage({
                    id: 'app.title.ourClassHasAStudentOfTheSameName',
                    defaultMessage: '本班有同姓名的学生',
                  })}
                </span>
              </div>
              <div style={{ padding: '5px 5px', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    background: '#888888',
                    borderRadius: '2px',
                    marginRight: '5px',
                  }}
                />
                <div>
                  <span>{formatMessage(messages.deletedStuTip1)}</span>
                  <span style={{ color: '#FF6E4A' }}>{formatMessage(messages.deletedStuTip2)}</span>
                </div>
              </div>
              <div style={{ padding: '0px 5px', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    background: '#888888',
                    borderRadius: '2px',
                    marginRight: '5px',
                  }}
                />
                <div>
                  <span>{formatMessage(messages.deletedStuTip3)}</span>
                </div>
              </div>
            </div>
            {/* 近期删除学生 */}
            <div>
              {duplicateName &&
                duplicateName.map((obj, idx) => {
                  return (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      style={{
                        paddingTop: '10px',
                        display: 'flex',
                        width: '100%',
                        borderBottom: '1px solid #E5E5E5',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ width: '200px', lineHeight: '50px' }}>
                        <span style={{ color: '#333333', fontSize: '14px' }}>{obj.name}</span>
                        <span style={{ color: '#333333', fontSize: '13px', paddingLeft: '20px' }}>
                          {obj.studentClassCode}
                        </span>
                      </div>
                      <div style={{ width: '280px', paddingBottom: '5px' }}>
                        <List
                          grid={{ gutter: 0, column: 2 }}
                          dataSource={obj.studentList}
                          renderItem={item => (
                            <List.Item>
                              <StudentAvatar
                                item={item}
                                selectItem={selectItem.find(
                                  vo => vo.id === item.id && vo.objStudentId === obj.studentId
                                )}
                                onHandleSelectManager={() => this.selectManager(obj, item)}
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default SameNameAndGenderModal;
