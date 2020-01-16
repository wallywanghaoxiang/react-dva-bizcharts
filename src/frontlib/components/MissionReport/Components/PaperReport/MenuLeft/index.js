/*
 * @Author    tina.zhang
 * @Date      2019-3-5
 * @copyright 任务报告-答案详情
 */
import React, { PureComponent } from 'react';
import { message, Input } from 'antd';
import DotTag from '@/frontlib/components/ExampaperProduct/Components/DotTag';
import { toChinesNum } from '@/frontlib/utils/utils';
import './index.less';


class MenuLeft extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rate: 0.6
    }
  }

  componentDidMount() { }

  onClick = (item, mainIndex, questionIndex, type, linkid) => {
    const { self } = this.props;
    self.changeFocusIndex(item, mainIndex, questionIndex, type, linkid);
  }

  changeRate = (e) => {
    if (e.target.value >= 0 && e.target.value <= 100) {
      this.setState({
        rate: (e.target.value === "" ? 0.6 : (e.target.value / 100)).toFixed(2) // 当输入为空时，默认是0.6
      })
    } else {
      message.warn("请输入正确的得分率！(如20、50)")
    }
    // console.log(e.target.value);
    // this.props.changeRate(e.target.value);
  }

  renderDotTag = (item, index) => {
    const { masterData } = this.props;
    const { questions } = item;
    const { rate } = this.state;
    const jsx = [];
    if (item.type !== 'SPLITTER' && item.type !== 'RECALL') {
      Object.keys(questions).forEach(i => {
        if (questions[i].pageSplit === 'Y') {
          jsx.push(
            <DotTag
              status={questions[i].status}
              arr={questions[i].subs}
              rate={questions[i].rate}
              setRate={rate}
              className="marginLeft"
              data={questions[i]}
              href={`link${String(index)}${String(i)}`}
              questionType={item.type}
              mainIndex={item.index}
              focusIndex={masterData.staticIndex}
              index={this}
              key={`DotTag_${i}`}
            />
          );
          jsx.push(
            <div key={`div${i}`} style={{ width: '163px', height: '1px', background: '#ccc', margin: '5px 0px' }} />
          );
        } else {
          jsx.push(
            <DotTag
              status={questions[i].status}
              arr={questions[i].subs}
              rate={questions[i].rate}
              setRate={rate}
              href={`link${String(index)}${String(i)}`}
              className="marginLeft"
              data={questions[i]}
              questionType={item.type}
              mainIndex={item.index}
              focusIndex={masterData.staticIndex}
              index={this}
              key={`DotTag_${i}`}
            />
          );
        }
      })
      return (
        <div>
          {jsx}
        </div>
      );
    } if (item.type === 'SPLITTER') {
      return (
        <div className="flex">
          <DotTag
            status={questions[0].status}
            arr={['i']}
            data={questions[0]}
            questionType={item.type}
            mainIndex={item.index}
            focusIndex={masterData.staticIndex}
            index={this}
            key={`DotTags_${0}`}
          />
        </div>
      );
    }
    return "";
  }

  /**
   * 渲染题序
   * @Author   tina.zhang
   * @DateTime 2018-12-27T17:33:26+0800
   * @param    {[type]}                 index [description]
   * @param    {[type]}                 label [description]
   * @return   {[type]}                       [description]
   */
  renderLabel = (index, label) => {
    const { masterData } = this.props;
    if (masterData.mains[index].newLabel) {
      return masterData.mains[index].newLabel;
    }
    if (masterData.mains[index].type === 'SPLITTER' || masterData.mains[index].type === 'RECALL') {
      this.index = this.index + 1;
      return "";
    }
    return `${toChinesNum(Number(index) + 1)}、${label}`;
  }


  renderContent = () => {
    const { masterData } = this.props;
    return (
      <div className="left-content_missionReport">
        {masterData.mains.map((item, index) => {
          const i = index
          return (
            <div key={`mains_${i}`}>
              <div
                className="title marginTop20-dot"
              >
                {this.renderLabel(index, item.label)}
              </div>
              {this.renderDotTag(item, index)}
            </div>
          );
        })}
      </div>
    );
  }



  // 回调，切换试卷
  onSelectPaper = (snapshotId) => {
    const { callback } = this.props;
    if (callback) {
      callback(snapshotId);
    }
  }


  render() {
    const { paperData } = this.props;
    // console.log('paperData');
    // console.log(paperData);
    return (
      <div className="menuLeft_missionReport">
        {Object.keys(paperData).length !== 0 && this.renderContent()}
        <div className="inputRate">
          {'红色标注得分率<='}
          <Input placeholder="60" className="scoreRate" onBlur={this.changeRate} />
          {'%的题'}
        </div>
      </div>
    );
  }
}
export default MenuLeft;
