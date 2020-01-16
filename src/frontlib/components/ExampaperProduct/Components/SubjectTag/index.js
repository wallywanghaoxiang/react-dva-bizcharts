import React, { Component } from 'react';
import { Modal,Input,Select } from 'antd';
const Option = Select.Option;
import './index.less';
import styles from './index.less';
import {queryDifficult,queryAbility,updateQuestionDifficult} from '@/services/api';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({
  questionTag: {
    id: 'app.check.question.tag.dialog.title',
    defaultMessage: '题目标签',
  },
  facilityValue: {
    id: 'app.question.facility.value',
    defaultMessage: '难易度',
  },
  abilityValue: {
    id: 'app.testing.ability',
    defaultMessage: '考察能力',
  },
  saveBtn:{id:'app.save',defaultMessage:'保存'},
  cancelBtn:{id:'app.cancel',defaultMessage:'取消'},
  closeBtnTit:{id:'app.close.btn',defaultMessage:"关闭"}

});
/**
 * 题目标签

 */
class SubjectTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      evaluationEngineType:[],
      defaultEvaluationEngine:'',
      abilityData:[],
      defaultAbility:''
    };
  }

  componentDidMount(){
    const {dataSource} = this.props;
    if(dataSource.status!='SHOW') {
        //获取考察能力
    queryAbility().then((res)=> {
      if (res.responseCode == '200') {
        this.setState({
          abilityData:res.data,
          defaultAbility:res.data[0].code
        }) 
        }
      }).catch(err => {
    }); 
      //获取难易度
      queryDifficult().then((res)=> {
        if (res.responseCode == '200') {
          this.setState({
            evaluationEngineType:res.data,
            defaultEvaluationEngine:res.data[0].code
          }) 
          }
        }).catch(err => {
      }); 
    }   
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
 
    const { dataSource } = this.props;
    if(dataSource.status!='SHOW') {
      const params={
        "paperId":dataSource.paperID,
        "checkAbility":this.state.defaultAbility,
        "questionId":dataSource.questionId,
        "difficultLevel": this.state.defaultEvaluationEngine,
      }
      updateQuestionDifficult(params).then((res)=> {
        if(res.responseCode==200) {
          this.setState({
            visible: false,
          });
          this.props.callback();      
          this.props.onClose();
        } else {
          message.warning(formatMessage({id:"app.text.tjbqsb",defaultMessage:"添加标签失败！"}))
        }     
      }).catch(err => {
        console.log(err);
      });
    }

    this.setState({
      visible: false,
    });

    
    this.props.onClose();
    
  };
  handleChange=(value)=>{
    this.setState({
      defaultEvaluationEngine:value
    })
  }
  defaultAbilityChange=(value)=>{
    this.setState({
      defaultAbility:value
    })
  }
  
  render() {  
    const { evaluationEngineType,abilityData} = this.state;
    const { dataSource } = this.props;
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title= {formatMessage(messages.questionTag)}    
        maskClosable={false}
        closable={false}
        cancelText={formatMessage(messages.cancelBtn)}
        okText={dataSource.status=='SHOW'?formatMessage(messages.closeBtnTit):formatMessage(messages.saveBtn)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={dataSource.status=='SHOW'?'PaperTagModal':'PaperTagEdit'}
        destroyOnClose={true}
      >
        <div className={styles.validateResult}>
        {dataSource.type=='NORMAL'&&<div><h1>{formatMessage(messages.abilityValue)}  </h1>
        {dataSource.status=='SHOW'&&<Input  className={styles.changeStatusNo}  value={dataSource.checkAbilityValue} disabled={true} readOnly/>}
        {dataSource.status!='SHOW'&&abilityData.length>0&&<Select 
          className={styles.changeStatus}
          onChange={this.defaultAbilityChange}
          value={this.state.defaultAbility?this.state.defaultAbility:abilityData[0].code}
        >
          {abilityData.map((item)=>{
            return <Option value={item.code} key={item.code}>{item.value}</Option>
          })}         
        </Select>}</div>}
        <h1>{formatMessage(messages.facilityValue)} </h1>
        {dataSource.status=='SHOW'&&<Input  className={styles.changeStatusNo}  value={dataSource.difficultLevelValue} disabled={true} readOnly/>}
       {dataSource.status!='SHOW'&&evaluationEngineType.length>0&&<Select 
          className={styles.changeStatus}
          onChange={this.handleChange}
          value={this.state.defaultEvaluationEngine?this.state.defaultEvaluationEngine:evaluationEngineType[0].code}
        >
          {evaluationEngineType.map((item)=>{
            return <Option value={item.code} key={item.code}>{item.value}</Option>
          })}         
        </Select>}
        </div>
      </Modal>
    );
  }
}

export default SubjectTag;
