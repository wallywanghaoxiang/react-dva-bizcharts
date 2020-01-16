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
});

class ImportDeleteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recoveryData: [], // 存储恢复的数据
    };
  }

  // 取消方法
  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  handleOk = () => {
    const { onOK } = this.props;
    const { recoveryData } = this.state;
    // console.log(recoveryData);
    // return;
    onOK(recoveryData);
  };

  modalClose = () => {
    this.setState({
      recoveryData: [],
    });
  };

  // 选择一个管理员
  selectManager = (obj, item, selected) => {
    const { recoveryData } = this.state;
    const originData = JSON.parse(JSON.stringify(recoveryData));

    // eslint-disable-next-line no-param-reassign
    obj.select = item;

    // 找出暂存数组中是否有已选择的item
    if (selected) {
      let idx = -1;
      originData.forEach((tag, i) => {
        if (tag.select.studentClassCode === item.studentClassCode) {
          // 已存储同一条数据
          idx = i;
        }
      });
      // 删除到原来已存储的
      if (idx > -1) {
        originData.splice(idx, 1);
      }
    }

    if (originData.length > 0) {
      const oldObj = originData.find(j => j.studentClassCode === obj.studentClassCode);
      if (oldObj) {
        // 已添加
        let oldItemIdx;
        originData.forEach((j, i) => {
          if (j.studentClassCode === oldObj.studentClassCode) {
            oldItemIdx = i;
          }
        });

        if (selected) {
          originData.splice(oldItemIdx, 1, obj);
        } else {
          originData.splice(oldItemIdx, 1);
        }
        this.setState({
          recoveryData: originData,
        });
      } else {
        // 未添加
        originData.push(obj);
        this.setState({
          recoveryData: originData,
        });
      }
    } else {
      originData.push(obj);
      this.setState({
        recoveryData: originData,
      });
    }
  };

  render() {
    const { visible, restoreName } = this.props;
    const { recoveryData } = this.state;
    // console.log(recoveryData);
    return (
      <Modal
        title=""
        okText="确定"
        cancelText="取消"
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
                  // 找到已选择的item
                  let selectObj;
                  const restoreObj = recoveryData.find(
                    i => i.studentClassCode === obj.studentClassCode
                  );
                  if (restoreObj) {
                    selectObj = restoreObj.select;
                  }
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
                                selectItem={selectObj}
                                onHandleSelectManager={selected =>
                                  this.selectManager(obj, item, selected)
                                }
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

export default ImportDeleteModal;
