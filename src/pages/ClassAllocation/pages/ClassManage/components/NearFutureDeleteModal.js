import React, { Component } from 'react';
import { Modal, List, Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import StudentAvatar from './StudentAvatar';

// 国际化适配方式
const messages = defineMessages({
  deletedStuTipTit: {
    id: 'app.deleted.student.confirm.tip.title',
    defaultMessage: '发现您在异动期内删除过同性别同名的学生',
  },
  deletedStuTip1: {
    id: 'app.deleted.student.confirm.tip.title1',
    defaultMessage: '选择右侧学生，会进行数据恢复，且',
  },
  deletedStuTip2: { id: 'app.deleted.student.confirm.tip.title2', defaultMessage: '不可撤销' },
  deletedStuTip3: {
    id: 'app.deleted.student.confirm.tip.title3',
    defaultMessage: '不选择学生，则表示调入学生为一个新的学生',
  },
});

class NearFutureDeleteModal extends Component {
  constructor(props) {
    super(props);
    this.recoveryData = []; // 存储恢复的数据
    this.state = {
      selectItem: [],
    };
  }

  // 取消方法
  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  handleOk = () => {
    const { onOK } = this.props;
    onOK(this.recoveryData);
  };

  modalClose = () => {
    this.recoveryData = [];
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
      // eslint-disable-next-line no-param-reassign
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
    const { visible, restoreName } = this.props;
    // eslint-disable-next-line no-unused-vars
    const { selectItem } = this.state;

    return (
      <Modal
        title=""
        okText={formatMessage({ id: 'app.confirm', defaultMessage: '确定' })}
        cancelText={formatMessage({ id: 'app.cancel', defaultMessage: '取消' })}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        className="add-manager-modal"
        width="520px"
        closable={false}
        centered
        destroyOnClose
        maskClosable={false}
        afterClose={this.modalClose}
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
                  {formatMessage(messages.deletedStuTipTit)}
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
                  <span>
                    {formatMessage({
                      id: 'app.text.deleted.student.confirm.tip.title4',
                      defaultMessage: '不选择任何学生，则新增一位',
                    })}
                  </span>
                </div>
              </div>
            </div>
            {/* 近期删除学生 */}
            <div>
              {restoreName &&
                restoreName.map(obj => {
                  return (
                    <div
                      key={obj.studentClassCode}
                      style={{
                        paddingTop: '10px',
                        display: 'flex',
                        width: '100%',
                        borderBottom: '1px solid #E5E5E5',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ width: '200px', lineHeight: '50px', display: 'flex' }}>
                        <Tooltip title={obj.name} placement="top">
                          <div
                            style={{
                              color: '#333333',
                              fontSize: '14px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {obj.name}
                          </div>
                        </Tooltip>

                        <span style={{ color: '#333333', fontSize: '13px', paddingLeft: '20px' }}>
                          {obj.studentClassCode}
                        </span>
                      </div>
                      <div style={{ width: '280px', paddingBottom: '5px' }}>
                        <List
                          grid={{ gutter: 2, column: 2 }}
                          dataSource={obj.studentList}
                          renderItem={item => (
                            <List.Item>
                              <StudentAvatar
                                key={item.studentClassCode}
                                item={item}
                                selectItem={
                                  (obj.select && obj.select.find(vo => vo.id === item.id)) || false
                                }
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

export default NearFutureDeleteModal;
