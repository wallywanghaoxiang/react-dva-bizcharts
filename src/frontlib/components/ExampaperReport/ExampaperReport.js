import React, { PureComponent } from 'react';
import OverallPage from "./OverallPage"
import DetailPage from "./DetailPage"
import './index.less';



/**
 *整卷报告组件
 *
 * @author tina.zhang
 * @date 2018-12-18
 * @export
 * @class ExampaperReport
 * @extends {PureComponent}
 *  isFinish=="no" 表示练习中打开报告
 */
export default class ExampaperReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      paperData: {},//主控数据
      showData:{},//答题json数据
      subScoreData:"",
    };
  }

  componentDidMount() {
    const { paperData, showData, } = this.props;
    this.setState({
      paperData:paperData,
      showData:showData,
    })
  }
 

  postSubData(data){
    this.setState({
      subScoreData:data,
    })
}
  
  render() {
    
      return (
        <div className="ExampaperReport">
        <OverallPage paperData={this.props.paperData} allTime={this.props.allTime} self={this} eaxmTime={this.props.eaxmTime} isFinish={this.props.isFinish}/>
        <DetailPage paperData={this.props.paperData} subScoreData={this.state.subScoreData}  showData={this.props.showData} self={this}/>
        </div>
      );
    
  }
}
