import React, { Component } from 'react';
import styles from './index.less';
import {Form} from 'antd';
import {Select,Input,Tabs} from 'antd';
import Phrases from './Controls/Phrases';
import StemAudioControl from './Controls/StemAudioControl';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
import {queryDifficult,queryAbility} from '@/services/api';
import { regularBuilder } from '@/utils/utils';

const { TabPane } = Tabs;
const { TextArea } = Input;
const FormItem = Form.Item;

const messages = defineMessages({
  QuestionTips: {
    id: 'app.question.tips',
    defaultMessage: '点拨',
  },
  TODO_tips: {
    id: 'app.question.tips.tab',
    defaultMessage: '请输入解析内容!',
  }, 
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
  ReferTxtMarkTips: {
    id: 'app.refer.txt.mark.tips',
    tagName: 'p',
    defaultMessage: '请将非英文或有特殊读法的英文单词标注为正确读法对应的单词：\n' +
      '【数字】如100 -> one hundred；\n' +
      '【时间】如8:30 -> eight thirty；\n' +
      '【符号】如$ -> dollar；',
  },
  uploadModel: {
    id: 'app.is.upload.model',
    defaultMessage: '请上传{index}'
  },
  inputModel: {
    id: 'app.is.input.model',
    defaultMessage: '请输入{index}'
  },
  maticMark: {
    id: 'app.auto.matic.mark',
    defaultMessage: '重新编辑“{index}”将造成“机评标注”丢失，请谨慎操作！'
  },
  saveBtn: { id: 'app.save', defaultMessage: '保存' },
  cancelBtn: { id: 'app.cancel', defaultMessage: '取消' },
  saveMarked: { id: 'app.marked', defaultMessage: '标记为' },
});


/**
 * 跟读模仿插件
 * 制作试题弹窗
 * @author tina.zhang
 */
class CopyReadPlugin extends Component {
  constructor(props) {
    super(props);
    const { dataSource } = props;
    const initDataUnits = dataSource.initData && dataSource.initData.data.mainQuestion
    let checkAbilityValue = []
    if(dataSource.initData && dataSource.initData.checkAbility) {
      dataSource.initData.checkAbility.split(',').map((vo)=>{
        if(vo) {
          checkAbilityValue.push(vo)
        }
      })
    }

    this.content = initDataUnits && initDataUnits.stemText ? initDataUnits.stemText : '';
    this.state={
      abilityData:[],
      evaluationEngineType:[],
      content:[],//切割短文数组
      id:'',
      duration:0,
      name:'',
      audioUrl:'', 
      stemTextValue: initDataUnits && initDataUnits.stemText ? initDataUnits.stemText : '', // 题干文本
      defaultEvaluationEngine: dataSource.initData ? dataSource.initData.difficultLevel : '',
      defaultAbility: checkAbilityValue,
      subQuestion:[]
    }

  }

  componentDidMount() { 
    let self = this;
    const { dataSource } = this.props;
    let Difficult = new Promise(function(resolve, reject){
        //获取难易度
        queryDifficult().then((res)=> {
          if (res.responseCode == '200') {
            resolve(res.data)
          }
        }).catch(err => {
           reject(err)
        }); 
    })

    let Ability = new Promise(function(resolve, reject){
      //获取难易度
        queryAbility().then((res)=> {
          if (res.responseCode == '200') {
            resolve(res.data)
          }
        }).catch(err => {
          reject(err)
        }); 
    })
      
    let m=[];
    let subQuestion = [];
    if(this.content){
      let u = this.content.split(". ");
      m = u.filter(function (x) {
          return x.trim() != "";
      });
      subQuestion = dataSource.initData && dataSource.initData.data.subQuestion;
      if(subQuestion){
        this.props.index.savePlugin(subQuestion);
      }
    }
     // MS_7
     Promise.all([Difficult,Ability])
     .then(arr => {
      self.setState({
        evaluationEngineType: arr[0],
        abilityData: arr[1],
        content: m,
        subQuestion:subQuestion
      });
     })
     .catch(function(e) {
      });
    
  }


  subQuestionAssemblyStemAudio(value, time, stemIndex){
    let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
    subQuestions[stemIndex].subQuestionStemAudio = value;
    subQuestions[stemIndex].subQuestionStemAudioTime = time;
    this.setState({
      subQuestion: subQuestions
    })
    this.props.index.savePlugin(subQuestions);
    
  }

  subQuestionAssembly(key,value,stemIndex){
    let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
    subQuestions[stemIndex][key] = value;

    this.setState({
      subQuestion: subQuestions
    })
    this.props.index.savePlugin(subQuestions);
  }

  saveReferenceTextValue(referenceMark,stemIndex){
    let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
    subQuestions[stemIndex].closeOralQuestionAnswerInfo.referenceMark = referenceMark;
    this.setState({
      subQuestion: subQuestions
    })
    this.props.index.savePlugin(subQuestions);
  }

  punctuate = ()=>{
    let u = this.content.split(". ");
    let m = u.filter(function (x) {
        return x.trim() != "";
    });

    let newSubQuestion = m.map((t,index)=>{
      let referenceText =  t + ". ";
      if(Number(index) === (m.length - 1)){
        referenceText =  t
      }
      referenceText = regularBuilder(referenceText);
      return {
        closeOralQuestionAnswerInfo:{
          allowEnter: "N",
          referenceText: referenceText,
          referenceMark:[]
        },
        answerTime:0,
        evaluationEngineInfo:{
          evaluationEngine: "eval.sent.en", fourDimensionEvaluationMode: "4"
        }
      }
    });
    this.setState({
      content:m,
      subQuestion:newSubQuestion
    });
  }

  defaultEvaluationEngine = (value) =>{
    this.setState({
      defaultEvaluationEngine:value
    })
    this.props.index.saveDifficultLevel(value)
  }

  defaultAbilityChange = (value) =>{

    this.setState({
      defaultAbility:value
    })
    let saveAbilityValue =''
    value.map((item)=>{
      saveAbilityValue+=item+','
    })
    this.props.index.saveAbilityLevel(saveAbilityValue)
  }

  render() {
    const { evaluationEngineType,key,abilityData,defaultAbility,content,stemTextValue,subQuestion} = this.state;
    const children = [];
    abilityData.map((item)=>{    
      children.push(<Option key={item.code} value={item.code}>{item.value}</Option>);
    })
    const { form } = this.props;
    const { getFieldDecorator } = form;

    const { dataSource } = this.props;
    const initDataUnits = dataSource.initData && dataSource.initData.data.mainQuestion;

    let jsx = content.map((item,index)=>{
      return  <TabPane tab={"句子"+(Number(index) + 1)} key={index} forceRender={true}>
                <Phrases 
                form={form} 
                data={item} 
                subQuestionItem={subQuestion[index]}
                keyWord={index}
                index = {this}
                callback={(id,duration,keyWord)=>{
                  console.log(id,duration,keyWord)
                  this.subQuestionAssemblyStemAudio(id,duration,keyWord)
                }}/>
              </TabPane>
    })

    let card =  <Tabs type="card" defaultActiveKey={"0"} onChange={this.onChange} className={"doubleStemInfo"}>
                    {jsx}          
                </Tabs>
              

    return (
      <div>
        <div className="demon">
          <FormItem label={"短文内容"}>
            {getFieldDecorator('stemText', {
              initialValue: stemTextValue,
              rules: [{ required: true, message: "请输入短文内容" }],
            })(

              <div>
                <TextArea
                  {...this.props}
                  defaultValue={stemTextValue}
                  placeholder={'勾选自动修订后，某些输入字符将被认定为非法字符（如中文、日文等）被清除'}
                  autosize={{ minRows:5 , maxRows: 8 }}
                  onChange={(e)=>{
                    console.log(e.target.value)
                    this.content = e.target.value + "";

                    this.setState({
                      stemTextValue: e.target.value
                    })
              
                    this.props.index.saveStem(e.target.value, "", "N" ,{params:{stemType:"ORINGINAL_PARAGRAPH_MULTIPLE"}})
                  }}
                />
                <div className={styles.splitconcent}>
                  <div/>
                  <div className={styles.btn} onClick={this.punctuate}>自动断句</div>
                </div>
              </div>
              
            )}
          </FormItem>
        </div>
        <StemAudioControl
            label={"短文音频"}
            index = {'1'}
            message = {'请上传短文音频'}
            form={form}
            required={true}
            stemAudio = {initDataUnits && initDataUnits.stemAudio}
            stemAudioTime = {initDataUnits && initDataUnits.stemAudioTime}
            callback = {(id,duration)=>{
              this.props.index.saveStemAudioID(id,duration,"")
            }}
        />
        <StemAudioControl
            label={"短文音频2"}
            index = {'2'}
            message = {'请上传短文音频2'}
            form={form}
            required={false}
            stemAudio = {initDataUnits && initDataUnits.stemAudio2}
            stemAudioTime = {initDataUnits && initDataUnits.stemAudioTime2}
            callback = {(id,duration)=>{
              this.props.index.saveStemAudioID2(id,duration,"")
            }}
        />
        {
          content.length!=0 
            && <div className="demon">     
            {card}
          </div>
        }

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
                    placeholder="请选择难易度"
                    key={key}
                    defaultValue={this.state.defaultEvaluationEngine}
                    onChange={this.defaultEvaluationEngine}
                    >
                    {evaluationEngineType.map((item)=>{
                        return <Option value={item.code} key={item.code}>{item.value}</Option>
                    })}         
                    </Select>                
                }
              <div>
                <h1>
                    {formatMessage(messages.abilityValue)}        
                </h1>       
               
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  defaultValue={defaultAbility}
                  onChange={this.defaultAbilityChange}
                >
                  {children}
                </Select>       
              </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CopyReadPlugin;
