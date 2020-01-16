/**
 * @Author    tina
 * @DateTime  2018-11-5
 * @copyright 题目标签
 */
import React, { Component } from 'react';
import { Select,Form } from 'antd';
import styles from './index.less';
const Option = Select.Option;
const FormItem = Form.Item;
import {queryDifficult,queryAbility} from '@/services/api';
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
});
class TagSubject extends Component {
  constructor(props) {
    super(props); 
    let checkAbilityValue = []
    if(props.showData) {
      props.showData.checkAbility.split(',').map((vo)=>{
        if(vo) {
          checkAbilityValue.push(vo)
        }
      })
    }
    this.state = {
      visible: true,
      evaluationEngineType:[],
      defaultEvaluationEngine:props.showData?props.showData.difficultLevel:'',
      abilityData:[],
      defaultAbility:checkAbilityValue
    };
  }

  handleChange=(value)=>{
    this.setState({
      defaultEvaluationEngine:value
    })
    this.props.saveDifficult(value)
  }
  defaultAbilityChange=(value)=>{
    this.setState({
      defaultAbility:value
    })
    let saveAbilityValue =''
    value.map((item)=>{
      saveAbilityValue+=item+','
    })
    this.props.saveAbility(saveAbilityValue)
  }
  componentDidMount() {   
    //获取难易度
    queryDifficult().then((res)=> {
        if (res.responseCode == '200') {
        //this.props.saveDifficult(res.data[0].code)
        this.setState({
            evaluationEngineType:res.data
                }) 
            }
            }).catch(err => {
        }); 
    const { categry } = this.props;
    if(categry=='NORMAL') {
        //获取考察能力
        queryAbility().then((res)=> {
            if (res.responseCode == '200') {
            //this.props.saveAbility(res.data[0].code)
            this.setState({
                abilityData:res.data
            }) 
            }
            }).catch(err => {
        });
        }     
  }

  render() {
    const { evaluationEngineType,key,abilityData,defaultAbility} = this.state;
    const { categry } = this.props;
    const children = [];
    let defaultAbilityValue = [];
    abilityData.map((item)=>{    
      children.push(<Option key={item.code} value={item.code}>{item.value}</Option>);
    })
    return (
      <div className="demon">
       <h1>
       {formatMessage(messages.questionTag)}        
        </h1>
      <div className="tagAdd">
      <h1>
      {formatMessage(messages.facilityValue)}              
            </h1>
            {evaluationEngineType.length>0&&                
              <Select 
              onChange={this.handleChange}
              placeholder={formatMessage({id:"app.placeholder.evaluationEngineType",defaultMessage:"请选择难易度"})}
              key={key}
              defaultValue={this.state.defaultEvaluationEngine}
              >
              {evaluationEngineType.map((item)=>{
                  return <Option value={item.code} key={item.code}>{item.value}</Option>
              })}         
              </Select>                
          }
        {categry=='NORMAL'&&<div><h1>
        {formatMessage(messages.abilityValue)}        
        </h1>       
        {abilityData.length>0&&
        <Select
            mode="tags"
            style={{ width: '100%' }}
            defaultValue={defaultAbility}
            onChange={this.defaultAbilityChange}
          >
            {children}
          </Select>       
        }           
          </div>}
        </div>
      </div>
    );
  }
}

export default TagSubject;
