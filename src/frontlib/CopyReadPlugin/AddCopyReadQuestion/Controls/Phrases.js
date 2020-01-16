import React, { Component } from 'react';
import {Select,Input,Tabs,Form,Modal} from 'antd';
import styles from '../index.less';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
import { regularBuilder } from '@/utils/utils';
import StemAudioControl from './StemAudioControl';

const FormItem = Form.Item;
const { TextArea } = Input;

const messages = defineMessages({
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
  QuestionTips: {
    id: 'app.question.tips',
    defaultMessage: '点拨',
  },
  TODO_tips: {
    id: 'app.question.tips.tab',
    defaultMessage: '请输入解析内容!',
  },
});
/**
 * 跟读模仿插件
 * 自动断句生成的小句card
 * @author tina.zhang
 */
class PhrasesControl extends Component {
  constructor(props) {
    super(props);
    this.state={
      value:"",
      referenceTextMark: [], //标记列表
      visible: false,
      currentWord: '', //当前要标记的词
      valueMark: '',
      startIndex: '',
      endIndex: ''
    }
  }

  componentDidMount(){
    const { dataSource,labelName } = this.props;
    if(dataSource && dataSource.mainPatterns){
        this.setState({value:dataSource.mainPatterns[labelName]})
    }
  }


  GetLength = (str) => {
    var realLength = 0,
      len = str.length,
      charCode = -1;
    for (var i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) realLength += 1;
      else realLength += 2;
    }
    return realLength;
  };

   //设置标记
   setKeyWord = (value, startIndex, endIndex) => {
    this.setState({
      visible: true,
      currentWord: value
    });
    // const startIndex=closeOralInfo.indexOf(value)
    // const endIndex = startIndex+this.GetLength(value);
    const word = value;
    const referenceMark = this.state.referenceTextMark;
    const mark = referenceMark.map((item, index) => {
      if (item.startIndex == startIndex && item.endIndex == endIndex && item.word == word) {
        this.setState({
          valueMark: item.markedWord
        })
      }
    })
    this.setState({
      startIndex: startIndex,
      endIndex: endIndex
    })
  }
  //delKeyWord 删除标记
  delKeyWord = (value, startIndex, endIndex) => {
    const word = value;
    const referenceMark = this.state.referenceTextMark;
    const mark = referenceMark.map((item, index) => {
      if (item.startIndex == startIndex && item.endIndex == endIndex && item.word == word) {
        referenceMark.splice(index, 1)
        this.setState({
          referenceTextMark: referenceMark,
          valueMark: ''
        })
      }
    })
  }

  showModal = () => {
    this.setState({
      visible: false,
    });
  }
  //保存标记
  hideModal = () => {
    this.setState({
      visible: false,
      valueMark: ''
    });
    const { data } = this.props;
    // const startIndex=data.indexOf(this.state.currentWord)
    // const endIndex = startIndex+this.GetLength(this.state.currentWord);
    const startIndex = this.state.startIndex
    const endIndex = this.state.endIndex
    const word = this.state.currentWord;
    const referenceMark = this.state.referenceTextMark;
    const mark = referenceMark.filter(function(x) {
      return x.word == word
    })
    if (mark.length == 0) {
      referenceMark.push({
        word: word,
        markedWord: this.state.currentMarked,
        startIndex: startIndex,
        endIndex: endIndex
      })
    } else if (mark && mark[0].startIndex == startIndex && mark[0].endIndex == endIndex) {
      mark[0].markedWord = this.state.currentMarked
    } else {
      referenceMark.push({
        word: word,
        markedWord: this.state.currentMarked,
        startIndex: startIndex,
        endIndex: endIndex
      })
    }

    this.setState({
      referenceTextMark: referenceMark,
      valueMark: ''
    })
    // const { subIndex, patternType, index2 } = this.props;
    // const { id, duration, answerType } = this.state;
    this.props.index.saveReferenceTextValue(referenceMark,this.props.keyWord);
  }

  //保存标记
  saveSetTagMedice = (e) => {
    this.setState({
      currentMarked: e.target.value
    })
  }

  render() {
    const { form,data,keyWord,callback,subQuestionItem } = this.props;
    console.log(subQuestionItem)
    const { getFieldDecorator } = form;
    const {valueMark,referenceTextMark} = this.state;
    let medice = data ? regularBuilder(data).split(/[\s|\~|`|\!|\#|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\{|\}|\;|\"|\,|\<|\.|\>|\?]/g) : [];
    let mediceTip = data ? regularBuilder(data).match(/[\s|\~|`|\!|\#|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\{|\}|\;|\"|\,|\<|\.|\>|\?]/g) : ''
    return (
      <div className="demon">
          <div>
            <FormItem label={"句子内容"}>
              {getFieldDecorator('stemText'+keyWord, {
                initialValue: data,
                rules: [{ required: true, message: "请输入短文内容" }],
              })(
                <TextArea
                  {...this.props}
                  defaultValue={""}
                  disabled
                  placeholder={'勾选自动修订后，某些输入字符将被认定为非法字符（如中文、日文等）被清除'}
                  autosize={{ minRows:1 , maxRows: 3 }}
                />
              )}
            </FormItem>
          </div>
          
          <div>
          <FormItem label={"机评参考"}>
              {getFieldDecorator('closeOralQuestionAnswerInfo'+keyWord, {
                initialValue: subQuestionItem && subQuestionItem.closeOralQuestionAnswerInfo && subQuestionItem.closeOralQuestionAnswerInfo.referenceText,
                rules: [{ required: false, message:<FormattedMessage values={{index:""}} {...messages.inputModel} ></FormattedMessage>}],
              })(
                <div>
                <div className={styles.closeMedice}>
                    {medice.map((item,index)=>{
                      
                      if(parseFloat(item).toString() == "NaN") {
                        return <span><span className={styles.normalData} key={index}>{item.split(":").join(' ')}</span> <span>{mediceTip&&mediceTip[index]||''}</span></span>
                      } else {
                        let str='';
                        let len = medice.map((vo,index2)=>{
                          if(index2<index) {
                            str+=vo+mediceTip[index2]
                          }
                        })
                        const startIndex=str.length
                        const endIndex = str.length+this.GetLength(item) - 1;
                        let status = referenceTextMark.filter(function(x){
                          return (x.word==item&&x.startIndex==startIndex)
                        })
                        return <span>
                          <span 
                          className={status.length>0?styles.numberDataFocus:styles.numberData} 
                          onClick={(value)=>this.setKeyWord(item,startIndex,endIndex)} 
                          key={index}>
                          {item}
                          </span>
                        <span>{mediceTip&&mediceTip[index]||''}</span></span>
                      }
                    })}
              </div>
              <div >
                {referenceTextMark.map((item,index)=>{
                    return <div className={styles.remarkDetail}><span key={index}>{item.word}&nbsp;&nbsp;>&nbsp;&nbsp;{item.markedWord}</span>
                    <i className={'iconfont icon-edit'}  onClick={(value)=>this.setKeyWord(item.word,item.startIndex,item.endIndex)}/>
                    <i className={'iconfont icon-detele'}  onClick={(value)=>this.delKeyWord(item.word,item.startIndex,item.endIndex)}/>
                    </div>              
                })}
              </div>
              <div className={styles.warningInfo}><FormattedMessage  {...messages.ReferTxtMarkTips} tagName="pre"></FormattedMessage>
              <p><i className={'iconfont icon-info-circle'} /><FormattedMessage values={{index:""}} {...messages.maticMark} ></FormattedMessage></p>
              </div>
              </div>
              )}
            </FormItem>
          </div>

          <StemAudioControl
              label={"短文音频"}
              index = {'sub'+keyWord}
              message = {'请上传短文音频'}
              form={form}
              required={true}
              key = {subQuestionItem && subQuestionItem.subQuestionStemAudio}
              stemAudio = {subQuestionItem && subQuestionItem.subQuestionStemAudio}
              stemAudioTime = {subQuestionItem && subQuestionItem.subQuestionStemAudioTime}
              callback = {(id,duration)=>{
                callback(id,duration,keyWord)
              }}
          />

          
        <div className="demon" style={{display:'block'}}>
        
          {<FormItem label={formatMessage(messages.QuestionTips)}>
                {getFieldDecorator('answerExplanation'+keyWord, {
                  initialValue: subQuestionItem && subQuestionItem.answerExplanation,
                  rules: [{ required:false, message: formatMessage(messages.TODO_tips) }],
                })(
                  <TextArea
                    {...this.props}
                    defaultValue={""}
                    placeholder={''}
                    autosize={{ minRows:1 , maxRows: 3 }}
                    onChange={(e)=>this.props.index.subQuestionAssembly("answerExplanation",e.target.value,keyWord)}
                  />           
                )}
          </FormItem>}
        </div>



          <Modal
            title=""
            width={264}
            visible={this.state.visible}
            onOk={this.hideModal}
            onCancel={this.showModal}
            destroyOnClose={true}
            className="setTagMedice"
            closable={false}
            cancelText={formatMessage(messages.cancelBtn)}
            okText={formatMessage(messages.saveBtn)}
          >
            <p>标记为</p>
            <Input className={styles.setInput} onChange={this.saveSetTagMedice} defaultValue={valueMark}/>          
          </Modal>   
      </div>
    );
  }
}

export default PhrasesControl;
