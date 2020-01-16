/**
 * @Author    tina
 * @DateTime  2018-12-3
 * @copyright 口语开放题型、半开放题型，录入题目时，除了给出很多个机评参考外，还需要录入关键字和权重
 */
import React, { Component } from 'react';
import { Input, Tooltip,message,InputNumber,Form} from 'antd';
import { formatMessage,defineMessages} from 'umi/locale';
import IconButton from '../../../../IconButton';
import styles from './index.less';
import InputClearData from './InputClearData';

const messages = defineMessages({
    AssessmentKeyWords: {
    id: 'app.assessment.key.words',
    defaultMessage: '评分关键词',
  },
  InputAssessmentKeyWords: {
    id: 'app.binput.assessment.key.words',
    defaultMessage: '请输入评分关键词!',
  }, 
  ExcludeAssessmentKeyWords: {
    id: 'app.exclude.assessment.key.words',
    defaultMessage: '排除关键词',
  },
  AnswerAddbtn: {
    id: 'app.InputExcludeAssessmentKeyWords',
    defaultMessage: '请输入排除关键词!',
  },
  WeightInput: {
    id: 'app.weight.input',
    defaultMessage: '权重',
  },
  IsWeightInput: {
    id: 'app.is.weight.input',
    defaultMessage: '请输入权重！',
  },
  IsWeightInputRight: {
    id: 'app.is.weight.input.right',
    defaultMessage: '请输入大于0，小于100的数字！',
  },
  TODO_tips: {
    id: 'app.is.weight.input.right.add',
    defaultMessage: '增加评分关键词',
  },
  TODO_tips2: {
    id: 'app.is.weight.input.right.exlcude',
    defaultMessage: '增加排除关键词',
  },
  TODO_tips3: {
    id: 'app.is.weight.input.right.error',
    defaultMessage: '评分关键字或者排除关键字必须有一项哦！',
  },
});
const FormItem = Form.Item;
@Form.create()
class AddKeyWords extends Component {
  constructor(props) {
    super(props); 
    const arr =JSON.parse(JSON.stringify(props.keyWordList));
    arr.forEach((item,index)=>{
        const timeStart = new Date().getTime()
        arr[index].id = timeStart+index
    })
    this.state = {
      rateKey:arr
    };
  }


  componentDidMount() {   
  
  }

  addMoreRate=()=>{
      const {rateKey} = this.state;
      const rate = rateKey;
      const timeStart = new Date().getTime()+rate.length;
      rate.push({id:timeStart,text:'',weight:'',exclude:false})
      this.setState({
          rateKey:rate
      })
  }

  addMoreKey=()=>{
    const {rateKey} = this.state;  
    const timeStart = new Date().getTime()+rateKey.length;
    rateKey.push({id:timeStart,text:'',weight:'',exclude:true})
    this.setState({
        rateKey:rateKey
    })
  }

  saveRateKey=(e,id)=>{
    const {rateKey} = this.state;
    const {saveKeyWords} = this.props
    const rate = JSON.parse(JSON.stringify(rateKey));
    rate.map((item,index)=>{
        if(item.id===id) {
            rate[index].text=e
        }
    })
     this.setState({
        rateKey:rate
     })
     saveKeyWords(rate)
  }

  saveKey=(e,id)=>{
    const {saveKeyWords} = this.props
    const {rateKey} = this.state;
    const delKey = JSON.parse(JSON.stringify(rateKey));
    delKey.map((item,index)=>{
        if(item.id===id) {
            delKey[index].text=e
        }
    })
     this.setState({
        rateKey:delKey
     })
     saveKeyWords(delKey)
  }

  saveRateWeight=(e,id)=>{
    const {rateKey} = this.state;
    const {saveKeyWords} = this.props
    const rate = JSON.parse(JSON.stringify(rateKey));
    rate.map((item,index)=>{
        if(item.id===id) {
            rate[index].weight=e.target.value
        }
    })
     this.setState({
        rateKey:rate
     })
     saveKeyWords(rate)
  }

  saveWeight=(e,id)=>{
    const {rateKey} = this.state;
    const {saveKeyWords} = this.props
    const delKey = JSON.parse(JSON.stringify(rateKey));
    delKey.map((item,index)=>{
        if(item.id===id) {
            delKey[index].weight=e.target.value
        }
    })
     this.setState({
        rateKey:delKey
     })
     saveKeyWords(delKey)
  }

  delRateAnswer=(id)=>{
    const {saveKeyWords} = this.props
    const {rateKey} = this.state;
    if(rateKey.length>1) {
      const rate = JSON.parse(JSON.stringify(rateKey));
      const ratelen = rate.filter( (x)=> {
          return x.exclude===false;
       })
          rate.map((item,index)=>{
              if(item.id===id) {
                  rate.splice(index,1)
              }
          })
           this.setState({
              rateKey:rate
           })
           saveKeyWords(rate)
    } else {
      message.warning(formatMessage(messages.TODO_tips3))
    }   
  }

  delKeyAnswer=(id)=>{
 
    const {rateKey} = this.state;
    if(rateKey.length>1) {
      const {saveKeyWords} = this.props
      const delKey = JSON.parse(JSON.stringify(rateKey));
      const del = delKey.filter( (x)=> {
          return x.exclude===true;
       })
          delKey.map((item,index)=>{
              if(item.id===id) {
                  delKey.splice(index,1)
              }
          })
           this.setState({
              rateKey:delKey
           })
           saveKeyWords(delKey) 
    }
    else {
      message.warning(formatMessage(messages.TODO_tips3))
    }
   
 
  }

  checkInputDesc = (rule, value, callback) => {
    if ((value <100||value ===100)&&value>0) {
      callback();
      return;
    }
    if(value!=='') {
        callback(formatMessage(messages.IsWeightInputRight));
    } else {
        callback();
    }   
  }

  render() {
      const {rateKey} = this.state;
      const {form,subTab} = this.props;   
      const { getFieldDecorator } = form;
    return (
      <Form layout="vertical">
        <div className="demon">
          <h1>{formatMessage(messages.AssessmentKeyWords)}</h1>
          {rateKey.map((item,index)=>{
              return (item.exclude===false&&
              <div className={styles.keyDetail} key={index}>  
                <FormItem className="keywordRate">
                  {getFieldDecorator('rate'+subTab+item.id, {
                    initialValue: item.text,
                    rules: [{ required: true, message: formatMessage(messages.InputAssessmentKeyWords)}],
                  })(
                  
                  <InputClearData 
                    className={styles.keywordInfo} 
                    placeholder={formatMessage(messages.AssessmentKeyWords)} 
                    onChange={(e,id)=>this.saveRateKey(e,item.id)}
                    autocleaning={"true"}
                    saveClear={(value)=>this.props.saveClear(value)}
                    // initvalue={stemTextValue} 
                    // onChange={(value,type="")=>this.saveStemText(value,type)} 
                    // isUsebraft = {(value)=>this.isUsebraft(value)} 
                    // textlabel={data.params.textLabel} 
                    // autocleaning={data.params.autoCleaning}
                    // allowEnter={allowEnterStemInfo}
                    // braft = {true}
                    // isUsebraftEdit = {isUsebraftEdit}
                    // saveAllowEnter={(value)=>this.saveStemAllowEnter(value)}
                  /> )}
                </FormItem>              
                <FormItem className="keywordRateWeight">
                  {getFieldDecorator('weighting'+subTab+item.id, {
                    initialValue: item.weight,
                    rules: [{ required: true, message: formatMessage(messages.IsWeightInput)}, { validator: this.checkInputDesc}],
                  })(<Input className={styles.weightKey} placeholder={formatMessage(messages.WeightInput)} onChange={(e,id)=>this.saveRateWeight(e,item.id)} />)}
                </FormItem> 
              
                <IconButton iconName="icon-detele" type="" onClick={(id)=>this.delRateAnswer(item.id)} className={styles.deleteKey} />
              </div>)
          })}
          <IconButton iconName="icon-add" type="" onClick={this.addMoreRate} className={styles.addKey} text={formatMessage({id:"app.button.addMoreRate",defaultMessage:"增加评分关键词"})} />
          <h1>{formatMessage(messages.ExcludeAssessmentKeyWords)}</h1>
          {rateKey.map((item,index)=>{
              return (item.exclude===true&&
              <div className={styles.keyDetail} key={index}> 
                <FormItem className="keywordRate">
                  {getFieldDecorator('excludeRate'+subTab+item.id, {
                    initialValue: item.text,
                    rules: [{ required: true, message:formatMessage(messages.AnswerAddbtn)}],
                  })(
                  <InputClearData 
                    className={styles.keywordInfo} 
                    placeholder={formatMessage(messages.ExcludeAssessmentKeyWords)} 
                    onChange={(e,id)=>this.saveKey(e,item.id)}
                    autocleaning={"true"}
                    saveClear={(value)=>this.props.saveClear(value)}
                    // initvalue={stemTextValue} 
                    // onChange={(value,type="")=>this.saveStemText(value,type)} 
                    // isUsebraft = {(value)=>this.isUsebraft(value)} 
                    // textlabel={data.params.textLabel} 
                    // autocleaning={data.params.autoCleaning}
                    // allowEnter={allowEnterStemInfo}
                    // braft = {true}
                    // isUsebraftEdit = {isUsebraftEdit}
                    // saveAllowEnter={(value)=>this.saveStemAllowEnter(value)}
                  />)}
                </FormItem> 
                <FormItem className="keywordRateWeight">
                  {getFieldDecorator('excludeWeighting'+subTab+item.id, {
                    initialValue: item.weight,
                    rules: [{ required: true, message:formatMessage(messages.IsWeightInput) }, { validator: this.checkInputDesc}],
                  })(<Input className={styles.weightKey} placeholder={formatMessage(messages.WeightInput)} onChange={(e,id)=>this.saveWeight(e,item.id)} />)}
                </FormItem>
                <IconButton iconName="icon-detele" type="" onClick={(id)=>this.delKeyAnswer(item.id)} className={styles.deleteKey} />
              </div>)
          })}
          <IconButton iconName="icon-add" type="" onClick={this.addMoreKey} className={styles.addKey} text={formatMessage({id:"app.button.deleteKey",defaultMessage:"增加排除关键词"})} />
        </div>
      </Form>
    );
  }
}

export default AddKeyWords;
