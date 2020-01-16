/**
 * @Author    tina
 * @DateTime  2018-10-19
 * @copyright 口语半开放题答案配置控件
 */
import React, { Component } from 'react';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import { Input, Tabs, Form, message } from 'antd';
import TextareaClearData from './TextareaClearData';
import IconButton from '../../../../IconButton';
import AddMoreAnswer from '../AddMoreAnswer/api';
import AddKeyWords from './AddKeyWords'
import HalfOpenOralError from './HalfOpenOralError'
import { regularBuilder } from '@/utils/utils';
import './index.less';
const FormItem = Form.Item;
const { TextArea } = Input;
const { TabPane } = Tabs;


const messages = defineMessages({
  ReferenceAnswerLabel: {
    id: 'app.reference.answer.label',
    defaultMessage: '参考答案',
  },
  ReferenceByMachine: {
    id: 'app.reference.by.machine',
    defaultMessage: '机评参考',
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
  TODO_tips: {
    id: 'app.batch.answers.count',
    defaultMessage: '答案已经不能再少了哦！',
  },
});
class HalfOpenOral extends Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 1;
    const referenceAnswerLabel = props.data.params.referenceAnswerLabel ? props.data.params.referenceAnswerLabel : formatMessage(messages.ReferenceAnswerLabel);
    const referenceMachineEvaluationLabel = props.data.params.referenceMachineEvaluationLabel ? props.data.params.referenceMachineEvaluationLabel : formatMessage(messages.ReferenceByMachine);
    const panes = [
      { title: referenceAnswerLabel + '1', content: '', key: 'answer0' }
    ];
    this.newTabIndex2 = 1;
    const panes2 = [
      { title: referenceMachineEvaluationLabel + '1', content: '', key: 'medice0' }
    ];
    this.state = {
      referenceAnswer: [{ key: 'answer0', value: '' }],
      resultAnswer: [],
      machineData: [],
      referenceMachineEvaluation: [{ key: 'medice0', value: '' }],
      activeKey: panes[0].key,
      referenceAnswerLabelInfo: referenceAnswerLabel,
      referenceMachineEvaluationLabelInfo: referenceMachineEvaluationLabel,
      panes,
      activeKey2: panes2[0].key,
      panes2,
      answerType: props.data.name, // 答题类型
      keyWordList: [{text:'',weight:'',exclude:false},{text:'',weight:'',exclude:true}], // 关键词{text:'',weight:'',exclude:false},{text:'',weight:'',exclude:true}
      hintReferenceMachineEvaluation: [],
      errorReferenceMachineEvaluation: [],

    };
  }

  componentWillMount() {
    const { data, showData, subIndex, index2, patternType } = this.props;
    // 渲染数据
    const editData = showData && showData.data
    if (editData && editData.patternType === "NORMAL" && editData.mainQuestion.halfOpenOralQuestionAnswerInfo != null) {
      const reference = [];
      const referenceAnswers = [];
      if (editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer.length > 0) {
        editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer.map((item, index) => {
          if (index !== 0) {
            this.newTabIndex+=1
          }
          const counts = index + 1
          const {referenceAnswerLabelInfo} = this.state;
          reference.push({ title:referenceAnswerLabelInfo + counts, content: item, key: 'answer' + index })
          referenceAnswers.push({ key: 'answer' + index, value: item })
        })
        const {keyWordList} = this.state;
        this.setState({
          panes: reference,
          referenceAnswer: referenceAnswers,
          hintReferenceMachineEvaluation: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
          errorReferenceMachineEvaluation: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
          resultAnswer: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer,
          keyWordList: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords ? editData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords : keyWordList,
        })
      }
      const referenceMachine = [];
      const referenceMachineAnswers = [];
      if (editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.length > 0) {
        editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.map((item, index) => {
          if (index !== 0) {
            this.newTabIndex2+=1
          }
          const counts = index + 1
          const {referenceMachineEvaluationLabelInfo} = this.state
          referenceMachine.push({ title: referenceMachineEvaluationLabelInfo + counts, content: item, key: 'medice' + index })
          referenceMachineAnswers.push({ key: 'medice' + index, value: item })
        })
        const {keyWordList} = this.state;
        this.setState({
          panes2: referenceMachine,
          referenceMachineEvaluation: referenceMachineAnswers,
          hintReferenceMachineEvaluation: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
          errorReferenceMachineEvaluation: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
          machineData: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,
          keyWordList: editData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords ? editData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords :keyWordList,
        })
      }
      // this.props.saveReferenceAnswerInfo(editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer,editData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
    }
    if (editData && editData.patternType === "TWO_LEVEL" && editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo != null) {
      const reference = []
      const referenceAnswers = [];
      if (editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer.length > 0) {
        editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer.map((item, index) => {
          if (index !== 0) {
            this.newTabIndex+=1
          }
          const counts = index + 1
          const {referenceAnswerLabelInfo} = this.state;
          reference.push({ title: referenceAnswerLabelInfo + counts, content: item, key: 'answer' + index })
          referenceAnswers.push({ key: 'answer' + index, value: item })
        })
        const {keyWordList} = this.state;
        this.setState({
          panes: reference,
          referenceAnswer: referenceAnswers,
          hintReferenceMachineEvaluation: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
          errorReferenceMachineEvaluation: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
          resultAnswer: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer,
          keyWordList: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords ? editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords : keyWordList,
        })
      }

      const referenceMachine = []
      const referenceMachineAnswers = [];
      if (editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.length > 0) {
        editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.map((item, index) => {
          if (index !== 0) {
            this.newTabIndex2+=1
          }
          const counts = index + 1
          const {referenceMachineEvaluationLabelInfo} = this.state;
          referenceMachine.push({ title: referenceMachineEvaluationLabelInfo + counts, content: item, key: 'medice' + index })
          referenceMachineAnswers.push({ key: 'medice' + index, value: item })
        })
        const {keyWordList} = this.state;
        this.setState({
          panes2: referenceMachine,
          referenceMachineEvaluation: referenceMachineAnswers,
          hintReferenceMachineEvaluation: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
          errorReferenceMachineEvaluation: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
          machineData: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,
          keyWordList: editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords ? editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords : keyWordList,
        })
      }
      // this.props.saveReferenceAnswerInfo(editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer,editData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
    } else if (editData && editData.patternType === "COMPLEX") {
      if (editData.groups[index2].data.patternType === "TWO_LEVEL" && editData.groups[index2].data.subQuestion[subIndex] && editData.groups[index2].data.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo != null) {
        const childData = editData.groups[index2].data;
        const reference = []
        const referenceAnswers = [];
        if (childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer.length > 0) {
          childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer.map((item, index) => {
            if (index !== 0) {
              this.newTabIndex+=1
            }
            const counts = index + 1
            const {referenceAnswerLabelInfo} = this.state;
            reference.push({ title: referenceAnswerLabelInfo + counts, content: item, key: 'answer' + index })
            referenceAnswers.push({ key: 'answer' + index, value: item })
          })
          const {keyWordList} = this.state;
          this.setState({
            panes: reference,
            referenceAnswer: referenceAnswers,
            hintReferenceMachineEvaluation: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
            resultAnswer: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer,
            keyWordList: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords ? childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords :keyWordList,
          })
        }

        const referenceMachine = []
        const referenceMachineAnswers = [];
        if (childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.length > 0) {
          childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.map((item, index) => {
            if (index !== 0) {
              this.newTabIndex2+=1
            }
            const counts = index + 1
            const {referenceMachineEvaluationLabelInfo} = this.state;
            referenceMachine.push({ title: referenceMachineEvaluationLabelInfo + counts, content: item, key: 'medice' + index })
            referenceMachineAnswers.push({ key: 'medice' + index, value: item })
          })
          const {keyWordList} = this.state;
          this.setState({
            panes2: referenceMachine,
            referenceMachineEvaluation: referenceMachineAnswers,
            hintReferenceMachineEvaluation: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
            machineData: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,
            keyWordList: childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords ? childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords : keyWordList,
          })
        }
        // this.props.saveReferenceAnswerInfo(childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceAnswer,childData.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)

      } else if (editData.groups[index2].data.patternType === "NORMAL" && editData.groups[index2].data.mainQuestion.halfOpenOralQuestionAnswerInfo != null) {
        const childData = editData.groups[index2].data;
        const reference = []
        const referenceAnswers = [];
        if (childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer.length > 0) {
          childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer.map((item, index) => {
            const counts = index + 1
            const {referenceAnswerLabelInfo} = this.state;
            reference.push({ title: referenceAnswerLabelInfo + counts, content: item, key: 'answer' + index })
            referenceAnswers.push({ key: 'answer' + index, value: item })
          })
          const {keyWordList} = this.state;
          this.setState({
            panes: reference,
            referenceAnswer: referenceAnswers,
            hintReferenceMachineEvaluation: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
            resultAnswer: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer,
            keyWordList: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords ? childData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords : keyWordList,
          })
        }
        const referenceMachine = []
        const referenceMachineAnswers = [];
        if (childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.length > 0) {
          childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation.map((item, index) => {
            if (index !== 0) {
              this.newTabIndex2+=1
            }
            const counts = index + 1
            const {referenceMachineEvaluationLabelInfo} = this.state;
            referenceMachine.push({ title: referenceMachineEvaluationLabelInfo + counts, content: item, key: 'medice' + index })
            referenceMachineAnswers.push({ key: 'medice' + index, value: item })

          })
          const {keyWordList} = this.state;
          this.setState({
            panes2: referenceMachine,
            referenceMachineEvaluation: referenceMachineAnswers,
            hintReferenceMachineEvaluation: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation,
            machineData: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,
            keyWordList: childData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords ? childData.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords : keyWordList,
          })
        }
        // this.props.saveReferenceAnswerInfo(childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceAnswer,childData.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation,subIndex,patternType,this.state.answerType)
      }
    }
  }

  // 添加答案
  addAnswer = () => {
    const {panes,referenceAnswerLabelInfo,referenceAnswer} = this.state;
    const activeKey = `answer${this.newTabIndex+=1}`;
    panes.push({ title: referenceAnswerLabelInfo + `${this.newTabIndex}`, content: '', key: activeKey });
    this.setState({ panes, activeKey });
    const arr = referenceAnswer;
    arr.push({ key: activeKey, value: '' })
    console.log(panes)
    this.saveReferenceAnswerInfoData(arr)
    this.setState({
      referenceAnswer: arr,
    })
  }

  // 删除答案
  remove = (targetKey) => {
    const {referenceAnswer} = this.state;
    let {activeKey} = this.state;
    let lastIndex;
    this.state.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = this.state.panes.filter(pane => pane.key !== targetKey);
    if (panes.length === 0) {
      message.warning(formatMessage({id:"app.batch.answers.count",defaultMessage:"答案已经不能再少了哦！"}))
    } else {
      this.newTabIndex = this.newTabIndex - 1;
      if (lastIndex >= 0 && activeKey === targetKey) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key
      }
      
      const arr = referenceAnswer.filter(pane => pane.key !== targetKey);
      console.log(arr)
      arr.map((item, index) => {
        arr[index].key = 'answer' + index
      })
      panes.map((item, index) => {
        panes[index].key = 'answer' + index;
        panes[index].title = formatMessage(messages.ReferenceAnswerLabel) + (index + 1)
      })
      console.log(panes)
      this.saveReferenceAnswerInfoData(arr)
      this.setState({
        referenceAnswer: arr,
      })
      this.setState({ panes, activeKey: 'answer0' });
    }
  }

  // 添加机评
  addAnswer2 = () => {
    const {panes2,referenceMachineEvaluation,referenceMachineEvaluationLabelInfo} = this.state;
    const activeKey2 = `medice${this.newTabIndex2+=1}`;
    panes2.push({ title: referenceMachineEvaluationLabelInfo + `${this.newTabIndex2}`, content: '', key: activeKey2 });
    this.setState({ panes2, activeKey2 });
    const arr = referenceMachineEvaluation;
    arr.push({ key: activeKey2, value: '' })
    this.saveReferenceMachineEvaluationData(arr)
    this.setState({
      referenceMachineEvaluation: arr,
    })
  }

  // 删除机评
  remove2 = (targetKey) => {
    const {referenceMachineEvaluation} = this.state;
    let {activeKey2} = this.state;
    let lastIndex;
    this.state.panes2.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes2 = this.state.panes2.filter(pane => pane.key !== targetKey);
    if (panes2.length === 0) {
      message.warning(formatMessage({id:"app.batch.answers.count",defaultMessage:"答案已经不能再少了哦！"}))
    } else {
      this.newTabIndex2 = this.newTabIndex2 - 1;
      if (lastIndex >= 0 && activeKey2 === targetKey) {
        activeKey2 = panes2[lastIndex].key;
      } else {
        activeKey2 = panes2[0].key;
      }
      const arr = referenceMachineEvaluation.filter(pane => pane.key !== targetKey);
      arr.map((item, index) => {
        arr[index].key = 'medice' + index
      })
      panes2.map((item, index) => {
        panes2[index].key = 'medice' + index;
        panes2[index].title = formatMessage(messages.ReferenceByMachine) + (index + 1)

      })
      console.log(activeKey2)
      this.saveReferenceMachineEvaluationData(arr)
      this.setState({
        referenceMachineEvaluation: arr,
      })
      this.setState({ panes2, activeKey2: 'medice0' });
    }
  } 

  compareData = (x, y) => { // 比较函数
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    } else {
      return 0;
    }
  }

  // 保存参考答案数组数据
  saveReferenceAnswerInfoData = (arr) => {
    const { subIndex, patternType, index2,saveReferenceAnswerInfo } = this.props;
    const arrayList = arr.sort(this.compareData);
    const answerData = [];
    arrayList.map((item) => {
      answerData.push(item.value)
    })
    this.setState({
      resultAnswer: answerData
    })
    const { resultAnswer, machineData, answerType, errorReferenceMachineEvaluation, hintReferenceMachineEvaluation, keyWordList } = this.state
    console.log(keyWordList)
    saveReferenceAnswerInfo(answerData, machineData, subIndex, patternType, answerType, index2, keyWordList, hintReferenceMachineEvaluation, errorReferenceMachineEvaluation)
  }

  // 保存机评数组数据
  saveReferenceMachineEvaluationData = (arr) => {
    const { subIndex, patternType, index2,saveReferenceAnswerInfo } = this.props;
    const arrayList = arr.sort(this.compareData);
    const answerData = [];
    arrayList.map((item) => {
      answerData.push(item.value)
    })
    this.setState({
      machineData: answerData
    })
    const { resultAnswer, machineData, answerType, errorReferenceMachineEvaluation, hintReferenceMachineEvaluation, keyWordList } = this.state
    saveReferenceAnswerInfo(resultAnswer, answerData, subIndex, patternType, answerType, index2, keyWordList, hintReferenceMachineEvaluation, errorReferenceMachineEvaluation)
  }

  saveReferenceAnswer = (value,key) => {
    if(value.trim() === ""){
      this.props.saveClearTrue(true)
    }
    const {referenceAnswer,activeKey,referenceAnswerLabelInfo} = this.state
    const arr = referenceAnswer;
    console.log(key,activeKey)
    arr.map((item, index) => {
      if (item.key === key) {
        arr[index].value = value
      }
    })
    const reference = []
    arr.map((item, index) => {
      const counts = index + 1
      reference.push({ title: referenceAnswerLabelInfo + counts, content: item.value, key: item.key })
    })
    console.log(arr,reference)
    this.setState({
      panes: reference,
      referenceAnswer: arr,
    })
    this.saveReferenceAnswerInfoData(arr)
  }

  saveReferenceMachineEvaluation = (value,key) => {
    if(value.trim() === ""){
      this.props.saveClearTrue(true)
    }
    const { subIndex, patternType } = this.props;
    const {referenceMachineEvaluation,activeKey2,referenceMachineEvaluationLabelInfo} = this.state;
    const arr = referenceMachineEvaluation;
    arr.map((item, index) => {
      if (item.key ===key) {
        arr[index].value = value
      }
    })
    const referenceMachine = []
    arr.map((item, index) => {
      const counts = index + 1
      referenceMachine.push({ title: referenceMachineEvaluationLabelInfo + counts, content: item.value, key: item.key })
    })
    this.setState({
      panes2: referenceMachine,
      referenceMachineEvaluation: arr,
    })

    this.saveReferenceMachineEvaluationData(arr)
  }

  // 标签切换
  onChange = (activeKey) => {
    this.setState({ activeKey });
  }

  onChange2 = (activeKey) => {
    this.setState({ activeKey2: activeKey });
  }

  // 批量设置答案
  addMoreReferenceAnswer = () => {
    const { form } = this.props;
    form.resetFields()
    const { referenceAnswerLabelInfo } = this.state;
    const panes = [];
    const referenceAnswer = [];
    const that = this;
    const countAnswer = panes.length;
    AddMoreAnswer({
      dataSource: {
        title: formatMessage(messages.BatchAnswersEdit)
      },
      callback: (answersInfo,isChecked) => {
        if (answersInfo) {
          this.newTabIndex = 1;
          that.setState({ activeKey: 'answer0' });
          const answerArray = answersInfo.split('|');
          answerArray.map((item, index) => {
            const counts = index
            if (index !== 0) {
              this.newTabIndex+=1
            }
            const num = counts + 1
            panes.push({ title: referenceAnswerLabelInfo + num, content: isChecked?regularBuilder(item):item, key: 'answer' + counts })
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

  // 机评批量设置答案
  addMoreReferenceAnswer2 = () => {
    const { form } = this.props;
    form.resetFields()
    const { referenceMachineEvaluationLabelInfo } = this.state;
    const panes2 = [];
    const referenceMachineEvaluation = []
    const that = this;
    const countAnswer = panes2.length;
    AddMoreAnswer({
      dataSource: {
        title: formatMessage(messages.BatchAnswersEdit)
      },
      callback: (answersInfo,isChecked) => {
        if (answersInfo) {
          this.newTabIndex2 = 1;
          that.setState({ activeKey2: 'medice0' });
          const answerArray = answersInfo.split('|');
          answerArray.map((item, index) => {
            const counts = index + countAnswer
            if (index !== 0) {
              this.newTabIndex2+=1
            }
            const num = counts + 1
            panes2.push({ title: referenceMachineEvaluationLabelInfo + num, content: isChecked?regularBuilder(item):item, key: 'medice' + counts })
            referenceMachineEvaluation.push({ key: 'medice' + counts, value: isChecked?regularBuilder(item):item })

          })
          this.saveReferenceMachineEvaluationData(referenceMachineEvaluation)
          this.setState({
            panes2: panes2,
            referenceMachineEvaluation: referenceMachineEvaluation,
          })
        }
      },
    });
  }

  // 保持关键词
  saveOralKeyWords = (value) => {
    console.log(value)
    const { subIndex, patternType, index2,saveReferenceAnswerInfo } = this.props;
    const { resultAnswer, machineData, answerType, errorReferenceMachineEvaluation, hintReferenceMachineEvaluation } = this.state
     this.setState({
      keyWordList: value
    })
    saveReferenceAnswerInfo(resultAnswer, machineData, subIndex, patternType, answerType, index2, value, hintReferenceMachineEvaluation, errorReferenceMachineEvaluation)
   
  }

  saveReferenceAnswerError = (referenceAnswer, referenceMachineEvaluation) => {
    console.log(referenceAnswer)
    console.log(referenceMachineEvaluation)
    this.setState({
      hintReferenceMachineEvaluation: referenceAnswer,
      errorReferenceMachineEvaluation: referenceMachineEvaluation
    })
    const { subIndex, patternType, index2,saveReferenceAnswerInfo } = this.props;
    const { resultAnswer, machineData, answerType, keyWordList } = this.state
    saveReferenceAnswerInfo(resultAnswer, machineData, subIndex, patternType, answerType, index2, keyWordList, referenceAnswer, referenceMachineEvaluation)
  }

  render() {
    const { index2, subIndex, form, data, showData, patternType,saveClearTrue,evaluationEngineInfo } = this.props;
    const { params: { keywordAndWeight,hintReferenceMachineEvaluation,errorReferenceMachineEvaluation,referenceAnswer,referenceMachineEvaluation,defaultEvaluationEngine } } = data
    const { getFieldDecorator } = form;
    const { keyWordList,referenceAnswerLabelInfo,activeKey,panes,referenceMachineEvaluationLabelInfo,activeKey2,panes2 } = this.state;

     console.log("keyWordList",panes)
    return (
      <div className="demon">
        <div style={{
            display: referenceAnswer==='N'? 'none' : 'inline',           
          }}
        >
          <h1>
            <span>*</span>{referenceAnswerLabelInfo}        
          </h1>
          <Tabs 
            hideAdd
            type="card"
            animated={false}
            onChange={this.onChange}
            className="answerDetail"
            activeKey={activeKey}
          >
            {panes.map(pane => 
              <TabPane tab={pane.title} key={pane.key}>
                <FormItem label={''}>
                  {getFieldDecorator('halfOpenOralQuestionAnswerInfo'+pane.key+index2+subIndex, {
                    initialValue: pane.content,
                    rules: [{ required:referenceAnswer==='REQUIRED'?true:false, message:<FormattedMessage values={{index:pane.title}} {...messages.inputModel} />}],
                  })(
                    <TextareaClearData
                      initvalue={pane.content} 
                      saveClear={(value)=>saveClearTrue(value)}
                      onChange={(value,key)=>this.saveReferenceAnswer(value,pane.key)} 
                      textlabel={pane.title} 
                      autocleaning="Y"
                    /> 
                  )}
                </FormItem>           
              </TabPane>)}             
          </Tabs>
          <div className="operAnswer">
            <IconButton text={formatMessage(messages.BatchAnswersEdit)} iconName="icon-add" type="button" className="answerAddMore" onClick={this.addMoreReferenceAnswer} />
            <IconButton text={formatMessage(messages.AnswerAddbtn)} iconName="icon-add" type="button" className="answerAdd" onClick={this.addAnswer} />
          
            <IconButton text={formatMessage(messages.SelectedAnswerTabDel)} iconName="icon-detele" type="button" className="answerDelete" onClick={(targetKey)=>this.remove(activeKey)} />
          </div> 
        </div> 
        <div style={{
        display: referenceMachineEvaluation==='N'? 'none' : 'inline',           
      }}> 
          <h1>
            <span
              style={{
                display: referenceMachineEvaluation==='N'? 'none' : 'inline',           
              }}
            >*
            </span>
            {referenceMachineEvaluationLabelInfo}        
          </h1>     
          <Tabs  
            hideAdd
            type="card"
            animated={false}
            className="answerDetail"
            onChange={this.onChange2}
            activeKey={activeKey2}
          >
            {panes2.map(pane =>
              <TabPane tab={pane.title} key={pane.key}>
                <FormItem label={''}>
                  {getFieldDecorator('halfOpenOralQuestionAnswerInfo'+pane.key+index2+subIndex, {
                    initialValue: pane.content,
                    rules: [{ required:referenceMachineEvaluation==='REQUIRED'?true:false, message:<FormattedMessage values={{index:pane.title}} {...messages.inputModel} />}],
                  })(
                    <TextareaClearData 
                      initvalue={pane.content} 
                      saveClear={(value)=>saveClearTrue(value)}
                      onChange={(value,key)=>this.saveReferenceMachineEvaluation(value,pane.key)} 
                      textlabel={pane.title} 
                      autocleaning="true"
                    /> 
                  )}
                </FormItem>           
              </TabPane>)}             
          </Tabs>
          <div className="operAnswer">
            <IconButton text={formatMessage(messages.BatchAnswersEdit)} iconName="icon-add" type="button" className="answerAddMore" onClick={this.addMoreReferenceAnswer2}/>
            <IconButton text={formatMessage(messages.AnswerAddbtn)} iconName="icon-add" type="button" className="answerAdd" onClick={this.addAnswer2} />
            
            <IconButton text={formatMessage(messages.SelectedAnswerTabDel)} iconName="icon-detele" type="button" className="answerDelete" onClick={(targetKey)=>this.remove2(this.state.activeKey2)}/>
          </div>
          {(errorReferenceMachineEvaluation==='Y'||hintReferenceMachineEvaluation==='Y')&&
          <HalfOpenOralError 
            data={data} key={'HALF_OPEN_ORAL'+subIndex+index2}  
            onlyKey={subIndex+index2}
            saveReferenceAnswerInfo={(referenceAnswer,referenceMachineEvaluation)=>this.saveReferenceAnswerError(referenceAnswer,referenceMachineEvaluation)}  
            subIndex={subIndex}
            saveClearTrueError={(value)=>saveClearTrue(value)}
            patternType={patternType}
            showData={showData}
            data={data}
            index2={index2}
            form={form}
          />}
          {evaluationEngineInfo && evaluationEngineInfo[0].params.defaultEvaluationEngine ===  "eval.semi.en" ?  null : keywordAndWeight==='Y'&&
          <AddKeyWords 
            saveKeyWords={(value)=>this.saveOralKeyWords(value)} 
            saveClear={(value)=>saveClearTrue(value)}
            keyWordList={keyWordList} 
            form={form}  
            subTab={index2+subIndex}
          />}
        </div>
      </div>
    );
  }
}

export default HalfOpenOral;
