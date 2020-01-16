/**
 * @Author    tina
 * @DateTime  2018-10-22
 * @copyright 口语封闭题答案配置控件
 */
import React, { Component } from 'react';
import { Input, Button, Form, Modal,message,Checkbox,Radio } from 'antd';
import styles from './index.less';
const FormItem = Form.Item;
import UploadFile from '../../UpLoadFile';
//获取上传文件的详情
import { fetchPaperFileUrl } from '@/services/api';
import { regularBuilder } from '@/utils/utils';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import TextareaClearData from './TextareaClearData';



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
});
class ClosedOralControl extends Component {
  constructor(props) {
    super(props);

    let medice=[]
    let mediceTip=[]
    medice = props.closeOralInfo ? regularBuilder(props.closeOralInfo).split(/\s|\~|`|\!|\#|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\{|\.\s|\}|\;|\"|\,|\<|\>|\?/g)||[] : [];
    mediceTip = props.closeOralInfo ? regularBuilder(props.closeOralInfo).match(/\s|\~|`|\!|\#|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\.\s|\{|\}|\;|\"|\,|\<|\>|\?/g)||[] : []

    try{
      let lastItem = medice[medice.length-1];
      if(lastItem[lastItem.length-1] === "."){
        medice[ medice.length-1] = lastItem.slice(0,lastItem.length-1);
        mediceTip.push(".")
      }
    }catch(e){

    }

    this.state = {
      visible: false,
      referenceText: props.closeOralInfo, // 参考文本
      referenceAudio: '', //参考音频ID ,
      referenceAudioTime: 0, //参考音频时间  
      answerType: props.data.name, //答题类型
      id: '',
      duration: 0,
      name: '',
      audioUrl: "",
      currentWord: '', //当前要标记的词
      referenceTextMark: [], //标记列表
      currentMarked: '', //当前的标记remark value
      valueMark: '',
      startIndex: '',
      endIndex: '',
      manualEntry:false,
      medice,
      mediceTip,
      showBackKey:true
    };
  }

  componentWillMount() {
    const { data, showData, subIndex, index2, closeOralInfo,closeOralQuestionAnswerInfo } = this.props;
    //渲染数据
    const editData = showData && showData.data;
    let fileID = '';
    let stemAudioTime = '';
    let self = this;
    let referenceTextMark = [];
    const mainIndex = index2 == 'all' ? '1' : index2;
    if (editData && editData.patternType == "NORMAL" && editData.mainQuestion.closeOralQuestionAnswerInfo != null) {

      fileID = editData.mainQuestion.closeOralQuestionAnswerInfo.referenceAudio
      stemAudioTime = editData.mainQuestion.closeOralQuestionAnswerInfo.referenceAudioTime
      referenceTextMark = editData.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark || []
    } else if (editData && editData.patternType == "TWO_LEVEL" && editData.subQuestion[subIndex].closeOralQuestionAnswerInfo != null) {

      fileID = editData.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceAudio
      stemAudioTime = editData.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceAudioTime
      referenceTextMark = editData.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceTextMark || []
    } else if (editData && editData.patternType == "COMPLEX" && editData.groups[mainIndex].data) {
      if (editData.groups[mainIndex].data.patternType == "NORMAL" && editData.groups[mainIndex].data.mainQuestion.closeOralQuestionAnswerInfo != null) {
        referenceTextMark = editData.groups[index2].data.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark || []
        fileID = editData.groups[index2].data.mainQuestion.closeOralQuestionAnswerInfo.referenceAudio
        stemAudioTime = editData.groups[index2].data.mainQuestion.closeOralQuestionAnswerInfo.referenceAudioTime
      }
      if (editData.groups[mainIndex].data.patternType == "TWO_LEVEL" && editData.groups[mainIndex].data.subQuestion[subIndex].closeOralQuestionAnswerInfo != null) {
        referenceTextMark = editData.groups[index2].data.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceTextMark || []
        fileID = editData.groups[index2].data.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceAudio
        stemAudioTime = editData.groups[index2].data.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceAudioTime
      }
    }
    
    let manualEntry = false;
    if(closeOralQuestionAnswerInfo&&closeOralQuestionAnswerInfo.referenceText != undefined){
      if(closeOralQuestionAnswerInfo.referenceText != regularBuilder(closeOralInfo)){
        manualEntry = true
      }
    }

    this.setState({
      referenceTextMark: referenceTextMark,
      manualEntry:manualEntry
    })

    localStorage.setItem("manualEntry",manualEntry)
    if (editData) {
      fetchPaperFileUrl({
        fileId: fileID
      }).then((e) => {
        if (e) {
          self.setState({
            id: e.data.id,
            audioUrl: e.data.path,
            duration: stemAudioTime,
            name: e.data.fileName
          })
          const { subIndex, patternType, index2 } = this.props;
          this.props.saveReferenceTextValue(regularBuilder(closeOralQuestionAnswerInfo.referenceText || closeOralInfo), e.data.id, stemAudioTime, subIndex, patternType, this.state.answerType, index2, referenceTextMark,this.props.allowEnterData)
        }
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    const { closeOralInfo } = nextProps;
    if (closeOralInfo != this.props.closeOralInfo) {

      let medice=[]
      let mediceTip=[]
      medice = closeOralInfo ? regularBuilder(closeOralInfo).split(/\s|\~|`|\!|\#|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\{|\.\s|\}|\;|\"|\,|\<|\>|\?/g)||[] : [];
      mediceTip = closeOralInfo ? regularBuilder(closeOralInfo).match(/\s|\~|`|\!|\#|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\.\s|\{|\}|\;|\"|\,|\<|\>|\?/g)||[] : []

      try{
        let lastItem = medice[medice.length-1];
        if(lastItem[lastItem.length-1] === "."){
          medice[ medice.length-1] = lastItem.slice(0,lastItem.length-1);
          mediceTip.push(".")
        }
      }catch(e){

      }
      this.setState({
        currentWord: '', //当前要标记的词
        referenceTextMark: [], //标记列表
        currentMarked: '', //当前的标记remark value
        valueMark: '',
        medice,
        mediceTip
      })
      const { subIndex, patternType, index2 } = this.props;
      const { id, duration, answerType,manualEntry } = this.state;

     

      if(!manualEntry){
          this.props.saveReferenceTextValue(regularBuilder(closeOralInfo), id, duration, subIndex, patternType, answerType, index2, [],this.props.allowEnterData)
      }
      
    }
  }
  //设置标记
  setKeyWord = (value, startIndex, endIndex) => {
     
    const {checkClear} = this.props
    if(checkClear===false) {
      message.warning(formatMessage({id:"app.message.checkClear",defaultMessage:"您还有未清洗的数据，请耐心等待哦！"}))
      return;
    }
    if(value.split(/\.\s/).length>1) {
      this.setState({
        showBackKey:false
      })
    } else {
      const {medice,mediceTip} = this.state;
      medice.forEach((vo,index)=>{
        if(vo===value) { 
          if(mediceTip&&mediceTip[index]) {
            if(mediceTip[index]===" "||(index===medice.length-1&&mediceTip[index]==='.')) {
              this.setState({
                showBackKey:false
              })
            } else {
              this.setState({
                showBackKey:true
                })
              }
          } else {
            this.setState({
              showBackKey:false
              })
          }
         
          } 
      })
    }

    this.setState({
      visible: true,
      currentWord: value
    });
    const { closeOralInfo } = this.props;
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
    const { closeOralInfo } = this.props;
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
      showBackKey:true
    });
  }
  //保存标记
  hideModal = () => {
    this.setState({
      visible: false,
      valueMark: '',
      showBackKey:true
    });
    const { closeOralInfo } = this.props;
    // const startIndex=closeOralInfo.indexOf(this.state.currentWord)
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
    const { subIndex, patternType, index2 } = this.props;
    const { id, duration, answerType } = this.state;
    this.props.saveReferenceTextValue(regularBuilder(closeOralInfo), id, duration, subIndex, patternType, answerType, index2, referenceMark,this.props.allowEnterData)
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
  //保存标记
  saveSetTagMedice = (e) => {
    this.setState({
      currentMarked: e.target.value
    })
  }

  onChangeCheckbox = (e) => {
    localStorage.setItem("manualEntry",e.target.value)
    this.setState({
      manualEntry: e.target.value
    })

    if(!e.target.value){
      this.setState({
        currentWord: '', //当前要标记的词
        referenceTextMark: [], //标记列表
        currentMarked: '', //当前的标记remark value
        valueMark: ''
      })
      const { subIndex, patternType, index2 } = this.props;
      const { closeOralInfo } = this.props;
      const { id, duration, answerType,manualEntry } = this.state;
      if(closeOralInfo){
        this.props.saveReferenceTextValue(regularBuilder(closeOralInfo), id, duration, subIndex, patternType, answerType, index2, [],this.props.allowEnterData)
      }
    }
  }
  saveStemCloseOralInfo = (value) => {
    const { subIndex, patternType, index2 } = this.props;
    const { id, duration, answerType } = this.state;
    this.props.saveReferenceTextValue(value, id, duration, subIndex, patternType, answerType, index2, [],this.props.allowEnterData)
  }

  setNextWord=()=>{
    // 合并标记    
    const {currentWord,endIndex,mediceTip,medice} = this.state;
    if(currentWord.split(/\.\s/).length>1) {
      message.warning(formatMessage({id:"app.message.notSetNextWord",defaultMessage:"不能再向后标注了哦！"}))
    } else {
      medice.forEach((vo,index)=>{
        if(vo===currentWord&&index!==(medice.length-1)) { 
          if(mediceTip[index].indexOf(".")!==-1) {
            // medice[index]=vo+mediceTip[index];         
            this.setState({
              currentWord:vo+mediceTip[index],
              endIndex:endIndex+mediceTip[index].length,
              
            })
            // mediceTip[index]=''
            this.setState({
             mediceTip,medice
            })
          }
          if(mediceTip[index]===" ") {
            this.setState({
              showBackKey:false
            })
          } else {
            this.setState({
              showBackKey:false
            })
          }
          //  else {
          //   medice[index]=vo+mediceTip[index]+medice[index+1]||'';         
          //   this.setState({
          //     currentWord:vo+mediceTip[index]+medice[index+1]||'',
          //     endIndex:endIndex+mediceTip[index].length+medice[index+1].length||0,
              
          //   })
          //   medice.splice(index+1,1)
          //   mediceTip.splice(index,1)
          //   this.setState({
          //    mediceTip,medice
          //   })
          // }        
            
          }
      })
    }
  }

  render() {
    const { data, subIndex, patternType, form, index2, closeOralInfo,allowEnterData,closeOralQuestionAnswerInfo } = this.props;
    const { id, audioUrl, duration, name, referenceText, valueMark, referenceTextMark, manualEntry,medice,mediceTip,currentWord,showBackKey } = this.state;
    const { getFieldDecorator } = form;
    if(manualEntry){
      return  <div className="demon" style={{position:"relative"}}>
                  <Radio.Group className={styles.manualEntry} value={manualEntry} onChange={this.onChangeCheckbox}>
                    <Radio value={false}><FormattedMessage id="app.auto.manual.annotated" defaultMessage="标注模式" /></Radio>
                    <Radio value={true}><FormattedMessage id="app.auto.manual.entry" defaultMessage="人工录入" /></Radio>
                  </Radio.Group>
                  {/* <Checkbox className={styles.manualEntry} checked={manualEntry} onChange={this.onChangeCheckbox}>
                    {<FormattedMessage id="app.auto.manual.entry" defaultMessage="人工录入" />}
                  </Checkbox> */}
                  {data.params.referenceText!='N'&&<FormItem label={data.params.referenceTextLabel}>
                    {getFieldDecorator('closeOralQuestionAnswerInfos'+subIndex+index2, {
                      initialValue: closeOralQuestionAnswerInfo && closeOralQuestionAnswerInfo.referenceText || "",
                      rules: [{ required: true, message: <FormattedMessage values={{index:data.params.referenceTextLabel}} {...messages.inputModel} ></FormattedMessage> }],
                    })(
                      <TextareaClearData initvalue={closeOralQuestionAnswerInfo && closeOralQuestionAnswerInfo.referenceText || ""} 
                      saveClear={(value)=>this.props.saveClearTrue(value)}
                      onChange={(value)=>this.saveStemCloseOralInfo(value)} 
                      autocleaning={"true"}/> 
                    )}
                  </FormItem>}

                  <div style={{display:(data.params.referenceAudio=='N'?'none':'block')}}>
                    <FormItem label={data.params.referenceAudioLabel}>
                      {getFieldDecorator('closeOralQuestionAnswerInforeferenceAudioLabel'+index2+subIndex, {
                        initialValue: id,
                        rules: [{ required: data.params.referenceAudio=='REQUIRED'?true:false, message:<FormattedMessage values={{index:data.params.referenceAudioLabel}} {...messages.uploadModel} ></FormattedMessage>}],
                      })(
                      <div>
                          {duration!=''&&<UploadFile
                          id={id}
                          url={audioUrl}
                          duration={duration}
                          name={name}
                          callback={(e)=>{            
                            this.setState(e)
                            this.props.saveReferenceTextValue(regularBuilder(closeOralQuestionAnswerInfo.referenceText || closeOralInfo),e.id,e.duration,subIndex,patternType,this.state.answerType,index2,this.state.referenceTextMark,this.state.allowEnterData)
                          }}
                        /> }  
                        {duration==''&&<UploadFile
                          id={id}
                          url={audioUrl}
                          duration={duration}
                          name={name}
                          callback={(e)=>{            
                            this.setState(e)
                              this.props.saveReferenceTextValue(regularBuilder(closeOralQuestionAnswerInfo.referenceText || closeOralInfo),e.id,e.duration,subIndex,patternType,this.state.answerType,index2,this.state.referenceTextMark,this.state.allowEnterData)
                          }}
                        />  }
                      </div>
                      )}
                    </FormItem>
              
                  </div> 
              </div>
    }else{
      return (
        <div className="demon" style={{position:"relative"}}> 
          <Radio.Group className={styles.manualEntry} value={manualEntry} onChange={this.onChangeCheckbox}>
            <Radio value={false}><FormattedMessage id="app.auto.manual.annotated" defaultMessage="标注模式" /></Radio>
            <Radio value={true}><FormattedMessage id="app.auto.manual.entry" defaultMessage="人工录入" /></Radio>
          </Radio.Group>
          {/* <Checkbox className={styles.manualEntry} checked={manualEntry} onChange={this.onChangeCheckbox}>
            {<FormattedMessage id="app.auto.manual.entry" defaultMessage="人工录入" />}
          </Checkbox>  */}
         {data.params.referenceText!='N'&&      
         <FormItem label={data.params.referenceTextLabel}>
            {getFieldDecorator('closeOralQuestionAnswerInfo'+index2+subIndex, {
              initialValue: closeOralInfo,
              rules: [{ required: false, message:<FormattedMessage values={{index:data.params.referenceTextLabel}} {...messages.inputModel} ></FormattedMessage>}],
            })(
              <div>
              <div className={styles.closeMedice}>
                  {medice.map((item,index)=>{
                    // if(parseFloat(item.indexOf('$')>-1?regularBuilder(item):item).toString() == "NaN") {                                      
                    //   return <span><span className={styles.normalData} key={index}>{item.split(":").join(' ')}</span> <span>{mediceTip&&mediceTip[index]||''}</span></span>
                    // } else {
                      if(item.trim() == ""){
                        return  <span><span className={styles.normalData} key={index}>{item.split(":").join(' ')}</span> <span>{mediceTip&&mediceTip[index]||''}</span></span>
                      }
                      let str='';
                      let len = medice.map((vo,index2)=>{
                        if(index2<index) {
                          str+=vo+mediceTip[index2]
                        }
                      })
                      const startIndex=str.length
                      let endIndex = str.length+this.GetLength(item) - 1;
                      let status = referenceTextMark.filter(function(x){
                        return ((x.word==item||item+mediceTip[index]===x.word)&&x.startIndex==startIndex)
                      })
                      let medStatus =referenceTextMark.filter(function(x){
                        
                        return (item+mediceTip[index]===x.word&&x.startIndex==startIndex)
                      })
                      endIndex=medStatus.length>0?endIndex+mediceTip[index].length:endIndex
                      if(parseFloat(item.indexOf('$')>-1?regularBuilder(item):item).toString() == "NaN") {  
                        const words = medStatus.length>0?(item.split(":").join(' ')).concat(mediceTip&&mediceTip[index]||''):item.split(":").join(' ')                                   
                        return <span><span className={status.length>0?styles.numberDataFocus:styles.normalDatas} 
                        onClick={(value)=>this.setKeyWord(words,startIndex,endIndex)} 
                        key={index}>{words}</span> <span>{medStatus.length>0?'':mediceTip&&mediceTip[index]||''}</span></span>
                      } else {
                        const words = medStatus.length>0?item.concat(mediceTip&&mediceTip[index]||''):item
                        return <span>
                          <span 
                          className={status.length>0?styles.numberDataFocus:styles.numberData} 
                          onClick={(value)=>this.setKeyWord(words,startIndex,endIndex)} 
                          key={index}>
                          {words}
                          </span>
                        <span>{medStatus.length>0?'':mediceTip&&mediceTip[index]||''}</span></span>
                      }
                    // }
                  })}
            </div>
            <div className={styles.remarkList}>
              {referenceTextMark.map((item,index)=>{
                  return <div className={styles.remarkDetail}><span key={index}>{item.word}&nbsp;&nbsp;>&nbsp;&nbsp;{item.markedWord}</span>
                  <i className={'iconfont icon-edit'}  onClick={(value)=>this.setKeyWord(item.word,item.startIndex,item.endIndex)}/>
                  <i className={'iconfont icon-detele'}  onClick={(value)=>this.delKeyWord(item.word,item.startIndex,item.endIndex)}/>
                  </div>              
              })}
            </div>
            <div className={styles.warningInfo}><FormattedMessage  {...messages.ReferTxtMarkTips} tagName="pre"></FormattedMessage>
            <p><i className={'iconfont icon-info-circle'} /><FormattedMessage values={{index:data.params.referenceTextLabel}} {...messages.maticMark} ></FormattedMessage></p>
            </div>
            </div>
            )}
          </FormItem>}       
          <div style={{display:(data.params.referenceAudio=='N'?'none':'block')}}>
          <FormItem label={data.params.referenceAudioLabel}>
            {getFieldDecorator('closeOralQuestionAnswerInforeferenceAudioLabel'+index2+subIndex, {
              initialValue: id,
              rules: [{ required: data.params.referenceAudio=='REQUIRED'?true:false, message:<FormattedMessage values={{index:data.params.referenceAudioLabel}} {...messages.uploadModel} ></FormattedMessage>}],
            })(
             <div>
                {duration!=''&&<UploadFile
                id={id}
                url={audioUrl}
                duration={duration}
                name={name}
                callback={(e)=>{            
                  this.setState(e)
                  this.props.saveReferenceTextValue(regularBuilder(closeOralInfo),e.id,e.duration,subIndex,patternType,this.state.answerType,index2,this.state.referenceTextMark,this.state.allowEnterData)
                }}
              /> }  
              {duration==''&&<UploadFile
                id={id}
                url={audioUrl}
                duration={duration}
                name={name}
                callback={(e)=>{            
                  this.setState(e)
                     this.props.saveReferenceTextValue(regularBuilder(closeOralInfo),e.id,e.duration,subIndex,patternType,this.state.answerType,index2,this.state.referenceTextMark,this.state.allowEnterData)
                }}
              />  }
             </div>
            )}
          </FormItem>
     
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
            <p>{currentWord}{formatMessage({id:"app.text.set",defaultMessage:"标记为"})}{showBackKey&&<span onClick={this.setNextWord} className={styles.colorBlue}>{formatMessage({id:"app.text.setTip",defaultMessage:"合并后续字符"})}</span>}</p>
            <Input className={styles.setInput} onChange={this.saveSetTagMedice} defaultValue={valueMark}/>          
          </Modal>      
        </div>
      );
    }
    
    
  }
}

export default ClosedOralControl;
