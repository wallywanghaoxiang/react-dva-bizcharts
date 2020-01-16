/*
 * @Author    tina.zhang
 * @Date      2019-3-5
 * @copyright 任务报告-答案详情
 */
import React, { PureComponent } from 'react';
import './index.less';
import DetailPage from '../DetailPage';


class ReportRight extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      subScoreData: '',
    };
  }

  componentDidMount() { }

  postSubData(data) {
    this.setState({
      subScoreData: data,
    });
  }

  render() {
    const { paperData, showData, classNum,teacherPaperInfo,role,taskId,paperId,classId,exercise} = this.props;
    const {subScoreData}=this.state;

    // console.log("paperData",paperData)
    // console.log("showData",showData)
    // console.log("this.props.taskId",this.props.taskId)
    // console.log("this.props.paperId",this.props.paperId)
    // console.log("this.props.classId",this.props.classId)
    return (
      <div className="reportRight">
        <DetailPage
          paperData={paperData}
          subScoreData={subScoreData}
          showData={showData}
          classNum={classNum}
          self={this}
          teacherPaperInfo={teacherPaperInfo}
          role={role}
          taskId={taskId}
          paperId={paperId}
          classId={classId}
          exercise={exercise} // 练习模式
        />
      </div>
    );
  }
}
export default ReportRight;
