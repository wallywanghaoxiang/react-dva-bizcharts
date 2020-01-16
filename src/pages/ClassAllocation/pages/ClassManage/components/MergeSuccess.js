import React, { Component } from 'react';
import { Modal, List } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import StudentAvatar from './StudentAvatar';


// 国际化适配方式
const messages = defineMessages({
  deletedStuTipTit: { id: 'app.deleted.student.confirm.tip.merge', defaultMessage: '学生账号已合并完成，请检查以下学生的教学班，如教学班有变动，请通知教学班老师进行处理！' },
 
});

class MergeSuccess extends Component {



  handleOk = () => {
    const { hideModal } = this.props;   
    hideModal()
  };






  render() {
    const { visibleModal, restoreName } = this.props;
    console.log(restoreName)
    return (
      <Modal
        title=""
        okText={formatMessage({id:"app.confirm",defaultMessage:"确定"})}
        cancelText={formatMessage({id:"app.cancel",defaultMessage:"取消"})}
        visible={visibleModal}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        className="add-manager-modal mergeList"
        width="520px"
        closable={false}
        centered
        destroyOnClose
        maskClosable={false}
        afterClose={this.modalClose}
      >
        <div className="content">

          <div className="cont">
            <div style={{ padding: '10px 10px', background: '#FFF8E6', borderRadius: '5px', fontSize: '13px' }}>
              <div>
                <i className="iconfont icon-tip" style={{ color: '#FF6E4A', fontSize: '13px' }} />
                <span style={{ paddingLeft: '5px' }}>{formatMessage(messages.deletedStuTipTit)}</span>
              </div>           
            </div>
            {/* 合并成功的学生 */}
            <div>
              <List
                grid={{ gutter: 3, column: 3}}
                dataSource={restoreName.filter(vo=>(vo.mergeStudentId&&vo.mergeStudentId!==""))}
                renderItem={item => (
                  <List.Item>
                    <StudentAvatar
                      key={item.studentClassCode}
                      item={item}                    
                    />
                  </List.Item>                 
                )}
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default MergeSuccess;
