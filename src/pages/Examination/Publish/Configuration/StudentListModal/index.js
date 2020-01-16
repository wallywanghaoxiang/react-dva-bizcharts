import React, { Component } from 'react';
import { Modal, List, Radio, Checkbox, message } from 'antd';
import IconTips from '@/components/IconTips';
import { formatMessage } from 'umi/locale';
import './index.less';

const RadioGroup = Radio.Group;

class StudentListModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: props.visible,
      students: [],
    };
  }

  componentDidMount() {
    const { students } = this.props;
    this.setState({ students: JSON.parse(JSON.stringify(students)) });
  }

  onHandleCancel = () => {
    this.props.onClose();
  };

  onHandleOK = () => {
    this.props.update(true, this.state.students);
    this.props.onClose();
  };

  StudentData = item => {
    if (item.status) {
      if (item.status == 'Y') {
        item.status = 'N';
      } else {
        item.status = 'Y';
      }
    } else {
      item.status = 'N';
    }
    console.log(this.state.students);

    let newList = JSON.parse(JSON.stringify(this.state.students));
    this.setState({ students: newList });
  };

  render() {
    return (
      <Modal
        visible={this.props.visible}
        centered={true}
        title={this.props.classTitle}
        closable={false}
        cancelText={formatMessage({ id: 'app.cancel', defaultMessage: '取消' })}
        okText={formatMessage({ id: 'app.confirm', defaultMessage: '确定' })}
        onCancel={this.onHandleCancel}
        destroyOnClose={true}
        onOk={this.onHandleOK}
        className="TestStudentModal"
        footer={
          <div className="infoTips ant-modal-footer">
            <div>
              <IconTips text="" iconName="icon-info" />
              {formatMessage({
                id: 'app.text.exam.publish.selected.studengt.tip',
                defaultMessage: '点击学生姓名可取消选择',
              })}
            </div>
            <div>
              <button type="button" class="ant-btn" onClick={this.onHandleCancel}>
                <span>{formatMessage({ id: 'app.cancel', defaultMessage: '取消' })}</span>
              </button>
              <button type="button" class="ant-btn ant-btn-primary" onClick={this.onHandleOK}>
                <span>{formatMessage({ id: 'app.confirm', defaultMessage: '确定' })}</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="infoTips" style={{ paddingTop: '0px' }}></div>
        <List
          grid={{
            gutter: 16,
            xs: 4,
            sm: 4,
            md: 4,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          className="StudentSetList"
          dataSource={this.state.students}
          renderItem={(item, index) => (
            <List.Item>
              <div
                className={item.status === 'N' ? 'item underLine' : 'item'}
                onClick={e => {
                  this.StudentData(item);
                }}
              >
                <div>{item.studentClassCode}</div>
                <div className="studentName">{item.studentName}</div>
                {/* {item.gender === "FEMALE"? <i className="iconfont icon-sex-lady lady"/> : <i className="iconfont icon-sex-man sexman"/>} */}
                {item.isTransient === 'Y' ? (
                  <span className="isTransienttag">
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.student.borrowing.status',
                      defaultMessage: '借读',
                    })}
                  </span>
                ) : null}
              </div>
            </List.Item>
          )}
        />
      </Modal>
    );
  }
}
export default StudentListModal;
