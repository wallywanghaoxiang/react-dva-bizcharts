/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-27
 * Time: PM 13:02
 * Explain: 曾经删除的学生
 *
 * */
import React, { Component } from 'react';
import { Modal, List } from 'antd';
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
    defaultMessage: '选择下面的学生，会进行数据恢复，且',
  },
  deletedStuTip2: { id: 'app.deleted.student.confirm.tip.title2', defaultMessage: '不可撤销' },
});

class OnceDeletedModal extends Component {
  constructor(props) {
    super(props);
    this.onceDeleteData = []; // 存储恢复的数据
    this.state = {
      selectItem: '',
    };
  }

  // 取消方法
  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  handleOk = () => {
    const { onOK } = this.props;
    onOK(this.onceDeleteData);
  };

  modalClose = () => {
    this.setState({
      selectItem: '',
    });
  };

  // 选择一个管理员
  selectManager = (obj, item) => {
    const { selectItem } = this.state;
    if (selectItem) {
      if (this.onceDeleteData.length > 0) {
        let oldItemIdx = null;
        this.onceDeleteData.forEach((it, idx) => {
          if (it.select.id === selectItem.id) {
            oldItemIdx = idx;
          }
        });
        if (oldItemIdx !== null) {
          this.onceDeleteData.splice(oldItemIdx, 1);
        }
      }
      this.setState({
        selectItem: null,
      });
    } else {
      this.setState({
        selectItem: item,
      });
      obj.select = item;
      if (this.onceDeleteData.length > 0) {
        this.onceDeleteData.forEach((j, i) => {
          // 根据学号判断是否已近存入
          if (j.studentClassCode === item.item) {
            this.onceDeleteData.splice(i, 1, obj);
          } else {
            this.onceDeleteData.push(obj);
          }
        });
      } else {
        this.onceDeleteData.push(obj);
      }
    }
  };

  render() {
    const { visibleModal, restoreName } = this.props;
    const { selectItem } = this.state;
    return (
      <Modal
        title=""
        okText="确定"
        cancelText="取消"
        visible={visibleModal}
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
                {restoreName && restoreName.length > 0 ? (
                  <div>
                    <span>
                      {formatMessage({
                        id: 'app.text.deleted.student.confirm.tip.title4',
                        defaultMessage: '不选择任何学生，则新增一位',
                      })}
                    </span>
                    <span style={{ 'font-size': '14px', color: '#03C46B' }}>
                      {`"${restoreName[0].name}"学生`}
                    </span>
                    {/* {restoreName[0].gender === 'FEMALE' &&
                    <span style={{ 'font-size': '14px', color: '#03C46B' }}>女学生</span>}
                    {restoreName[0].gender === 'MALE' &&
                    <span style={{ 'font-size': '14px', color: '#03C46B' }}>男学生</span>} */}
                  </div>
                ) : null}
              </div>
            </div>
            {/* 近期删除学生 */}
            <div>
              <div style={{ paddingTop: '5px', color: '#888888', fontSize: '13px' }}>
                {formatMessage({ id: 'app.text.once.deleted', defaultMessage: '曾经删除' })}
              </div>
              {restoreName &&
                restoreName.map((obj, idx) => {
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        width: '100%',
                        borderBottom: '1px solid #E5E5E5',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <List
                          grid={{ gutter: 0, column: 2 }}
                          dataSource={obj.studentList}
                          renderItem={item => (
                            <List.Item>
                              <StudentAvatar
                                item={item}
                                selectItem={selectItem}
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

export default OnceDeletedModal;
