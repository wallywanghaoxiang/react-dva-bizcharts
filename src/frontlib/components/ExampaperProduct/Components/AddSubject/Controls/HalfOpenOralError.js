/**
 * @Author    tina
 * @DateTime  2018-10-19
 * @copyright 口语半开放题答案配置控件
 */
import React, { Component } from 'react';
import { Input,Tabs,Form,message} from 'antd';
import TextareaClearData from './TextareaClearData';
import './index.less';
import IconButton from '../../../../IconButton';
import AddMoreAnswer from '../AddMoreAnswer/api';
const FormItem = Form.Item;
const { TextArea } = Input;
const { TabPane } = Tabs;
import {regularBuilder} from '@/utils/utils';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  BatchAnswersEdit: {
    id: 'app.batch.answers.edit',
    defaultMessage: '批量设置答案',
  }, 
  SelectedAnswerTabDel: {
    id: 'app.selected.answer.tab.del',
    defaultMessage: '删除当前',
  },
  AnswerAddbtn: {
    id: 'app.answer.addbtn',
    defaultMessage: '添加',
  },
  inputModel: {
    id: 'app.is.input.model',
    defaultMessage: '请输入{index}'
  }, 
  TODO_tips: {
    id: 'app.batch.answers.count',
    defaultMessage: '答案已经不能再少了哦！',
  },
});
class HalfOpenOral extends Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    let referenceAnswerLabel =props.data.params.hintReferenceMachineEvaluationLabel?props.data.params.hintReferenceMachineEvaluationLabel:formatMessage({id:"app.text.hintReferenceMachineEvaluationLabel",defaultMessage:"提示答案机评参考"});
    let referenceMachineEvaluationLabel =props.data.params.errorReferenceMachineEvaluationLabel?props.data.params.errorReferenceMachineEvaluationLabel:formatMessage({id:"app.text.errorReferenceMachineEvaluationLabel",defaultMessage:"错误答案机评参考"});
    const panes = [
      { title: referenceAnswerLabel+'1', content: '', key: 'answer0' }     
    ];
    this.newTabIndex2 = 1;
    const panes2 = [
      { title: referenceMachineEvaluationLabel+'1', content: '', key: 'medice0' }     
    ];
    this.state = {
      visible: true,   
      referenceAnswer: [{key:'answer0',value:''}],
      resultAnswer:[],
      machineData:[],
      referenceMachineEvaluation:[{key:'medice0',value:''}],
      activeKey: panes[0].key,
      referenceAnswerLabelInfo:referenceAnswerLabel,
      referenceMachineEvaluationLabelInfo:referenceMachineEvaluationLabel,
      panes,
      activeKey2: panes2[0].key,
      panes2,
      answerType:props.data.name,//答题类型   
      
    };
  }
  //添加答案
addAnswer=()=>{
        const panes = this.state.panes;
        const activeKey = `answer${this.newTabIndex++}`;
        panes.push({ title: this.state.referenceAnswerLabelInfo+`${this.newTabIndex}`, content: '', key: activeKey });
        this.setState({ panes, activeKey });
        const arr = this.state.referenceAnswer;
        arr.push({key:activeKey,value:''})   
        console.log(panes)
        this.saveReferenceAnswerInfoData(arr)
        this.setState({
            referenceAnswer:arr,
        })
  }
  //删除答案
  remove = (targetKey) => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if(panes.length==0) {
      message.warning(formatMessage({id:"app.batch.answers.count",defaultMessage:"答案已经不能再少了哦！"}))
    } else {
      this.newTabIndex=this.newTabIndex-1;
      if (lastIndex >= 0 && activeKey === targetKey) {
        activeKey = panes[lastIndex].key;
      } else{
        activeKey = panes[0].key
      }
      const arr = this.state.referenceAnswer.filter(pane => pane.key !== targetKey); 
      console.log(arr)
      arr.map((item,index)=>{
        item.key='answer'+index
      })
      panes.map((item,index)=>{
        item.key='answer'+index;
        item.title=this.state.referenceAnswerLabelInfo+(index+1)
      })
      console.log(panes)
      this.saveReferenceAnswerInfoData(arr)
      this.setState({
          referenceAnswer:arr,
      })
      this.setState({ panes, activeKey:'answer0' });
    }
  }
//添加机评
addAnswer2=()=>{
        const panes2 = this.state.panes2;
        const activeKey2 = `medice${this.newTabIndex2++}`;
        panes2.push({ title: this.state.referenceMachineEvaluationLabelInfo+`${this.newTabIndex2}`, content: '', key: activeKey2 });
        this.setState({ panes2, activeKey2 });
        const arr = this.state.referenceMachineEvaluation;
        arr.push({key:activeKey2,value:''})   
        this.saveReferenceMachineEvaluationData(arr)
        this.setState({
            referenceMachineEvaluation:arr,
        })
  }
  //删除机评
  remove2 = (targetKey) => {
    let activeKey2 = this.state.activeKey2;   
    let lastIndex;
    this.state.panes2.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes2 = this.state.panes2.filter(pane => pane.key !== targetKey);
    if(panes2.length==0) {
      message.warning(formatMessage({id:"app.batch.answers.count",defaultMessage:"答案已经不能再少了哦！"}))
    } else {
      this.newTabIndex2=this.newTabIndex2-1;
      if (lastIndex >= 0 && activeKey2 === targetKey) {
        activeKey2 = panes2[lastIndex].key;
      } else {
        activeKey2 = panes2[0].key;
      }
      const arr = this.state.referenceMachineEvaluation.filter(pane => pane.key !== targetKey); 
      arr.map((item,index)=>{
        item.key='medice'+index
      })
      panes2.map((item,index)=>{
        item.key='medice'+index;
        item.title=this.state.referenceMachineEvaluationLabelInfo+(index+1)
      })
      console.log(activeKey2)
      this.saveReferenceMachineEvaluationData(arr)
      this.setState({
          referenceMachineEvaluation:arr,
      })
      this.setState({ panes2, activeKey2:'medice0' });
    } 
  }
  componentWillMount() {
    const{data,showData,subIndex,index2,patternType} = this.props;    
     //渲染数据
     const editData = showData&&showData.data    
      if(editData&&editData.patternType=="NORMAL"&&editData.mainQuestion.halfOpenOralQuestionAnswerInfo!=null) {
         const reference = [];
         const referenceAnswers=[];
         if(editData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.length>0) {
            editData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.map((item,index)=>{
            if(index!=0) {
              this.newTabIndex++
            }
              const counts = index+1
              reference.push( { title:this.state.referenceAnswerLabelInfo+counts, content: item, key: 'answer'+index } )
              referenceAnswers.push({key:'answer'+index,value:item})   
            })
            this.setState({
              panes:reference,
              referenceAnswer:referenceAnswers,
              resultAnswer:editData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,              
            })
         }    
        const referenceMachine = [];
        const referenceMachineAnswers=[];
        if(editData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.length>0) {
        editData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.map((item,index)=>{
              if(index!=0) {
                this.newTabIndex2++
              }
              const counts = index+1
              referenceMachine.push({ title:this.state.referenceMachineEvaluationLabelInfo+counts, content: item, key: 'medice'+index })
              referenceMachineAnswers.push({key:'medice'+index,value:item})   
            })
          this.setState({
            panes2:referenceMachine,
            referenceMachineEvaluation:referenceMachineAnswers,
            machineData:editData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,            
          })
        }
        //this.props.saveReferenceAnswerInfo(editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer,editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
      }
     if(editData&&editData.patternType=="TWO_LEVEL"&&editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo!=null) {
      const reference = []
      const referenceAnswers=[];
      if(editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.length>0) {
          editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.map((item,index)=>{
          if(index!=0) {
          this.newTabIndex++
          }
          const counts = index+1
          reference.push( { title:this.state.referenceAnswerLabelInfo+counts, content: item, key: 'answer'+index } )
          referenceAnswers.push({key:'answer'+index,value:item})   
        })
           this.setState({
              panes:reference,
              referenceAnswer:referenceAnswers,
              resultAnswer:editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,              
            })
      }
    
      const referenceMachine = []
      const referenceMachineAnswers=[];
      if(editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.length>0) {
          editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.map((item,index)=>{
              if(index!=0) {
                this.newTabIndex2++
              }
              const counts = index+1
              referenceMachine.push({ title:this.state.referenceMachineEvaluationLabelInfo+counts, content: item, key: 'medice'+index })
              referenceMachineAnswers.push({key:'medice'+index,value:item})   
            })
             this.setState({
            panes2:referenceMachine,
            referenceMachineEvaluation:referenceMachineAnswers,
            machineData:editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,            
          })
      }
      //this.props.saveReferenceAnswerInfo(editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer,editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
      } else if(editData&&editData.patternType=="COMPLEX") {        
       if(editData.groups[index2].data.patternType=="TWO_LEVEL"&&editData.groups[index2].data.subQuestion[subIndex]&&editData.groups[index2].data.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo!=null) {
         const childData =editData.groups[index2].data;
          const reference = []
          const referenceAnswers=[];
          if(childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.length>0) {
            childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.map((item,index)=>{
              if(index!=0) {
                this.newTabIndex++
              }
                const counts = index+1
                reference.push( { title:this.state.referenceAnswerLabelInfo+counts, content: item, key: 'answer'+index } )
                referenceAnswers.push({key:'answer'+index,value:item})   
              })
              this.setState({
              panes:reference,
              referenceAnswer:referenceAnswers,
              resultAnswer:childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,              
            })
          }
       
          const referenceMachine = []
          const referenceMachineAnswers=[];
          if(childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.length>0) {
            childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.map((item,index)=>{
            if(index!=0) {
              this.newTabIndex2++
            }
              const counts = index+1
              referenceMachine.push({ title:this.state.referenceMachineEvaluationLabelInfo+counts, content: item, key: 'medice'+index })
              referenceMachineAnswers.push({key:'medice'+index,value:item})  
            })
             this.setState({
            panes2:referenceMachine,
            referenceMachineEvaluation:referenceMachineAnswers,
            machineData:childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,            
          })
          }
      //this.props.saveReferenceAnswerInfo(childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer,childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
        
       } else if(editData.groups[index2].data.patternType=="NORMAL"&&editData.groups[index2].data.mainQuestion.halfOpenOralQuestionAnswerInfo!=null) {
         const childData =editData.groups[index2].data;
        const reference = []
        const referenceAnswers=[];
        if(childData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.length>0) {
          childData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation.map((item,index)=>{
          const counts = index+1
          reference.push( { title:this.state.referenceAnswerLabelInfo+counts, content: item, key: 'answer'+index } )
          referenceAnswers.push({key:'answer'+index,value:item})   
          })
          this.setState({
                panes:reference,
                referenceAnswer:referenceAnswers,
                resultAnswer:childData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,                
              })
        }      
        const referenceMachine = []
        const referenceMachineAnswers=[];
        if(childData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.length>0){
               childData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation.map((item,index)=>{
              if(index!=0) {
                this.newTabIndex2++
              }
                  const counts = index+1
              referenceMachine.push({ title:this.state.referenceMachineEvaluationLabelInfo+counts, content: item, key: 'medice'+index })
              referenceMachineAnswers.push({key:'medice'+index,value:item}) 
        
          })
               this.setState({
            panes2:referenceMachine,
            referenceMachineEvaluation:referenceMachineAnswers,
            machineData:childData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,            
          })
        }
     //this.props.saveReferenceAnswerInfo(childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer,childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
     }
  }
  }
  compareData = (x, y) =>{//比较函数
    if (x < y) {
        return -1;
    } else if (x > y) {
        return 1;
    } else {
        return 0;
    }
}

  //保存参考答案数组数据
  saveReferenceAnswerInfoData=(arr)=>{
      const { subIndex,patternType,index2 } = this.props;  
      const arrayList =arr.sort(this.compareData);
      const answerData=[];
      arrayList.map((item)=>{
          if(item.value){
            answerData.push(item.value)
          }
      })
      this.setState({
          resultAnswer:answerData
      })
      console.log(answerData)
      this.props.saveReferenceAnswerInfo(answerData,this.state.machineData,subIndex,patternType,this.state.answerType,index2)
  }
  //保存机评数组数据
  saveReferenceMachineEvaluationData=(arr)=>{
      const { subIndex,patternType,index2 } = this.props;  
      const arrayList =arr.sort(this.compareData);
      const answerData=[];
      arrayList.map((item)=>{
          if(item.value){
            answerData.push(item.value)
          }
      })
      this.setState({
          machineData:answerData
      })
      this.props.saveReferenceAnswerInfo(this.state.resultAnswer,answerData,subIndex,patternType,this.state.answerType,index2)
  }
  saveReferenceAnswer=(value,key)=>{
      if(value === ""){
        this.props.saveClearTrueError(true)
      }
      const arr = this.state.referenceAnswer;
      arr.map((item,index)=>{
          if(item.key==key) {
            item.value=value
          }
      })    
      const reference = []
        arr.map((item,index)=>{
          const counts = index+1
          reference.push( { title:this.state.referenceAnswerLabelInfo+counts, content: item.value, key: item.key } )
        })
        console.log(arr)
      this.setState({
         panes:reference,
        referenceAnswer:arr,
      })   
      this.saveReferenceAnswerInfoData(arr)
  }
  saveReferenceMachineEvaluation=(value,key)=>{
    if(value === ""){
      this.props.saveClearTrueError(true)
    }
    const { subIndex,patternType } = this.props;   
    const arr = this.state.referenceMachineEvaluation;
      arr.map((item,index)=>{
          if(item.key==key) {
            item.value=value
          }
      }) 
     const referenceMachine = []
      arr.map((item,index)=>{
            const counts = index+1
        referenceMachine.push({ title:this.state.referenceMachineEvaluationLabelInfo+counts, content: item.value, key: item.key })
      })
      this.setState({
        panes2:referenceMachine,
        referenceMachineEvaluation:arr,
      })
  
       this.saveReferenceMachineEvaluationData(arr)
}
    //标签切换
    onChange = (activeKey) => {
        this.setState({ activeKey });
    }
    onChange2 = (activeKey) => {
        this.setState({ activeKey2:activeKey });
    }
    //批量设置答案
    addMoreReferenceAnswer = ()=>{
      const { form } = this.props;
      form.resetFields() 
      let {referenceAnswerLabelInfo} = this.state;
      let panes = [];
      let referenceAnswer = [];
      let that = this;
      const countAnswer = panes.length;
      AddMoreAnswer({
        dataSource: {
          title:formatMessage(messages.BatchAnswersEdit)         
        },
        callback: answersInfo => {          
         if(answersInfo) {
          this.newTabIndex = 1;
           that.setState({ activeKey:'answer0' });
           const answerArray = answersInfo.split('|');
           answerArray.map((item,index)=>{
             const counts = index
             if(index!=0) {
              this.newTabIndex++
            }
             let num = counts+1            
              panes.push({ title: referenceAnswerLabelInfo+num, content: regularBuilder(item), key: 'answer'+counts }    )
              referenceAnswer.push({key:'answer'+counts,value:regularBuilder(item)})
             
           })        
           this.saveReferenceAnswerInfoData(referenceAnswer)
           this.setState(
             {
               panes:panes,
               referenceAnswer:referenceAnswer,
             }
           )
         }
        },
      });      
    }
    //机评批量设置答案
    addMoreReferenceAnswer2 = ()=>{
      const { form } = this.props;
      form.resetFields() 
      let {referenceMachineEvaluationLabelInfo} = this.state;
      let panes2 = [];
      let referenceMachineEvaluation = []
      let that = this;
      const countAnswer = panes2.length;
      AddMoreAnswer({
        dataSource: {
          title:formatMessage(messages.BatchAnswersEdit)       
        },
        callback: answersInfo => {
          if(answersInfo) {
            this.newTabIndex2 = 1;
            that.setState({ activeKey2:'medice0' });
            const answerArray = answersInfo.split('|');
            answerArray.map((item,index)=>{
                const counts = index+countAnswer
                if(index!=0) {
                  this.newTabIndex2++
                }
                let num = counts+1
                panes2.push({ title: referenceMachineEvaluationLabelInfo+num, content: regularBuilder(item), key: 'medice'+counts }    )
                referenceMachineEvaluation.push({key:'medice'+counts,value:regularBuilder(item)})
                            
            })        
            this.saveReferenceMachineEvaluationData(referenceMachineEvaluation)
            this.setState(
              {
                panes2:panes2,
                referenceMachineEvaluation:referenceMachineEvaluation,
              }
            )
          }
        },
      });      
    }

  render() {
    const { index2,subIndex,form,data } = this.props; 
    const {params:{errorReferenceMachineEvaluation,hintReferenceMachineEvaluation}} = data
    const { getFieldDecorator } = form;
    return (
        <div className="demon">
        {errorReferenceMachineEvaluation==='Y'&&<div>
            <h1>
            {this.state.referenceAnswerLabelInfo}        
            </h1>
            <Tabs  hideAdd
                type="card"
                animated={false}
                onChange={this.onChange}
                className="answerDetail"
                activeKey={this.state.activeKey}>
                {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
                <FormItem label={''}>
                    {getFieldDecorator('halfOpenOralQuestionAnswerInfoError'+pane.key+index2+subIndex, {
                    initialValue: pane.content,
                    rules: [{ required:false, message: <FormattedMessage values={{index:pane.title}} {...messages.inputModel} ></FormattedMessage> }],
                    })(
                    <TextareaClearData initvalue={pane.content} 
                    saveClear={(value)=>this.props.saveClearTrueError(value)}
                    onChange={(value,key)=>this.saveReferenceAnswer(value,pane.key)} textlabel={pane.title} autocleaning="true"/> 
                    )}
                </FormItem>           
                </TabPane>)}             
            </Tabs>
            <div className="operAnswer">
                <IconButton text={formatMessage(messages.BatchAnswersEdit) } iconName="icon-add" type="button" className="answerAddMore" onClick={this.addMoreReferenceAnswer}/>
                <IconButton text={formatMessage(messages.AnswerAddbtn)}  iconName="icon-add" type="button" className="answerAdd" onClick={this.addAnswer}/>
            
                <IconButton text={formatMessage(messages.SelectedAnswerTabDel)} iconName="icon-detele" type="button" className="answerDelete" onClick={(targetKey)=>this.remove(this.state.activeKey)}/>
            </div> 
            </div> } 
        {hintReferenceMachineEvaluation==='Y'&&<div><h1>
            {this.state.referenceMachineEvaluationLabelInfo}        
            </h1>     
            <Tabs  hideAdd
                type="card"
                animated={false}
                className="answerDetail"
                onChange={this.onChange2}
                activeKey={this.state.activeKey2}>
                {this.state.panes2.map(pane => <TabPane tab={pane.title} key={pane.key}>
                <FormItem label={''}>
                    {getFieldDecorator('halfOpenOralQuestionAnswerInfoError'+pane.key+index2+subIndex, {
                    initialValue: pane.content,
                    rules: [{ required:false, message:<FormattedMessage values={{index:pane.title}} {...messages.inputModel} ></FormattedMessage>}],
                    })(
                    <TextareaClearData initvalue={pane.content} 
                    saveClear={(value)=>this.props.saveClearTrueError(value)}
                    onChange={(value,key)=>this.saveReferenceMachineEvaluation(value,pane.key)} textlabel={pane.title} autocleaning="true"/> 
                    )}
                </FormItem>           
                </TabPane>)}             
            </Tabs>
            <div className="operAnswer">
                <IconButton text={formatMessage(messages.BatchAnswersEdit) } iconName="icon-add" type="button" className="answerAddMore" onClick={this.addMoreReferenceAnswer2}/>
                <IconButton text={formatMessage(messages.AnswerAddbtn)}  iconName="icon-add" type="button" className="answerAdd" onClick={this.addAnswer2}/>
                
                <IconButton text={formatMessage(messages.SelectedAnswerTabDel)} iconName="icon-detele" type="button" className="answerDelete" onClick={(targetKey)=>this.remove2(this.state.activeKey2)}/>
            </div>  
          </div> }      
      </div>
    );
  }
}

export default HalfOpenOral;
