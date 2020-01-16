/**
 * @Author    tina
 * @DateTime  2018-10-25
 * @copyright 选择题答案配置控件
 */
import React, { Component } from 'react';
import { Input, Tabs, Upload, Icon, Form, Radio, message } from 'antd';
import IconButton from '../../../../IconButton';
const RadioGroup = Radio.Group;
import UpLoadImg from './UpLoadImg';
import './index.less';
const { TextArea } = Input;
const { TabPane } = Tabs;
import { queryVhOption } from '@/services/api';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
const messages = defineMessages({
  QuestionAnswerTitle: {
    id: 'app.question.answer.title',
    defaultMessage: '问题答案',
  },
  SelectionImgAnswerTab: {
    id: 'app.selection.img.answer.tab',
    defaultMessage: '图片',
  },
  SelectionTxtAnswerTab: {
    id: 'app.selection.txt.answer.tab',
    defaultMessage: '文本',
  },
  OptionAddBtn: {
    id: 'app.option.add.btn',
    defaultMessage: '添加选项',
  },
  RightAnswerOption: {
    id: 'app.right.answer.option',
    defaultMessage: '正确选项',
  },
  DisplayAsRow: {
    id: 'app.display.as.row',
    defaultMessage: '横排',
  },
  DisplayAsColume: {
    id: 'app.display.as.colume',
    defaultMessage: '竖排',
  },
  IsAnswerOptionDisplayed: {
    id: 'app.is.answer.option.displayed',
    defaultMessage: '请选择答案排列方式',
  },
  IsRightAnswerOptionSelected: {
    id: 'app.is.right.answer.option.selected',
    defaultMessage: '请选择正确选项',
  },
});
const FormItem = Form.Item;
class ChoiceControl extends Component {
  constructor(props) {
    super(props);
    let defaultID = '';
    let floatModeData = '';
    let initData2 = [];
    const { showData, subIndex, index2, data } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    //渲染数据     
    const editData = showData && showData.data
    if (editData && editData.patternType == "TWO_LEVEL" && editData.subQuestion[subIndex].choiceQuestionAnswerInfo && editData.subQuestion[subIndex].choiceQuestionAnswerInfo.options != null) {
      initData2 = editData.subQuestion[subIndex].choiceQuestionAnswerInfo.options;
      const defaultAnswer = initData2.filter(function(x) {
        return x.isAnswer != 'N';
      })
      defaultID = defaultAnswer[0] && defaultAnswer[0].id;
      floatModeData = editData.subQuestion[subIndex].choiceQuestionAnswerInfo.floatMode
    } else if (editData && editData.patternType == "NORMAL" && editData.mainQuestion.choiceQuestionAnswerInfo && editData.mainQuestion.choiceQuestionAnswerInfo.options != null) {
      initData2 = editData.mainQuestion.choiceQuestionAnswerInfo.options;
      const defaultAnswer = initData2.filter(function(x) {
        return x.isAnswer != 'N';
      })
      defaultID = defaultAnswer[0] && defaultAnswer[0].id;
      floatModeData = editData.mainQuestion.choiceQuestionAnswerInfo.floatMode
    } else if (editData && editData.patternType == "COMPLEX" && editData.groups[mainIndex].data) {
      if (editData.groups[mainIndex].data.patternType == "TWO_LEVEL" && editData.groups[mainIndex].data.subQuestion[subIndex] && editData.groups[mainIndex].data.subQuestion[subIndex].choiceQuestionAnswerInfo != null) {
        initData2 = editData.groups[mainIndex].data.subQuestion[subIndex].choiceQuestionAnswerInfo.options;
        const defaultAnswer = initData2.filter(function(x) {
          return x.isAnswer != 'N';
        })
        defaultID = defaultAnswer[0] && defaultAnswer[0].id;
        floatModeData = editData.groups[mainIndex].data.subQuestion[subIndex].choiceQuestionAnswerInfo.floatMode
      } else if (editData.groups[mainIndex].data.patternType == "NORMAL" && editData.groups[mainIndex].data.mainQuestion.choiceQuestionAnswerInfo != null) {
        initData2 = editData.groups[mainIndex].data.mainQuestion.choiceQuestionAnswerInfo.options;
        const defaultAnswer = initData2.filter(function(x) {
          return x.isAnswer != 'N';
        })
        defaultID = defaultAnswer[0] && defaultAnswer[0].id;
        floatModeData = editData.groups[mainIndex].data.mainQuestion.choiceQuestionAnswerInfo.floatMode
      }
    }
    const answerTextFilter = initData2.filter(vo=>vo.text!=="")
    const answerImgFilter = initData2.filter(vo=>vo.image!=="")
    this.state = {
      visible: true,
      id: '',
      duration: 0,
      name: '',
      audioUrl: '',
      answerSelect: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      answer: initData2, //答案配置
      floatMode: floatModeData!==''?floatModeData:(data.params.floatModeSelectable!=='Y'?data.params.floatModeSelectable:''),
      defaultID: defaultID,
      vhOption: [],
      activeKey: data.params.imageOptionsSupport == 'N' ? '2' :answerTextFilter.length>0?'2':answerImgFilter.length>0?'1':'1'
    };
  }

  componentDidMount() {
    //查询横竖排
    queryVhOption().then((res) => {
      this.setState({
        vhOption: res.data
      })

    }).catch(err => {
      console.log(err);
    });
    //初始3个答案选项
    var initData2 = [];
    const { showData, subIndex, index2 } = this.props;
    //渲染数据     
    const editData = showData && showData.data
    if (editData) {
      initData2 = this.state.answer;
    } else {
      for (var i = 0; i < 3; i++) {
        let timestamp = (new Date()).getTime() + i;
        initData2.push({
          "id": timestamp, //唯一性，用于选项打乱的情况
          "text": "",
          "image": "",
          "isAnswer": "N"
        })
      }
    }
    this.setState({
      answer: initData2
    })
  }
  // 保存问题答案
  saveStemImg = (id, itemID) => {
    const { subIndex, data } = this.props;
    const initData2 = JSON.parse(JSON.stringify(this.state.answer));
    initData2.map((item, index) => {
      if (data.params.imageOptionsSupport == 'Y' && data.params.textOptionsSupport == 'Y') {
        initData2[index].text = ''
      }
      if (item.id == itemID) {
        initData2[index].image = id
      }
    })
    this.setState({
      answer: initData2
    })
    console.log(initData2)
    this.props.saveChoice(initData2, this.state.floatMode, this.props.patternType,this.props.answerType,this.props.subIndex,this.props.index2)
  }
  // 保存问题答案
  saveStemText = (e, id) => {
    const { subIndex, data } = this.props;
    let initData2 = JSON.parse(JSON.stringify(this.state.answer));
    initData2.map((item, index) => {
      if (data.params.imageOptionsSupport == 'Y' && data.params.textOptionsSupport == 'Y') {
        initData2[index].image = ''
      }
      if (item.id == id) {
        initData2[index].text = e.target.value
      }
    })
    this.setState({
      answer: initData2
    })
    console.log(initData2)
    this.props.saveChoice(initData2, this.state.floatMode, this.props.patternType,this.props.answerType,this.props.subIndex,this.props.index2)
  }
  //删除文本答案
  delAnswer = (id) => {
    const initData2 = JSON.parse(JSON.stringify(this.state.answer));
    if (this.state.answer.length > 2) {
      initData2.map((item, index) => {
        if (item.id == id) {
          initData2.splice(index, 1)
        }
      })
    } else {
      message.warning(formatMessage({id:"app.message.delAnswerTip",defaultMessage:"选择题答案配置不能少于2个哦！"}))
    }

    this.setState({
      answer: initData2
    })
    this.props.saveChoice(initData2, this.state.floatMode, this.props.patternType,this.props.answerType,this.props.subIndex,this.props.index2)
  }
  //添加更多文本答案
  addMoreAnswer = () => {
    if (this.state.answer.length < 10) {
      const initData2 = this.state.answer;
      let timestamp = (new Date()).getTime();
      initData2.push({
        "id": timestamp, //唯一性，用于选项打乱的情况
        "text": "",
        "image": "",
        "isAnswer": "N"
      })
      this.setState({
        answer: initData2
      })
      this.props.saveChoice(initData2, this.state.floatMode, this.props.patternType,this.props.answerType,this.props.subIndex,this.props.index2)
    } else {
      message.warning(formatMessage({id:"app.message.addMoreAnswerTip",defaultMessage:"答案配置已达上限！"}))
    }
  }
  //排列方式
  selectSort = (e) => {
    const { form } = this.props;
    form.resetFields()
    this.setState({
      floatMode: e.target.value
    })
    this.props.saveChoice(this.state.answer, e.target.value, this.props.patternType,this.props.answerType,this.props.subIndex,this.props.index2)
  }
  //设置正确答案
  answerOk = (e) => {
    const initData2 = this.state.answer;
    initData2.map((item) => {
      if (item.id == e.target.value) {
        item.isAnswer = 'Y'
      } else {
        item.isAnswer = 'N'
      }
    })
    this.setState({
      answer: initData2,
      defaultID: e.target.value
    })
    this.props.saveChoice(initData2, this.state.floatMode, this.props.patternType,this.props.answerType,this.props.subIndex,this.props.index2)
  }
  //标签切换
  onChange = (activeKey) => {
    this.setState({ activeKey });
  }
  render() {
    const { data, subIndex, index2 } = this.props;
    const { answer, answerSelect, defaultID, vhOption, floatMode, activeKey } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const answerTextFilter = answer.filter(vo=>vo.text!=="")
    const answerImgFilter = answer.filter(vo=>vo.image!=="")
    return (
      <div className="demon">    
        <h1 className="pb0">
            <span>*</span>{formatMessage(messages.QuestionAnswerTitle)}
        </h1> 
        <Tabs type="card" defaultActiveKey={data.params.imageOptionsSupport=='N'?'2':answerTextFilter.length>0?'2':answerImgFilter.length>0?'1':'1'} onChange={this.onChange} forceRender={false} animated={false} className={data.params.imageOptionsSupport=='N'||data.params.textOptionsSupport=='N'?'singleStemInfo':data.params.imageOptionsSupport=='Y'&&data.params.textOptionsSupport=='Y'?'doubleStemInfo':''}>
            <TabPane tab={formatMessage(messages.SelectionImgAnswerTab)} key="1">
            {data.params.imageOptionsSupport=='Y'&&activeKey=='1'&&<div>
            <div className="addAnswer">
                    <IconButton iconName="icon-add" type="button" text={formatMessage(messages.OptionAddBtn)} className="moreAnswer" onClick={this.addMoreAnswer.bind(this)}/>                
                    {data.params.floatModeSelectable=='Y'&&<FormItem label={''} className="r">
                        {getFieldDecorator('floatModeSelectable'+subIndex+index2+'1', {
                        initialValue: floatMode,
                        rules: [{ required: activeKey=='1'?true:false, message: formatMessage(messages.IsAnswerOptionDisplayed) }],
                        })(
                            <RadioGroup onChange={this.selectSort}>
                                {vhOption.length>0&&vhOption.map((item)=>{
                                    return <Radio value={item.code} key={item.id+subIndex+index2+'1'}>{item.value}</Radio> 
                                })}   
                            </RadioGroup>
                        )}
                    </FormItem>}
                </div>
                <FormItem label={''} className="r">
                    {getFieldDecorator('a_answer'+subIndex+index2+'1', {
                    initialValue: defaultID,
                    rules: [{ required: activeKey=='1'?true:false, message: formatMessage(messages.IsRightAnswerOptionSelected) }],
                    })(
                        <RadioGroup className="a_img" onChange={this.answerOk}>
                        {
                            answer.map((item,index)=>{
                                return <div className="selectOption" key={item.id+subIndex+index2+'1'}>
                                <span className="optionAudio">{answerSelect[index]}:</span>
                                <UpLoadImg
                                        displaySize={data.params.displaySize}
                                        id={item.image}
                                        url={''}
                                        duration={''}
                                        name={''}
                                        uploadImgID={(id,itemID)=>this.saveStemImg(id,item.id)} 
                                        isChoice={true}              
                                    /> 
                                <Radio name="layerID" value={item.id}>{formatMessage(messages.RightAnswerOption)}</Radio>
                                <div className="iconDelete"><IconButton iconName="icon-detele" type="" onClick={(id)=>this.delAnswer(item.id)}/></div></div>
                            })
                        }
                        </RadioGroup>
        
                    )}
                </FormItem>  
                </div>}      
            </TabPane>
            <TabPane tab={formatMessage(messages.SelectionTxtAnswerTab)} key="2">
            {data.params.textOptionsSupport=='Y'&&activeKey=='2'&&<div>
                <div className="addAnswer">
                    <IconButton iconName="icon-add" type="button" text={formatMessage(messages.OptionAddBtn)} className="moreAnswer" onClick={this.addMoreAnswer.bind(this)}/>
               
                    {data.params.floatModeSelectable=='Y'&&<FormItem label={''} className="r">
                        {getFieldDecorator('floatModeSelect'+subIndex+index2+'2', {
                        initialValue: floatMode,
                        rules: [{ required: activeKey=='2'?true:false, message: formatMessage(messages.IsAnswerOptionDisplayed) }],
                        })(
                            <RadioGroup onChange={this.selectSort}>
                                {vhOption.length>0&&vhOption.map((item)=>{
                                    return <Radio value={item.code} key={item.id+subIndex+'2'}>{item.value}</Radio> 
                                })}   
                            </RadioGroup>
                        )}
                    </FormItem>}
                </div>
                <FormItem label={''} className="r">
                    {getFieldDecorator('a_answer'+subIndex+index2+'2', {
                    initialValue: defaultID,
                    rules: [{ required: activeKey=='2'?true:false, message: formatMessage(messages.IsRightAnswerOptionSelected) }],
                    })(
                        <RadioGroup className="a_answer" onChange={this.answerOk} >
                            {
                                answer.map((item,index)=>{
                                    return <div className="selectOption" key={item.id+subIndex+index2+'2'}>
                                    <span className="optionAudio">{answerSelect[index]}</span>
                                    <Input onChange={(e,id)=>this.saveStemText(e,item.id)} value={item.text}/>
                                    <Radio name="layerID" value={item.id} >{formatMessage(messages.RightAnswerOption)}</Radio>
                                    <div className="iconDelete"><IconButton iconName="icon-detele" type="" onClick={(id)=>this.delAnswer(item.id)}/></div></div>
                                })
                            }
                            </RadioGroup>
                    )}
                </FormItem>           
                </div>} 
            </TabPane>            
          </Tabs>
      </div>
    );
  }
}

export default ChoiceControl;
