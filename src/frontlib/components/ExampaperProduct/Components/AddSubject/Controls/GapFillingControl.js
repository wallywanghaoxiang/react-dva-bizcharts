/**
 * @Author    tina
 * @DateTime  2018-10-23
 * @copyright 填空题答案配置控件
 */
import React, { Component } from 'react';
import { Input, Tabs, Radio, Form, message } from 'antd';
import './index.less';
import IconButton from '../../../../IconButton';
const { TextArea } = Input;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import { queryVhOption } from '@/services/api';
import AddMoreAnswer from '../AddMoreAnswer/api';
import { regularBuilder } from '@/utils/utils';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
const messages = defineMessages({
  ReferenceAnswerLabel: {
    id: 'app.reference.answer.label',
    defaultMessage: '参考答案',
  },
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
  BatchAnswersEditIntroTips: {
    id: 'app.batch.answers.edit.intro.tips',
    defaultMessage: '多个答案使用“|”分隔!',
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
class GapFillingControl extends Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    const panes = [
      { title: formatMessage(messages.ReferenceAnswerLabel) + '1', content: '', key: 'answer0' }
    ];
    var defaultEvaluationEngine = ''
    //渲染数据     
    const { showData, index2, subIndex} = this.props;
    let editData = showData && showData.data
    const mainIndex = index2 == 'all' ? '1' : index2;
    if (editData && editData.patternType == "NORMAL" && editData.mainQuestion.gapFillingQuestionAnswerInfo) {
      defaultEvaluationEngine = editData.mainQuestion.gapFillingQuestionAnswerInfo.gapFloatMode
    } else if (editData && editData.patternType == "TWO_LEVEL" && editData.subQuestion[subIndex].gapFillingQuestionAnswerInfo) {
      defaultEvaluationEngine = editData.subQuestion[subIndex].gapFillingQuestionAnswerInfo.gapFloatMode
    } else if (editData && editData.patternType == "COMPLEX" && editData.groups[mainIndex].data) {
      if (editData.groups[mainIndex].data.patternType == "NORMAL" && editData.groups[mainIndex].data.mainQuestion.gapFillingQuestionAnswerInfo != null) {
        defaultEvaluationEngine = editData.groups[index2].data.mainQuestion.gapFillingQuestionAnswerInfo.gapFloatMode
      }
      if (editData.groups[mainIndex].data.patternType == "TWO_LEVEL" && editData.groups[mainIndex].data.subQuestion[subIndex].gapFillingQuestionAnswerInfo != null) {
        defaultEvaluationEngine = editData.groups[index2].data.subQuestion[subIndex].gapFillingQuestionAnswerInfo.gapFloatMode

      }
    }
    this.state = {
      visible: true,
      gapMode: props.data.params.gapMode,
      gapFloatMode: defaultEvaluationEngine ? defaultEvaluationEngine : props.data.params.gapFloatModeSelectable,
      activeKey: panes[0].key,
      panes,
      referenceAnswer: [{ key: 'answer0', value: '' }],
      resultAnswer: [],
      answerType: props.data.name, //答题类型
      vhOption: []

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
    const { data, showData, subIndex, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    //渲染数据
    const editData = showData && showData.data
    if (editData && editData.patternType == "NORMAL" && editData.mainQuestion.gapFillingQuestionAnswerInfo != null) {
      const reference = [];
      const referenceAnswer = [];
      editData.mainQuestion.gapFillingQuestionAnswerInfo.answers.map((item, index) => {
        if (index != 0) {
          this.newTabIndex++
        }
        const counts = index + 1
        reference.push({ title: formatMessage(messages.ReferenceAnswerLabel) + counts, content: item.text, key: 'answer' + index })
        referenceAnswer.push({ key: 'answer' + index, value: item.text })
      })
      this.setState({
        panes: reference,
        referenceAnswer: referenceAnswer,
        resultAnswer: editData.mainQuestion.gapFillingQuestionAnswerInfo.answers
      })
    } else if (editData && editData.patternType == "TWO_LEVEL" && editData.subQuestion[subIndex].gapFillingQuestionAnswerInfo != null) {
      const reference = []
      const referenceAnswer = [];
      editData.subQuestion[subIndex].gapFillingQuestionAnswerInfo.answers.map((item, index) => {
        if (index != 0) {
          this.newTabIndex++
        }
        const counts = index + 1
        reference.push({ title: formatMessage(messages.ReferenceAnswerLabel) + counts, content: item.text, key: 'answer' + index })
        referenceAnswer.push({ key: 'answer' + index, value: item.text })
      })

      this.setState({
        panes: reference,
        referenceAnswer: referenceAnswer,
        resultAnswer: editData.subQuestion[subIndex].gapFillingQuestionAnswerInfo.answers
      })
    } else if (editData && editData.patternType == "COMPLEX") {
      if (editData.groups[mainIndex].data.patternType == "TWO_LEVEL" && editData.groups[mainIndex].data.subQuestion[subIndex].gapFillingQuestionAnswerInfo != null) {
        const childData = editData.groups[mainIndex].data;
        const reference = []
        const referenceAnswer = [];
        childData.subQuestion[subIndex].gapFillingQuestionAnswerInfo && childData.subQuestion[subIndex].gapFillingQuestionAnswerInfo.answers.map((item, index) => {
          if (index != 0) {
            this.newTabIndex++
          }
          const counts = index + 1
          reference.push({ title: formatMessage(messages.ReferenceAnswerLabel) + counts, content: item.text, key: 'answer' + index })
          referenceAnswer.push({ key: 'answer' + index, value: item.text })
        })

        this.setState({
          panes: reference,
          referenceAnswer: referenceAnswer,
          resultAnswer: childData.subQuestion[subIndex].gapFillingQuestionAnswerInfo.answers
        })
      }
      if (editData.groups[mainIndex].data.patternType == "NORMAL" && editData.groups[mainIndex].data.mainQuestion.gapFillingQuestionAnswerInfo != null) {
        const childData = editData.groups[mainIndex].data;
        const reference = []
        const referenceAnswer = [];
        childData.mainQuestion.gapFillingQuestionAnswerInfo.answers.map((item, index) => {
          if (index != 0) {
            this.newTabIndex++
          }
          const counts = index + 1
          reference.push({ title: formatMessage(messages.ReferenceAnswerLabel) + counts, content: item.text, key: 'answer' + index })
          referenceAnswer.push({ key: 'answer' + index, value: item.text })
        })

        this.setState({
          panes: reference,
          referenceAnswer: referenceAnswer,
          resultAnswer: childData.mainQuestion.gapFillingQuestionAnswerInfo.answers
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const{grapFillingData} = nextProps;  
    console.log(grapFillingData) 
    console.log(this.props.grapFillingData) 
    if(grapFillingData!=this.props.grapFillingData) {
      this.setState({gapFloatMode:grapFillingData})
    }
}

  // 
  compareData = (x, y) => { //比较函数
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    } else {
      return 0;
    }
  }

  //保存参考答案数组数据
  saveReferenceAnswerInfoData = (arr, modValue) => {
    const { subIndex, patternType, index2 } = this.props;
    const mainIndex = index2 == 'all' ? '1' : index2
    const arrayList = arr.sort(this.compareData);
    const answerData = [];
    arrayList.map((item) => {
      answerData.push({ "text": item.value })
    })
    this.setState({
      resultAnswer: answerData
    })
    this.props.saveReferenceAnswerInfo(answerData, subIndex, patternType, this.state.answerType, this.state.gapMode, modValue ? modValue : this.state.gapFloatMode, index2)
  }

  saveReferenceAnswer = (e) => {
    const arr = this.state.referenceAnswer;
    arr.map((item, index) => {
      if (item.key == this.state.activeKey) {
        item.value = e.target.value
      }
    })
    const reference = []
    arr.map((item, index) => {
      const counts = index + 1
      reference.push({ title: formatMessage(messages.ReferenceAnswerLabel) + counts, content: item.value, key: item.key })
    })
    this.setState({
      panes: reference,
      referenceAnswer: arr,
    })
    this.saveReferenceAnswerInfoData(arr)

  }

  addAnswer = () => {
    const panes = this.state.panes;
    this.newTabIndex = this.newTabIndex + 1
    const activeKey = `answer${this.newTabIndex}`;
    panes.push({ title: formatMessage(messages.ReferenceAnswerLabel) + `${this.newTabIndex+1}`, content: '', key: activeKey });
    this.setState({ panes, activeKey });
    const arr = this.state.referenceAnswer;
    arr.push({ key: activeKey, value: '' })
    this.saveReferenceAnswerInfoData(arr)
  }

  remove = (targetKey) => {
    let activeKey = this.state.activeKey;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (panes.length == 0) {
      message.warning(formatMessage({id:"app.batch.answers.count",defaultMessage:"答案已经不能再少了哦！"}))
    } else {
      this.newTabIndex = this.newTabIndex - 1
      if (lastIndex >= 0 && activeKey === targetKey) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
      const arr = this.state.referenceAnswer.filter(pane => pane.key !== targetKey);
      arr.map((item, index) => {
        item.key = 'answer' + index
      })
      panes.map((item, index) => {
        item.key = 'answer' + index;
        item.title = formatMessage(messages.ReferenceAnswerLabel) + (index + 1)
      })
      this.saveReferenceAnswerInfoData(arr)
      this.setState({
        referenceAnswer: arr,
      })
      this.setState({ panes, activeKey: 'answer0' });
    }
  }

  //标签切换
  onChange = (activeKey) => {
    this.setState({ activeKey });
  }

  //排列方式
  selectSort = (e) => {
    this.setState({
      gapFloatMode: e.target.value
    })  
    this.saveReferenceAnswerInfoData(this.state.referenceAnswer, e.target.value)
  }

  //批量设置答案
  addMoreReferenceAnswer = () => {
    const { form } = this.props;
    form.resetFields()
    let that = this;
    let panes = [];
    let referenceAnswer = [];
    AddMoreAnswer({
      dataSource: {
        title: formatMessage(messages.BatchAnswersEdit)
      },
      callback: (answersInfo,isChecked) => {
        that.setState({ activeKey: 'answer0' });
        if (answersInfo) {
          this.newTabIndex = 0;
          const answerArray = answersInfo.split('|');
          answerArray.map((item, index) => {
            const counts = index
            if (index != 0) {
              this.newTabIndex++
            }
            let num = counts + 1
            panes.push({ title: formatMessage(messages.ReferenceAnswerLabel) + num, content: isChecked?regularBuilder(item):item, key: 'answer' + counts })
            referenceAnswer.push({ key: 'answer' + counts, value: isChecked?regularBuilder(item):item })
          })
          this.saveReferenceAnswerInfoData(referenceAnswer)
          this.setState({
            panes: panes,
            referenceAnswer: referenceAnswer,
          })
        }
      },
    });
  }
  
  render() {
    const { data,grapFillingData} = this.props;
    const { index2, subIndex, form } = this.props;
    const { getFieldDecorator } = form;
    const { vhOption, gapFloatMode } = this.state;
    console.log(gapFloatMode)
    const tipInput = (title) => {
      return <FormattedMessage values={{index:title}} {...messages.inputModel} ></FormattedMessage>;
    }

    return (
      <div className="demon">   
         {data.params.gapFloatModeSelectable=='Y'&&<div>
         <h1>
        {formatMessage({id:"app.text.displayed",defaultMessage:"排列方式"})}  
        </h1>
           <RadioGroup className="r" onChange={this.selectSort}  value={gapFloatMode}>
                          {vhOption.length>0&&vhOption.map((item)=>{
                            return <Radio value={item.code} key={item.id}>{item.value}</Radio> 
                        })} 
                    </RadioGroup></div>}  
        <h1>
        <span>*</span>{formatMessage(messages.ReferenceAnswerLabel)}
        </h1> 
        <Tabs  hideAdd
            type="card"
            className="answerDetail"
            animated={false}
            onChange={this.onChange}
            activeKey={this.state.activeKey}>
            {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
              <FormItem label={''}>
                {getFieldDecorator('gapFillingQuestionAnswerInfo'+pane.key+index2+subIndex, {
                  initialValue: pane.content,
                  rules: [{ required: true, message: tipInput(pane.title)}],
                })(
                  <TextArea onChange={(e)=>this.saveReferenceAnswer(e) } autosize={{ minRows: 3, maxRows: 5 }}/>
                )}
              </FormItem>
            {//<TextArea autosize={{ minRows: 3, maxRows: 5 }} onChange={this.saveReferenceAnswer } value={pane.content}/>
            }
            </TabPane>)}             
          </Tabs>
          <div className="operAnswer">
            <IconButton text={formatMessage(messages.BatchAnswersEdit)} iconName="icon-add" type="button" className="answerAddMore" onClick={this.addMoreReferenceAnswer}/>
            <IconButton text={formatMessage(messages.AnswerAddbtn)} iconName="icon-add" type="button" className="answerAdd" onClick={this.addAnswer}/>            
            <IconButton text={formatMessage(messages.SelectedAnswerTabDel)} iconName="icon-detele" type="button" className="answerDelete" onClick={(targetKey)=>this.remove(this.state.activeKey)}/>
          </div>
         
      </div>
    );
  }
}

export default GapFillingControl;
