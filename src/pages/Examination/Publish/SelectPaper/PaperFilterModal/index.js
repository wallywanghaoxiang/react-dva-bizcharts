/* eslint-disable eqeqeq */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { Modal, List } from 'antd';
import './index.less';
import { formatMessage } from 'umi/locale';

class PaperFilterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      grade: props.dataSource.gradeCode,
      years: props.dataSource.yearCode,
      difficulty: props.dataSource.difficultyCode,
      address: props.dataSource.addressCode,
      examtype: props.dataSource.examtypeCode,
    };
  }

  gradeData = name => {
    this.setState({
      grade: name,
    });
  };

  typeData = name => {
    this.setState({
      examtype: name,
    });
  };

  yearsData = name => {
    this.setState({
      years: name,
    });
  };

  difficultyData = name => {
    this.setState({
      difficulty: name,
    });
  };

  addressData = name => {
    this.setState({
      address: name,
    });
  };

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };

  onHandleOK = () => {
    this.setState({
      visible: false,
    });
    this.props.callback(
      this.state.grade,
      this.state.years,
      this.state.difficulty,
      this.state.address,
      this.state.examtype
    );
    this.props.onClose();
  };

  render() {
    return (
      <Modal
        visible={this.state.visible}
        centered
        title={formatMessage({
          id: 'app.title.exam.publish.screen.paper',
          defaultMessage: '试卷筛选',
        })}
        closable={false}
        cancelText={formatMessage({ id: 'app.cancel', defaultMessage: '取消' })}
        okText={formatMessage({ id: 'app.confirm', defaultMessage: '确定' })}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className="PaperFilterModal"
      >
        <div className="labelList">
          <div className="filterLabel">
            {formatMessage({ id: 'app.campus.manage.basic.grade', defaultMessage: '年级' })}
          </div>
          <div className="gradeList">
            <List
              dataSource={this.props.dataSource.grade}
              renderItem={item => (
                <List.Item
                  className={item.grade == this.state.grade ? 'selected' : ''}
                  onClick={() => this.gradeData(item.grade)}
                >
                  <span>{item.gradeValue}</span>
                </List.Item>
              )}
            />
          </div>
          <div className="filterLabel">
            {formatMessage({ id: 'app.title.exam.publish.task.type', defaultMessage: '类型' })}
          </div>
          <div className="gradeList">
            <List
              dataSource={this.props.dataSource.type}
              renderItem={item => (
                <List.Item
                  className={item.code == this.state.examtype ? 'selected' : ''}
                  onClick={() => this.typeData(item.code)}
                >
                  <span>{item.value}</span>
                </List.Item>
              )}
            />
          </div>
          {/* <div className="filterLabel">
            {formatMessage({ id: 'app.text.year', defaultMessage: '年份' })}
          </div>
          <List
            className="yearsList"
            dataSource={this.props.dataSource.years}
            renderItem={item => (
              <List.Item
                className={item.code == this.state.years ? 'selected' : ''}
                onClick={() => this.yearsData(item.code)}
              >
                <span>{item.value}</span>
              </List.Item>
            )}
          /> */}
          <div className="filterLabel">
            {formatMessage({
              id: 'app.title.exam.publish.facility.value',
              defaultMessage: '难易度',
            })}
          </div>
          <List
            className="difficultyList"
            dataSource={this.props.dataSource.difficulty}
            renderItem={item => (
              <List.Item
                className={item.code == this.state.difficulty ? 'selected' : ''}
                onClick={() => this.difficultyData(item.code)}
              >
                <span>{item.value}</span>
              </List.Item>
            )}
          />
          <div className="filterLabel">
            {formatMessage({
              id: 'app.examination.inspect.task.detail.paper.template',
              defaultMessage: '试卷结构',
            })}
          </div>
          <List
            className="addressList"
            dataSource={this.props.dataSource.address}
            renderItem={item => (
              <List.Item
                className={item.paperTemplateId == this.state.address ? 'selected' : ''}
                onClick={() => this.addressData(item.paperTemplateId)}
              >
                <span>{item.templateName}</span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    );
  }
}
export default PaperFilterModal;
