/**
 * @Author    tina
 * @DateTime  2018-10-18
 * @copyright 评分引擎
 */
import React, { Component } from 'react';
import { Select } from 'antd';
import styles from './index.less';
const Option = Select.Option;
import {queryEvaluationEngine} from '@/services/api';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  AssessmentEngine: {
    id: 'app.assessment.engine',
    defaultMessage: '评分引擎',
  },
});
class EvaluationEngine extends Component {
  constructor(props) {
    super(props);
    const { subIndex,patternType } = this.props;  
    const{data,showData,index2} = this.props;  
    var evaluationEngineInfo={};  
    var defaultEvaluationEngine=''
    //渲染数据     
    const editData = showData&&showData.data 
    const mainIndex=index2=='all'?'1':index2;
    if(editData&&editData.patternType=="NORMAL"&&editData.mainQuestion.evaluationEngineInfo) {
      evaluationEngineInfo=editData.mainQuestion.evaluationEngineInfo
      defaultEvaluationEngine=editData.mainQuestion.evaluationEngineInfo.evaluationEngine 
    }
    else if(editData&&editData.patternType=="TWO_LEVEL"&&editData.subQuestion[subIndex].evaluationEngineInfo) {
      evaluationEngineInfo=editData.subQuestion[subIndex].evaluationEngineInfo
      defaultEvaluationEngine=editData.subQuestion[subIndex].evaluationEngineInfo.evaluationEngine
    }
    else  if(editData&&editData.patternType=="COMPLEX"&&editData.groups[mainIndex].data) {  
      if(editData.groups[mainIndex].data.patternType=="NORMAL"&&editData.groups[mainIndex].data.mainQuestion.evaluationEngineInfo!=null) { 
        evaluationEngineInfo=editData.groups[index2].data.mainQuestion.evaluationEngineInfo
        defaultEvaluationEngine=editData.groups[index2].data.mainQuestion.evaluationEngineInfo.evaluationEngine  
      }
      if(editData.groups[mainIndex].data.patternType=="TWO_LEVEL"&&editData.groups[mainIndex].data.subQuestion[subIndex].evaluationEngineInfo!=null) { 
        evaluationEngineInfo=editData.groups[index2].data.subQuestion[subIndex].evaluationEngineInfo
        defaultEvaluationEngine=editData.groups[index2].data.subQuestion[subIndex].evaluationEngineInfo.evaluationEngine   
                
      }     
      }
    this.state = {
      visible: true,
      evaluationEngineType:[],
      defaultEvaluationEngine:defaultEvaluationEngine?defaultEvaluationEngine:props.data.params.defaultEvaluationEngine,
      evaluationEngineInfo:defaultEvaluationEngine?evaluationEngineInfo: {
        "evaluationEngine":props.data.params.defaultEvaluationEngine,
        "fourDimensionEvaluationMode":props.data.params.fourDimensionEvaluationMode,
      } 
    };
  }

 handleChange=(value)=>{
  const { subIndex,patternType,data,index2 } = this.props;
    this.setState({
      defaultEvaluationEngine:value,
      evaluationEngineInfo:{
        "evaluationEngine":value,
        "fourDimensionEvaluationMode":data.params.fourDimensionEvaluationMode,
      }
    })
    this.props.saveEvaluationEngineInfo({
      "evaluationEngine":value,
      "fourDimensionEvaluationMode":data.params.fourDimensionEvaluationMode,
    },subIndex,patternType,index2)   
  }

  componentDidMount() { 
    const { subIndex,patternType,index2 } = this.props;     
    this.props.saveEvaluationEngineInfo(this.state.evaluationEngineInfo,subIndex,patternType,index2)
   //获取评分引擎
   queryEvaluationEngine().then((res)=> {
    if (res.responseCode == '200') {
      this.setState({
        evaluationEngineType:res.data
      }) 
      }
    }).catch(err => {
  });  
  }

  render() {
    const { evaluationEngineType,key} = this.state;
    const { data,subIndex,index2 } = this.props;
    return (
      <div className="demon">
        <h1>
        <span>*</span>{formatMessage(messages.AssessmentEngine)}      
        </h1>
        {evaluationEngineType.length>0&&<Select 
          onChange={this.handleChange}
          value={this.state.defaultEvaluationEngine?this.state.defaultEvaluationEngine:evaluationEngineType[0].code}
          key={subIndex+index2}
          disabled={data.params.evaluationEngineOptional=='N'?true:false}
        >
          {evaluationEngineType.map((item)=>{
            return <Option value={item.code} key={item.code}>{item.value}</Option>
          })}         
        </Select>}
      </div>
    );
  }
}

export default EvaluationEngine;
