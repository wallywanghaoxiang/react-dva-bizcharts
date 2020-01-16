import React, { Component } from 'react';
import './index.less';
import {Select} from 'antd';
import NormalControl from './Controls/NormalControl';

/**
 * 跟读模仿插件
 * 试卷结构中添加题型弹窗
 * @author tina.zhang
 */
class CopyReadPlugin extends Component {
  constructor(props) {
    super(props);
    this.state={
      total:"",
      questionNum:"",
      listenTime:"",
      reading:"",
      follow:"",
      redio:0.5,
    }
  }

  componentWillMount(){
    const { dataSource } = this.props;
    let markvalue=0.5;
    if(dataSource.questionData){
      if(dataSource.questionData.mainPatterns.precision) {
        markvalue=dataSource.questionData.mainPatterns.precision;
      }else{
        dataSource.questionData.mainPatterns.precision=0.5;
        const ratio = 1;
        dataSource.questionData.mainPatterns.markRatio = ratio;
      }
    }else{
      // if(!question_json.mainPatterns.markRatio){
      //   question_json.mainPatterns.markRatio ="1";
      // }
    }
    this.setState({
      redio:markvalue
    })
  }

  handleChange=(e)=>{
    const {callback} = this.props;
    this.setState({
      redio:e
    })
    callback(Number(e),"precision");
  }
  
  render() {
    const { callback,form,marklist,dataSource,blur } = this.props;
    const {redio}  =this.state;
    console.log(dataSource);
    return (
      <div>
        <div className="custom-control">
            <NormalControl
                form={form}
                title_before={"总分"}
                labelName={"fullMark"}
                message={"请输入总分!"}
                dataSource = {dataSource.questionData}
                callback={
                  (e,labelName)=>{
                    callback(e,labelName);
                  }
                }
            />
        </div>
        <div className="custom-control" style={{display:"flex"}}>

            <NormalControl
                form={form}
                title_before={"共"}
                title_after={"题"}
                labelName={"questionCount"}
                message={"请输入题数!"}
                dataSource = {dataSource.questionData}
                callback={
                  (e,labelName)=>{
                    callback(e,labelName);
                    blur(e,labelName)
                  }
                }
                
            />

            <NormalControl
                form={form}
                title_before={"短文听"}
                title_after={"遍"}
                labelName={"subQuestionStemListening"}
                message={"请输入听题次数!"}
                dataSource = {dataSource.questionData}
                callback={
                  (e,labelName)=>{
                    callback(e,labelName);
                  }
                }

            />
           
           <NormalControl
                form={form}
                title_before={"每句读"}
                title_after={"遍"}
                labelName={"subQuestionReadTime"}
                message={"请输入读题次数!"}
                dataSource = {dataSource.questionData}
                callback={
                  (e,labelName)=>{
                    callback(e,labelName);
                  }
                }
            />
            
            <NormalControl
                form={form}
                title_before={"跟读时间"}
                title_after={"秒"}
                labelName={"answerTime"}
                message={"请输入跟读时间!"}
                dataSource = {dataSource.questionData}
                callback={
                  (e,labelName)=>{
                    callback(e,labelName);
                  }
                }
            />
        </div>


        <div className="custom-control">
            <span className="title">{"评分精度:"}</span>
          <Select className="markRatio" value={String(redio)} style={{ width: 120 }} onChange={this.handleChange}>
          {marklist.map((Item,index)=>{
            return(
              <Select.Option value={Item.code}>{Item.value}</Select.Option>
            )
          })}
          </Select>
        </div>
      </div>
    );
  }
}

export default CopyReadPlugin;
