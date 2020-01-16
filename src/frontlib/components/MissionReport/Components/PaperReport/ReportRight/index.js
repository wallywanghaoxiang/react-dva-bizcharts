/*
 * @Author    tina.zhang
 * @Date      2019-3-5
 * @copyright 任务报告-答案详情
 * //! TODO 是否有权限查看学生报告答案解析权限
 * @param {boolean} V_ANSWER_ANALYSIS 是否有权限查看学生报告答案解析权限
 */
import React, { PureComponent } from 'react';
import { Card, Tabs, Button, Message, Select } from 'antd';
import './index.less';
import DetailPage from '../DetailPage';

class ReportRight extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      subScoreData: '',
    };
  }
  componentDidMount() {}

  postSubData(data) {
    this.setState({
      subScoreData: data,
    });
  }
  render() {
    const { paperData, showData,V_ANSWER_ANALYSIS } = this.props;
    // console.log("paperData",paperData)
    // console.log("showData",showData)
    // console.log("this.props.taskId",this.props.taskId)
    // console.log("this.props.paperId",this.props.paperId)
    // console.log("this.props.classId",this.props.classId)
    return (
      <div className="reportRight">
        <DetailPage
          paperData={paperData}
          subScoreData={this.state.subScoreData}
          showData={showData}
          classNum = {this.props.classNum}
          self={this}
          teacherPaperInfo={this.props.teacherPaperInfo}
          role={this.props.role}
          taskId={this.props.taskId}
          paperId={this.props.paperId}
          classId={this.props.classId}
          exercise={this.props.exercise}//练习模式
          V_ANSWER_ANALYSIS={V_ANSWER_ANALYSIS}
        />
      </div>
    );
  }
}
export default ReportRight;
