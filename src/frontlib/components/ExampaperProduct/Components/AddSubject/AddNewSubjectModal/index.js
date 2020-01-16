import React, { Component } from 'react';
import router from 'umi/router'
import { Modal, Tabs, Form, message } from 'antd';
import StemAudioControl from '../Controls/StemAudioControl';
import StemVideoControl from '../Controls/StemVideoControl';
import StemAudioControl2 from '../Controls/StemAudioControl2';
import StemAudioTextControl from '../Controls/StemAudioTextControl';
import StemVideoTextControl from '../Controls/StemVideoTextControl';
import StemInfoControl from '../Controls/StemInfoControl';
import SubQuestionStemAudio from '../Controls/SubQuestionStemAudio';
import SubQuestionStemAudio2 from '../Controls/SubQuestionStemAudio2';
import SubQuestionStemAudioText from '../Controls/SubQuestionStemAudioText';
import ClosedOralControl from '../Controls/ClosedOralControl';
import SubQuestionStemInfo from '../Controls/SubQuestionStemInfo';
import EvaluationEngine from '../Controls/EvaluationEngine';
import HalfOpenOral from '../Controls/HalfOpenOral';
import GapFillingControl from '../Controls/GapFillingControl';
import OpenOralControl from '../Controls/OpenOralControl';
import GuideSuffixTextControl from '../Controls/GuideSuffixTextControl';
import GuideSuffixAudioControl from '../Controls/GuideSuffixAudioControl';
import GuidePrefixTextControl from '../Controls/GuidePrefixTextControl';
import GuidePrefixAudioControl from '../Controls/GuidePrefixAudioControl';
import GuidePrefixImageControl from '../Controls/GuidePrefixImageControl';
import GuideSuffixImageControl from '../Controls/GuideSuffixImageControl';
import GuideMiddleImageControl from '../Controls/GuideMiddleImageControl';
import GuideMiddleTextControl from '../Controls/GuideMiddleTextControl';
import GuideMiddleAudioControl from '../Controls/GuideMiddleAudioControl';
import ChoiceControl from '../Controls/ChoiceControl';
import ChooseModeSelectControl from '../Controls/ChooseModeSelectControl';
import AnswerExplanation from '../Controls/AnswerExplanation';
import TagSubject from '../Controls/TagSubject';
import SwapAskAnswerControl from '../Controls/SwapAskAnswerControl';
import { createQuestion, updateQuestion } from '@/services/api';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { QUESTION_VERSION,isUsePlugin} from '@/frontlib/utils/utils';
import './index.less';
const { TabPane } = Tabs;
const FormItem = Form.Item;
let chooseModeState = true
//控制封闭题型的回车清洗

let allowEnterStemInfo = false
let allowEnterSubStemInfo = false
@Form.create()
class AddNewSubjectModal extends Component {
  constructor(props) {
    super(props);
    const questionData = props.dataSource.questionData
    const { dataSource } = props;
    const initDataUnits = dataSource.initData && dataSource.initData.data.mainQuestion
    this.state = {
      visible: true,
      patternType: props.dataSource.patternType, // 题型类型 （普通题型：NORMAL | 二层题型：TWO_LEVEL | 复合题型：COMPLEX）
      stemText: initDataUnits && initDataUnits.stemText ? initDataUnits.stemText : '', // 题干文本
      stemImage: initDataUnits && initDataUnits.stemImage ? initDataUnits.stemImage : '', // 题干图片ID ,
      stemAudio: initDataUnits && initDataUnits.stemAudio ? initDataUnits.stemAudio : '', // 题干音频ID 
      stemAudioTime: initDataUnits && initDataUnits.stemAudioTime ? initDataUnits.stemAudioTime : 0, // 题干音频时间
      stemAudio2: initDataUnits && initDataUnits.stemAudio2 ? initDataUnits.stemAudio2 : '', // 题干音频ID 
      stemAudioTime2: initDataUnits && initDataUnits.stemAudioTime2 ? initDataUnits.stemAudioTime2 : 0, // 题干音频时间
      stemAudioText: initDataUnits && initDataUnits.stemAudioText ? initDataUnits.stemAudioText : '', // 题干音频文本
      stemVideo: initDataUnits && initDataUnits.stemVideo ? initDataUnits.stemVideo : '', // 题干视频ID ,
      stemVideoTime: initDataUnits && initDataUnits.stemVideoTime ? initDataUnits.stemVideoTime : 0, //题干视频时间
      stemVideoText:initDataUnits && initDataUnits.stemVideoText ? initDataUnits.stemVideoText : '',
      stemType:'', //题干类型
      mainIndex: 0, //大题题序 ,
      questionIndex: dataSource.masterData.staticIndex.questionIndex, // 题目原始题序 ,
      answerType: initDataUnits && initDataUnits.answerType ? initDataUnits.answerType : '', // 答题类型
      guidePrefixAudio: initDataUnits && initDataUnits.guidePrefixAudio ? initDataUnits.guidePrefixAudio : '',
      guidePrefixAudioTime: initDataUnits && initDataUnits.guidePrefixAudioTime ? initDataUnits.guidePrefixAudioTime : '',
      guidePrefixText: initDataUnits && initDataUnits.guidePrefixText ? initDataUnits.guidePrefixText : '',
      guideMiddleText: initDataUnits && initDataUnits.guideMiddleText ? initDataUnits.guideMiddleText : '',
      guidePrefixImage: initDataUnits && initDataUnits.guidePrefixImage ? initDataUnits.guidePrefixImage : '',
      guideMiddleImage: initDataUnits && initDataUnits.guideMiddleImage ? initDataUnits.guideMiddleImage : '',
      guideSuffixText: initDataUnits && initDataUnits.guideSuffixText ? initDataUnits.guideSuffixText : '', // 题后文本
      guideSurfixAudio: initDataUnits && initDataUnits.guideSuffixAudio ? initDataUnits.guideSuffixAudio : '', // 题后音频ID
      guideMiddleAudio: initDataUnits && initDataUnits.guideMiddleAudio ? initDataUnits.guideMiddleAudio : '', // 中间音频ID
      guideSurfixAudioTime: initDataUnits && initDataUnits.guideSuffixAudioTime ? initDataUnits.guideSuffixAudioTime : 0, // 题后音频时间
      guideMiddleAudioTime: initDataUnits && initDataUnits.guideMiddleAudioTime ? initDataUnits.guideMiddleAudioTime : 0, // 中间音频时间
      guideSuffixImage: initDataUnits && initDataUnits.guideSuffixImage ? initDataUnits.guideSuffixImage : '',
      choiceQuestionAnswerInfo: initDataUnits && initDataUnits.choiceQuestionAnswerInfo ? initDataUnits.choiceQuestionAnswerInfo : {}, // 选择题
      closeOralQuestionAnswerInfo: initDataUnits && initDataUnits.closeOralQuestionAnswerInfo ? initDataUnits.closeOralQuestionAnswerInfo : {}, // 口语封闭题答案 , 
      stemAudioTextStatus: false,
      subStemAudioTextStatus: false,
      answerExplanation: initDataUnits && initDataUnits.answerExplanation ? initDataUnits.answerExplanation : '', // 解析
      evaluationEngineInfo: initDataUnits && initDataUnits.evaluationEngineInfo ? initDataUnits.evaluationEngineInfo : {}, // 评分引擎
      halfOpenOralQuestionAnswerInfo: initDataUnits && initDataUnits.halfOpenOralQuestionAnswerInfo ? initDataUnits.halfOpenOralQuestionAnswerInfo : {}, // 口语半开放题答案 //普通题型数据-----
      gapFillingQuestionAnswerInfo: initDataUnits && initDataUnits.gapFillingQuestionAnswerInfo ? initDataUnits.gapFillingQuestionAnswerInfo : {}, // 填空题答案配置控件
      openOralQuestionAnswerInfo: initDataUnits && initDataUnits.openOralQuestionAnswerInfo ? initDataUnits.openOralQuestionAnswerInfo : {}, // 口语开放题答案配置控件
      grapFillingData:'',
      // 二级题型数据
      subQuestion: [],
      group: [],
      difficultLevel: dataSource.initData ? dataSource.initData.difficultLevel : '',
      checkAbility: dataSource.initData ? dataSource.initData.checkAbility : '',
      referenceTextMark: [],
      allowEnter:'N',
      checkClear:'',
      cancelLoading:true
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    const questions = dataSource.masterData.mains[dataSource.masterData.staticIndex.mainIndex].questions
    console.log("组件渲染数据")
    console.log(dataSource)
    console.log("--------------")
    const subs = questions[dataSource.masterData.staticIndex.questionIndex].subs
    this.setState({
      mainIndex: dataSource.masterData.staticIndex.mainIndex - 1, // 大题题序 ,
      questionIndex: dataSource.masterData.staticIndex.questionIndex, // 题目原始题序 ,
    })
    let smallStem = [],
      groupChild = []
    if (this.state.patternType == 'TWO_LEVEL' && subs.length > 0) {
      subs.map((item, index) => {
        if (dataSource.initData && dataSource.initData.data.subQuestion.length == subs.length) {
          smallStem.push(dataSource.initData.data.subQuestion[index])
        } else {
          smallStem.push({})
        }
      })
      console.log(smallStem)
      this.setState({
        subQuestion: smallStem
      })
    }
    if (this.state.patternType == 'COMPLEX') {
      const { dataSource } = this.props;
      const questionData = dataSource.questionData.structure.groups;
      console.log(dataSource.initData)
      questionData.map((item, index) => {
        if (item.structure.patternType == 'TWO_LEVEL') {
          questions[index].subs.map((item, index2) => {
            if (dataSource.initData && dataSource.initData.data.groups[index].data.subQuestion) {
              smallStem.push(dataSource.initData.data.groups[index].data.subQuestion[index2])
            } else { smallStem.push({}) }
          })
          console.log(smallStem)
          groupChild.push({
            "id": dataSource.initData &&dataSource.initData.data.groups[index].id,
            "data": {
              "id": dataSource.initData &&dataSource.initData.data.groups[index].data.id,
              "subjectiveAndObjective":item.structure.subjectiveAndObjective ? item.structure.subjectiveAndObjective : '',
              "patternType": item.structure.patternType,
              "mainQuestion": dataSource.initData && dataSource.initData.data.groups[index].data.mainQuestion ? dataSource.initData && dataSource.initData.data.groups[index].data.mainQuestion : {},
              "subQuestion": smallStem
            }
          })
          smallStem = []
        } else {
          if (dataSource.initData && dataSource.initData.data.groups[index].data.mainQuestion) {
            groupChild.push({
              "id":dataSource.initData &&dataSource.initData.data.groups[index].id,
              "data": {
                "subjectiveAndObjective":item.structure.subjectiveAndObjective ? item.structure.subjectiveAndObjective : '',
                "patternType": item.structure.patternType,
                "mainQuestion": dataSource.initData.data.groups[index].data.mainQuestion,
                "id": dataSource.initData &&dataSource.initData.data.groups[index].data.id
              }
            })
          } else {
            groupChild.push({
              "id":dataSource.initData &&dataSource.initData.data.groups[index].id,
              "data": {
                "subjectiveAndObjective":item.structure.subjectiveAndObjective ? item.structure.subjectiveAndObjective : '',
                "patternType": item.structure.patternType,
                "mainQuestion": {},
                "id": dataSource.initData &&dataSource.initData.data.groups[index].data.id
              }
            })
          }
        }
      })
      this.setState({
        group: groupChild
      })
    }
  }

  savePlugin(subQuestions){
    this.setState({
      subQuestion: subQuestions
    })
  }

  onHandleCancel = () => {
    const { checkClear } = this.state;
    console.log(checkClear)
    this.setState({
      cancelLoading:false
    })
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };

  onHandleOK = () => {
    const { dataSource, form } = this.props;
    const { checkClear } = this.state;
    console.log(checkClear)
    if(checkClear===false) {
      message.warning(formatMessage({id:"app.message.checkClear",defaultMessage:"您还有未清洗的数据，请耐心等待哦！"}))
      return;
    }
    form.resetFields();
    form.validateFields((err, values) => {
      let arr = '';
        for (var index in values){
          arr+=values[index]                  
      }
      if (err) {
        message.warning(formatMessage({id:"app.message.validateFields",defaultMessage:"您还有未填写的部分，请耐心检查哦！"}))
        return;
      } else {
        if(arr.indexOf('.mp3')>-1) {         
          message.warning(formatMessage({id:"app.message.failmp3",defaultMessage:"音频还没有上传成功哦，请耐心等待！"}))
          return;
        }
        const initData = dataSource.initData;
        // 添加题目
        let params = {
          "dataVersion" :QUESTION_VERSION,
          "paperId": dataSource.paperID ? dataSource.paperID : '',
          "replierId": localStorage.getItem('specialistId'),
          "question": {
            "id": initData && initData.id ? initData.id : '',
            "questionPatternId": dataSource.questionData.id,
            // "code": "",
            // "publishStatus": "",
            "questionTime": 0,
            // "questionStatus": "",
            // "annual": "",
            // "tags": "",
            // "paperScope": "",
            // "textbookId": "",
            // "grade": "",
            // "volumn": "",
            // "unitId": "",
            // "hasExamination": "",
            // "contentTeamId": "",
            // "producerId": "",
            // "verifierId": "",
            "difficultLevel": this.state.difficultLevel,
            "checkAbility": this.state.checkAbility
          },
          "mainOrderIndex": this.state.mainIndex,
          "rawOrderIndex": this.state.patternType == "COMPLEX" ? 0 : this.state.questionIndex, // 复合写死0
          "questions": {
            "data": {
              "patternType": this.state.patternType,
              "subjectiveAndObjective":dataSource.questionData.structure.subjectiveAndObjective ? dataSource.questionData.structure.subjectiveAndObjective : '',
              "mainQuestion": {
                "stemType":this.state.stemType,
                "stemText": this.state.stemText,
                "stemImage": this.state.stemImage,
                "stemAudio": this.state.stemAudio,
                "stemAudioTime": this.state.stemAudioTime,
                "stemAudio2": this.state.stemAudio2,
                "stemAudioTime2": this.state.stemAudioTime2,
                "stemAudioText": this.state.stemAudioText,
                "stemVideo": this.state.stemVideo,
                "stemVideoText": this.state.stemVideoText,
                "stemVideoTime": this.state.stemVideoTime,
                "guidePrefixText": this.state.guidePrefixText,
                "guidePrefixImage": this.state.guidePrefixImage,
                "guidePrefixAudio": this.state.guidePrefixAudio,
                "guidePrefixAudioTime": this.state.guidePrefixAudioTime,
                "guideSuffixText": this.state.guideSuffixText,
                "guideSuffixImage": this.state.guideSuffixImage,
                "guideSuffixAudio": this.state.guideSurfixAudio,
                "guideSuffixAudioTime": this.state.guideSurfixAudioTime,
                "guideMiddleText": this.state.guideMiddleText,
                "guideMiddleImage": this.state.guideMiddleImage,
                "guideMiddleAudio": this.state.guideMiddleAudio,
                "guideMiddleAudioTime": this.state.guideMiddleAudioTime,
                "answerType": this.state.answerType, // 答题类型
                "choiceQuestionAnswerInfo": this.state.choiceQuestionAnswerInfo,
                "gapFillingQuestionAnswerInfo": this.state.gapFillingQuestionAnswerInfo, // 填空题答案配置
                "closeOralQuestionAnswerInfo": this.state.closeOralQuestionAnswerInfo, // 口语封闭题答案配置
                "openOralQuestionAnswerInfo": this.state.openOralQuestionAnswerInfo, // 口语开放题答案
                "halfOpenOralQuestionAnswerInfo": this.state.halfOpenOralQuestionAnswerInfo, // 口语半开放题答案配置
                "evaluationEngineInfo": this.state.evaluationEngineInfo,
                "answerExplanation": this.state.answerExplanation, // 解析配置

              },
              "subQuestion": this.state.subQuestion,
              "groups": this.state.group
            },
            "id": "",
            "code": "",
            "questionPatternId": dataSource.questionData.id,
            "mainOrderIndex": this.state.mainIndex,
            "rawOrderIndex": this.state.questionIndex,
            "relationType": ""
          }
        }
        if (this.state.patternType == 'COMPLEX') {
          params.questions.data.groups.map((item, index) => {
            if (item.data.patternType == 'TWO_LEVEL') {
              item.data.subQuestion.map((vo, index2) => {
                if (vo.ChooseModeSelect == '2') {
                  params.questions.data.groups[index].data.subQuestion[index2].subQuestionStemAudio = ''
                  params.questions.data.groups[index].data.subQuestion[index2].subQuestionStemAudioTime = ''
                  params.questions.data.groups[index].data.subQuestion[index2].subQuestionStemAudio2 = ''
                  params.questions.data.groups[index].data.subQuestion[index2].subQuestionStemAudioTime2 = ''
                }
                if (vo.ChooseModeSelect == '3') {
                  params.questions.data.groups[index].data.subQuestion[index2].subQuestionStemText = ''
                  params.questions.data.groups[index].data.subQuestion[index2].subQuestionStemImage = ''
                }
              })
            }

          })
        } else {
          params.questions.data.subQuestion.map((item, index) => {
            if (item.ChooseModeSelect == '2') {
              params.questions.data.subQuestion[index].subQuestionStemAudio = ''
              params.questions.data.subQuestion[index].subQuestionStemAudioTime = ''
              params.questions.data.subQuestion[index].subQuestionStemAudio2 = ''
              params.questions.data.subQuestion[index].subQuestionStemAudioTime2 = ''
            }
            if (item.ChooseModeSelect == '3') {
              params.questions.data.subQuestion[index].subQuestionStemText = ''
              params.questions.data.subQuestion[index].subQuestionStemImage = ''
            }
          })
        }
        console.log(params)
        if (initData && initData.id) { // 编辑题目
          updateQuestion(params).then((res) => {
            if(res.responseCode!=='200'){
              message.warning(res.data);
              if(res.responseCode==='464') {
                router.push('/task')
              }
            } else {
            this.props.callback(params);
            }
          }).catch(err => {
            console.log(err);
          });
        } else {
          console.log(params)
          createQuestion(params).then((res) => {
            if(res.responseCode!=='200'){
              message.warning(res.data);
              if(res.responseCode==='464') {
                router.push('/task')
              }
            } else {
              this.props.callback(params);
            }            
          }).catch(err => {
            console.log(err);
          });
        }
        this.props.onClose();
        this.setState({
          visible: false,
        });
      }
      form.resetFields();
      this.setState({ visible: false });
    });

  };

  // 保存题干文本
  saveStem = (value, index2,allowEnter,vo) => {
    const {group,stemAudioTextStatus,stemAudioText,patternType} = this.state;
    const {params:{stemType}} = vo
    console.log(stemType)
    const groupData = JSON.parse(JSON.stringify(group));
    if (patternType === 'COMPLEX' && index2 === 'all') {
      groupData.map((item) => {
        item.data.mainQuestion.stemType = stemType;
        item.data.mainQuestion.stemText = value;
        item.data.mainQuestion.allowEnter = allowEnter;
        item.data.mainQuestion.stemImage = ''
        item.data.mainQuestion.stemAudioText = stemAudioTextStatus ? value : stemAudioText;
      })
    }
    if (index2 !== 'undefined' &&patternType === 'COMPLEX' && index2 !== 'all') {
      groupData[index2].data.mainQuestion.stemType = stemType;
      groupData[index2].data.mainQuestion.stemText = value;
      groupData[index2].data.mainQuestion.allowEnter = allowEnter;
      groupData[index2].data.mainQuestion.stemImage = '';
      groupData[index2].data.mainQuestion.stemAudioText = stemAudioTextStatus ? value : stemAudioText
    } else {
      this.setState({
        allowEnter:allowEnter,
        stemText: value,
        stemType:stemType,
        stemAudioText: stemAudioTextStatus ? value : stemAudioText,
        stemImage:''
      });
    }
    console.log(groupData)
    this.setState({
      group:groupData
    })

  }

  // 保存图片ID
  saveImgID = (id, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.stemImage = id;
        item.data.mainQuestion.stemText = '';
        item.data.mainQuestion.stemAudioText = this.state.stemAudioTextStatus ? '' : this.state.stemAudioText;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.stemImage = id;
      groupData[index2].data.mainQuestion.stemText = '';
      groupData[index2].data.mainQuestion.stemAudioText = this.state.stemAudioTextStatus ? '' : this.state.stemAudioText
    } else {
      this.setState({
        stemImage: id,
        stemText:'',
        stemAudioText: this.state.stemAudioTextStatus ? '' : this.state.stemAudioText,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 通知复制短文内容 音频原文复制短文内容
  changeStemAudioTextStatus = (value) => {
    this.setState({
      stemAudioTextStatus: value,
    });
  }

  // 保存音频原文
  saveStemAudio = (value, index2) => {
    console.log(this.state.group)
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.stemAudioText = value;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.stemAudioText = value;
    } else {
      this.setState({
        stemAudioText: value
      });
    }
    this.setState({
      group: groupData
    })
  }

  savestemVideoText = (value, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.stemVideoText = value;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.stemVideoText = value;
    } else {
      this.setState({
        stemVideoText: value
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 保存口语封闭题答案
  saveReferenceText = (value, id, time, subIndex, patternType, answerType, index2, referenceTextMark,allowEnterData) => {
    console.log(allowEnterData)
    this.setState({ answerType: answerType, referenceTextMark: referenceTextMark });
    if (this.state.patternType == 'TWO_LEVEL') {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[subIndex].closeOralQuestionAnswerInfo = {
        allowEnter:allowEnterData?allowEnterData:'N',
        referenceText: value, // 参考文本
        referenceAudio: id, // 参考音频ID ,
        referenceAudioTime: time, // 参考音频时间
        referenceTextMark: referenceTextMark
      }
      subQuestions[subIndex].answerType = answerType;
      this.setState({
        subQuestion: subQuestions
      })
    } else if (this.state.patternType == 'NORMAL') {
      this.setState({
        answerType: answerType,
        closeOralQuestionAnswerInfo: // 口语封闭题答案 
        {
          allowEnter:allowEnterData?allowEnterData:'N',
          referenceText: value, // 参考文本
          referenceAudio: id, // 参考音频ID ,
          referenceAudioTime: time, // 参考音频时间
          referenceTextMark: referenceTextMark
        }
      })
    } else {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      if (index2 == 'all') {
        groupData.map((item) => {
          item.data.mainQuestion.closeOralQuestionAnswerInfo = {
            allowEnter:allowEnterData?allowEnterData:'N',
            referenceText: value, // 参考文本
            referenceAudio: id, // 参考音频ID ,
            referenceAudioTime: time, // 参考音频时间
            referenceTextMark: referenceTextMark
          }
        })
      }
      if (index2 != 'undefined' && index2 != 'all') {
        if (patternType == 'TWO_LEVEL') {
          groupData[index2].data.subQuestion[subIndex].closeOralQuestionAnswerInfo = {
            allowEnter:allowEnterData?allowEnterData:'N',
            referenceText: value, // 参考文本
            referenceAudio: id, // 参考音频ID ,
            referenceAudioTime: time, // 参考音频时间
            referenceTextMark: referenceTextMark
          }
          groupData[index2].data.subQuestion[subIndex].answerType = answerType
          groupData[index2].data.mainQuestion.answerType = answerType
        } else {
          groupData[index2].data.mainQuestion.closeOralQuestionAnswerInfo = {
            allowEnter:allowEnterData?allowEnterData:'N',
            referenceText: value, // 参考文本
            referenceAudio: id, // 参考音频ID ,
            referenceAudioTime: time, // 参考音频时间
            referenceTextMark: referenceTextMark
          }
          groupData[index2].data.mainQuestion.answerType = answerType
        }
      }
      this.setState({
        group: groupData
      })
    }
  }

  // 保存题干音频ID
  saveStemAudioID = (value, time, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.stemAudio = value;
        item.data.mainQuestion.stemAudioTime = time;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.stemAudio = value;
      groupData[index2].data.mainQuestion.stemAudioTime = time;
    } else {
      this.setState({
        stemAudio: value,
        stemAudioTime: time,
        group: groupData
      })
    }
    this.setState({
      group: groupData
    })
  }

  // 保存题干视频ID
  saveStemVideoeID = (value, time, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.stemVideo = value;
        item.data.mainQuestion.stemVideoTime = time;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.stemVideo = value;
      groupData[index2].data.mainQuestion.stemVideoTime = time;
    } else {
      this.setState({
        stemVideo: value,
        stemVideoTime: time,
        group: groupData
      })
    }
    this.setState({
      group: groupData
    })
  }

  // 保存题干音频ID2
  saveStemAudioID2 = (value, time, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.stemAudio2 = value;
        item.data.mainQuestion.stemAudioTime2 = time;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.stemAudio2 = value;
      groupData[index2].data.mainQuestion.stemAudioTime2 = time;
    } else {
      this.setState({
        stemAudio2: value,
        stemAudioTime2: time,
        group: groupData
      })
    }
    this.setState({
      group: groupData
    })
  }

  /*
  *保存评分引擎
   * subIndex 第几小题
   * patternType 题型类型
   */
  saveEvaluationEngine = (value, subIndex, patternType, index2) => {
    if (this.state.patternType == 'TWO_LEVEL') {
      let subQuestions = this.state.subQuestion;
      subQuestions[subIndex].evaluationEngineInfo = value;
      this.setState({
        subQuestion: subQuestions
      })
    } else if (this.state.patternType == 'NORMAL') {
      this.setState({
        evaluationEngineInfo: value
      })
    } else {
      let groupData = this.state.group;
      if (index2 == 'all') {
        groupData.map((item) => {
          item.data.mainQuestion.evaluationEngineInfo = value;
        })
      }
      if (index2 != 'undefined' && index2 != 'all') {
        console.log(index2)
        console.log(groupData[index2])
        if (patternType == 'TWO_LEVEL') {

          groupData[index2].data.subQuestion[subIndex].evaluationEngineInfo = value;
        } else {
          groupData[index2].data.mainQuestion.evaluationEngineInfo = value;
        }
      }
      this.setState({
        group: groupData
      })
    }
  }

  /*
  *保存口语半开放题答案
   * subIndex 第几小题
   * patternType 题型类型
   */
  saveReferenceAnswer = (referenceAnswer, referenceMachineEvaluation, subIndex, patternType, answerType, index2, keywordList, hintReferenceMachineEvaluation, errorReferenceMachineEvaluation) => {
    this.setState({ answerType: answerType });
    if (this.state.patternType == 'TWO_LEVEL') {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[subIndex].halfOpenOralQuestionAnswerInfo = { // 口语半开放题答案
        referenceAnswer: referenceAnswer,
        referenceMachineEvaluation: referenceMachineEvaluation,
        hintReferenceMachineEvaluation: hintReferenceMachineEvaluation,
        errorReferenceMachineEvaluation: errorReferenceMachineEvaluation,
        keywords: keywordList
      };
      subQuestions[subIndex].answerType = answerType
      this.setState({
        subQuestion: subQuestions
      })
    } else if (this.state.patternType == 'NORMAL') {
      this.setState({
        answerType: answerType,
        halfOpenOralQuestionAnswerInfo: { // 口语半开放题答案          
          referenceAnswer: referenceAnswer,
          referenceMachineEvaluation: referenceMachineEvaluation,
          hintReferenceMachineEvaluation: hintReferenceMachineEvaluation,
          errorReferenceMachineEvaluation: errorReferenceMachineEvaluation,
          keywords: keywordList
        },
      })
    } else {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      if (index2 == 'all') {
        groupData.map((item) => {
          item.data.mainQuestion.halfOpenOralQuestionAnswerInfo = { // 口语半开放题答案 
            referenceAnswer: referenceAnswer,
            referenceMachineEvaluation: referenceMachineEvaluation,
            hintReferenceMachineEvaluation: hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: errorReferenceMachineEvaluation,
            keywords: keywordList
          };
        })
      }
      if (index2 != 'undefined' && index2 != 'all') {
        if (patternType == 'TWO_LEVEL') {
          groupData[index2].data.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo = { // 口语半开放题答案 
            referenceAnswer: referenceAnswer,
            referenceMachineEvaluation: referenceMachineEvaluation,
            hintReferenceMachineEvaluation: hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: errorReferenceMachineEvaluation,
            keywords: keywordList
          };
          groupData[index2].data.subQuestion[subIndex].answerType = answerType
          groupData[index2].data.mainQuestion.answerType = answerType
        } else {
          groupData[index2].data.mainQuestion.halfOpenOralQuestionAnswerInfo = { // 口语半开放题答案 
            referenceAnswer: referenceAnswer,
            referenceMachineEvaluation: referenceMachineEvaluation,
            hintReferenceMachineEvaluation: hintReferenceMachineEvaluation,
            errorReferenceMachineEvaluation: errorReferenceMachineEvaluation,
            keywords: keywordList
          };
          groupData[index2].data.mainQuestion.answerType = answerType
        }
      }
      this.setState({
        group: groupData
      })
    }
  }

  /*
   * 保存口语开放题答案配置控件
   * subIndex 第几小题
   * patternType 题型类型
   */
  saveOpenOralQuestionAnswerInfo = (referenceAnswer, referenceMachineEvaluation, subIndex, patternType, answerType, index2, keywordList) => {
    this.setState({ answerType: answerType });
    if (this.state.patternType == 'TWO_LEVEL') {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[subIndex].openOralQuestionAnswerInfo = { // 口语开放题答案
        referenceAnswer: referenceAnswer,
        referenceMachineEvaluation: referenceMachineEvaluation,
        keywords: keywordList
      };
      subQuestions[subIndex].answerType = answerType
      this.setState({
        subQuestion: subQuestions
      })
    } else if (this.state.patternType == 'NORMAL') {
      this.setState({
        answerType: answerType,
        openOralQuestionAnswerInfo: { // 口语开放题答案          
          referenceAnswer: referenceAnswer,
          referenceMachineEvaluation: referenceMachineEvaluation,
          keywords: keywordList
        },
      })
    } else {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      if (index2 == 'all') {
        groupData.map((item) => {
          item.data.mainQuestion.openOralQuestionAnswerInfo = { // 口语开放题答案
            referenceAnswer: referenceAnswer,
            referenceMachineEvaluation: referenceMachineEvaluation,
            keywords: keywordList
          };
        })
      }
      if (index2 != 'undefined' && index2 != 'all') {
        if (patternType == 'TWO_LEVEL') {
          groupData[index2].data.subQuestion[subIndex].openOralQuestionAnswerInfo = { // 口语开放题答案
            referenceAnswer: referenceAnswer,
            referenceMachineEvaluation: referenceMachineEvaluation,
            keywords: keywordList
          };
          groupData[index2].data.subQuestion[subIndex].answerType = answerType
          groupData[index2].data.mainQuestion.answerType = answerType
        } else {
          groupData[index2].data.mainQuestion.openOralQuestionAnswerInfo = { // 口语开放题答案
            referenceAnswer: referenceAnswer,
            referenceMachineEvaluation: referenceMachineEvaluation,
            keywords: keywordList
          };
          groupData[index2].data.mainQuestion.answerType = answerType
        }
      }
      this.setState({
        group: groupData
      })
    }
  }

  /*
   * 保存填空题答案配置控件
   * subIndex 第几小题
   * patternType 题型类型
   * 
  */
  saveGapFillingInfo = (answerData, subIndex, patternType, answerType, gapMode, gapFloatMode, index2) => {
    this.setState({ answerType: answerType,grapFillingData:gapFloatMode });
    if (this.state.patternType == 'TWO_LEVEL') {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions.map((item,index)=>{
        if(subQuestions[index]&&subQuestions[index].gapFillingQuestionAnswerInfo&&subQuestions[index].gapFillingQuestionAnswerInfo.gapFloatMode) {
          subQuestions[index].gapFillingQuestionAnswerInfo.gapFloatMode = gapFloatMode
        }        
      })
      subQuestions[subIndex].gapFillingQuestionAnswerInfo = {
        "gapMode": gapMode,
        "gapFloatMode": gapFloatMode,
        "answers": answerData
      };
      subQuestions[subIndex].answerType = answerType
      this.setState({
        subQuestion: subQuestions
      })
    } else if (this.state.patternType == 'NORMAL') {
      this.setState({
        answerType: answerType,
        gapFillingQuestionAnswerInfo: {
          "gapMode": gapMode,
          "gapFloatMode": gapFloatMode,
          "answers": answerData
        },
      })
    } else {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      if (index2 == 'all') {
        groupData.map((item) => {
          item.data.mainQuestion.gapFillingQuestionAnswerInfo = {
            "gapMode": gapMode,
            "gapFloatMode": gapFloatMode,
            "answers": answerData
          };
        })
      }
      if (index2 != 'undefined' && index2 != 'all') {
        if (patternType == 'TWO_LEVEL') {
          groupData[index2].data.subQuestion.map((item,index)=>{
            if(groupData[index2].data.subQuestion[index]&&groupData[index2].data.subQuestion[index].gapFillingQuestionAnswerInfo&&groupData[index2].data.subQuestion[index].gapFillingQuestionAnswerInfo.gapFloatMode) {
              groupData[index2].data.subQuestion[index].gapFillingQuestionAnswerInfo.gapFloatMode = gapFloatMode
            }            
          })
          groupData[index2].data.subQuestion[subIndex].gapFillingQuestionAnswerInfo = {
            "gapMode": gapMode,
            "gapFloatMode": gapFloatMode,
            "answers": answerData
          };
          groupData[index2].data.subQuestion[subIndex].answerType = answerType
          groupData[index2].data.mainQuestion.answerType = answerType

        } else {
          groupData[index2].data.mainQuestion.gapFillingQuestionAnswerInfo = {
            "gapMode": gapMode,
            "gapFloatMode": gapFloatMode,
            "answers": answerData
          };
          groupData[index2].data.mainQuestion.answerType = answerType
        }
      }
      this.setState({
        group: groupData
      })
    }
  }

  // 二级题型
  // 保存小题题干控件
  saveSubStem = (value, stemIndex, index2,allowEnterData) => {
    console.log(index2,this.state.patternType)
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemText = value;
      groupData[index2].data.subQuestion[stemIndex].allowEnter = allowEnterData;
      if (this.state.subStemAudioTextStatus) {
        groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudioText = value;        
        groupData[index2].data.subQuestion[stemIndex].subQuestionStemImage = '';
      }
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[stemIndex].subQuestionStemText = value;
      subQuestions[stemIndex].allowEnter = allowEnterData;
      if (this.state.subStemAudioTextStatus) {
        subQuestions[stemIndex].subQuestionStemAudioText = value;        
        subQuestions[stemIndex].subQuestionStemImage = '';
      }
      this.setState({
        subQuestion: subQuestions
      })
      console.log(subQuestions)
    }
    
  }

  // 保存小题题干图片
  saveSubStemImgInfo = (value, stemIndex, index2) => {
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      if (this.state.subStemAudioTextStatus) {
        groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudioText = '';
      }
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemText = '';
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemImage = value;
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[stemIndex].subQuestionStemAudioText = '';
      subQuestions[stemIndex].subQuestionStemImage = value;
      this.setState({
        subQuestion: subQuestions
      })
    }

  }

  // 保存 小题题干音频控件
  saveSubStemAudioInfo = (value, time, stemIndex, index2) => {
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudio = value;
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudioTime = time;
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[stemIndex].subQuestionStemAudio = value;
      subQuestions[stemIndex].subQuestionStemAudioTime = time;
      this.setState({
        subQuestion: subQuestions
      })
    }
  }

  // 保存 小题题干音频控件
  saveSubStemAudioInfo2 = (value, time, stemIndex, index2) => {
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudio2 = value;
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudioTime2 = time;
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[stemIndex].subQuestionStemAudio2 = value;
      subQuestions[stemIndex].subQuestionStemAudioTime2 = time;
      this.setState({
        subQuestion: subQuestions
      })
    }
  }

  // 保存答题方式
  saveSubAskAnswerInfo = (value, stemIndex, index2) => {
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      groupData[index2].data.subQuestion[stemIndex].askAnswerSection = value;
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[stemIndex].askAnswerSection = value;
      this.setState({
        subQuestion: subQuestions
      })
    }
  }

  // 7.2.15  提问方式控件
  saveChooseModeSelectInfo = (value, stemIndex, index2) => {
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      groupData[index2].data.subQuestion[stemIndex].ChooseModeSelect = value;
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[stemIndex].ChooseModeSelect = value;
      console.log(subQuestions)
      this.setState({
        subQuestion: subQuestions
      })
    }
  }

  // 通知复制短文内容 音频原文复制短文内容
  changeSubStemAudioTextStatus = (value) => {
    this.setState({
      subStemAudioTextStatus: value,
    });
  }

  // 保存音频短文
  saveSubStemAudioText = (value, stemIndex, index2) => {
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      groupData[index2].data.subQuestion[stemIndex].subQuestionStemAudioText = value;
      this.setState({
        group: groupData
      })
    } else {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));;
      subQuestions[stemIndex].subQuestionStemAudioText = value;
      this.setState({
        subQuestion: subQuestions
      })
    }
  }

  // 保存解析内容
  saveAnswerExplanation = (value, subIndex, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (subIndex != -1) { // 二层题型
      if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
        groupData[index2].data.subQuestion[subIndex].answerExplanation = value;
        this.setState({
          group: groupData
        })
      } else {
        let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
        subQuestions[subIndex].answerExplanation = value;
        this.setState({
          subQuestion: subQuestions
        })
      }
    } else { // 普通题型
      if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
        groupData.map((item) => {
          item.data.mainQuestion.answerExplanation = value;
        })
      }
      if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
        groupData[index2].data.mainQuestion.answerExplanation = value;
      } else {
        this.setState({
          answerExplanation: value
        });
      }
      this.setState({
        group: groupData
      })
    }
    console.log("this.state.group1");
    console.log(this.state.answerExplanation);
    console.log(this.state.group);
  }

  // 二级结束
  // 题后指导部分
  saveGuideSuffixText = (value, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guideSuffixText = value;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guideSuffixText = value;
    } else {
      this.setState({
        guideSuffixText: value,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 题后音频部分
  saveGuideSuffixAudioInfo = (value, time, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guideSuffixAudio = value;
        item.data.mainQuestion.guideSuffixAudioTime = time;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guideSuffixAudio = value;
      groupData[index2].data.mainQuestion.guideSuffixAudioTime = time;
    } else {
      this.setState({
        guideSurfixAudio: value,
        guideSurfixAudioTime: time,
      });
    }
    this.setState({
      group: groupData
    })
  }

  //
  // 题前指导部分
  saveGuidePrefixText = (value, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guidePrefixText = value;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guidePrefixText = value;
    } else {
      this.setState({
        guidePrefixText: value,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 中间指导文本
  saveGuideMiddleText = (value, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guideMiddleText = value;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guideMiddleText = value;
    } else {
      this.setState({
        guideMiddleText: value,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 题前音频部分
  saveGuidePrefixAudioInfo = (value, time, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guidePrefixAudio = value;
        item.data.mainQuestion.guidePrefixAudioTime = time;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guidePrefixAudio = value;
      groupData[index2].data.mainQuestion.guidePrefixAudioTime = time;
    } else {
      this.setState({
        guidePrefixAudio: value,
        guidePrefixAudioTime: time,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 7.2.13  中间指导音频
  saveGuideMiddleAudioInfo = (value, time, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guideMiddleAudio = value;
        item.data.mainQuestion.guideMiddleAudioTime = time;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guideMiddleAudio = value;
      groupData[index2].data.mainQuestion.guideMiddleAudioTime = time;
    } else {
      this.setState({
        guideMiddleAudio: value,
        guideMiddleAudioTime: time,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 题前指导图片
  saveGuidePrefixImgInfo = (id, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guidePrefixImage = id;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guidePrefixImage = id;
    } else {
      this.setState({
        guidePrefixImage: id,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 中间指导图片
  saveGuideMiddleImgInfo = (id, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guideMiddleImage = id;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guideMiddleImage = id;
    } else {
      this.setState({
        guideMiddleImage: id,
      });
    }
    this.setState({
      group: groupData
    })
  }
  
  // 题后指导图片
  saveGuideSuffixImageInfo = (id, index2) => {
    let groupData = JSON.parse(JSON.stringify(this.state.group));
    if (index2 == 'all' && this.state.patternType == 'COMPLEX') {
      groupData.map((item) => {
        item.data.mainQuestion.guideSuffixImage = id;
      })
    }
    if (index2 != 'undefined' && index2 != 'all' && this.state.patternType == 'COMPLEX') {
      groupData[index2].data.mainQuestion.guideSuffixImage = id;
    } else {
      this.setState({
        guideSuffixImage: id,
      });
    }
    this.setState({
      group: groupData
    })
  }

  // 保存选择题文本答案配置
  saveChoiceControl = (initData2, floatMode, patternType, answerType, subIndex, index2) => {
    console.log(patternType)
    this.setState({ answerType: answerType });
    if (this.state.patternType == 'TWO_LEVEL') {
      let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
      subQuestions[subIndex].choiceQuestionAnswerInfo = {
        "floatMode": floatMode, // horizental/vertical        
        "options": initData2
      };
      subQuestions[subIndex].answerType = answerType
      this.setState({
        subQuestion: subQuestions
      })
    } else if (this.state.patternType == 'NORMAL') {
      this.setState({
        answerType: answerType,
        choiceQuestionAnswerInfo: {
          "floatMode": floatMode, // horizental/vertical        
          "options": initData2
        },
      })
    } else {
      let groupData = JSON.parse(JSON.stringify(this.state.group));
      if (index2 == 'all') {
        groupData.map((item) => {
          item.data.mainQuestion.choiceQuestionAnswerInfo = {
            "floatMode": floatMode, // horizental/vertical        
            "options": initData2
          };
        })
      }
      if (index2 != 'undefined' && index2 != 'all') {
        if (patternType == 'TWO_LEVEL') {
          groupData[index2].data.subQuestion[subIndex].choiceQuestionAnswerInfo = {
            "floatMode": floatMode, // horizental/vertical        
            "options": initData2
          };
          groupData[index2].data.subQuestion[subIndex].answerType = answerType
          groupData[index2].data.mainQuestion.answerType = answerType
        } else {
          groupData[index2].data.mainQuestion.choiceQuestionAnswerInfo = {
            "floatMode": floatMode, // horizental/vertical        
            "options": initData2
          };
          groupData[index2].data.mainQuestion.answerType = answerType
        }
      }
      this.setState({
        group: groupData
      })
    }
  }

  // 保存难易度
  saveDifficultLevel = (value) => {
    this.setState({
      difficultLevel: value
    })
  }

  // 保存考察能力
  saveAbilityLevel = (value) => {
    this.setState({
      checkAbility: value
    })
  }

  // 清洗数据完成
  saveClearTrueData=(value)=>{
    this.setState({
      checkClear: value
    })
  }

  // 渲染哪个组件
  renderAssembly = (mode, item, index, patternType, sub, index2, editData,evaluationEngineComponents) => {
    const { form } = this.props;
    const {grapFillingData} = this.state;
    console.log(mode)    
    switch (mode) { 
      case 'stemInfo':
        {
          return <StemInfoControl 
            data={item} 
            key={'stemInfo'+index} 
            saveStemTextModal={(value,index2,saveStemTextModal)=>this.saveStem(value,index2,saveStemTextModal,item)} 
            saveStemImgModal={(id,index2)=>this.saveImgID(id,index2)}
            subIndex={sub}
            referenceTextMark={this.state.referenceTextMark}
            patternType={patternType}
            showData={editData}
            index2={index2}
            saveClearTrue={(value)=>this.saveClearTrueData(value)}
            allowEnterStemInfo={allowEnterStemInfo}
            form={form}
          />;
        }
      case 'subQuestionStemInfo': // 7.2.16  小题题干控件
        {
          let chooseMode = ''
          let chooseModeNew = ''
          const editDataNew = editData&&editData.data 
          const mainIndex=index2=='all'?'1':index2;

          if(editDataNew&&editDataNew.patternType=="TWO_LEVEL") {   
              const subQuestionInfo =editDataNew.subQuestion[sub];
                if(subQuestionInfo.subQuestionStemText&&subQuestionInfo.subQuestionStemAudio) {
                  chooseModeNew='1';
                } 
                else if(subQuestionInfo.subQuestionStemText&&!subQuestionInfo.subQuestionStemAudio) {
                  chooseModeNew='2';
                    }
                else if(subQuestionInfo.subQuestionStemAudio&&!subQuestionInfo.subQuestionStemText) {
                  chooseModeNew='3';
                } else {
                  chooseModeNew='1';
                }
                
          }
          else  if(editDataNew&&editDataNew.patternType=="COMPLEX"&&editDataNew.groups[mainIndex].data) { 
              if(editDataNew.groups[mainIndex].data.patternType=="TWO_LEVEL"&&editDataNew.groups[mainIndex].data.subQuestion[sub]) {   
                const subQuestionInfo=editDataNew.groups[index2].data.subQuestion[sub]   
                if(subQuestionInfo.subQuestionStemText&&subQuestionInfo.subQuestionStemAudio) {
                  chooseModeNew='1';
                } 
                else if(subQuestionInfo.subQuestionStemText&&!subQuestionInfo.subQuestionStemAudio) {
                  chooseModeNew='2';
                    }
                else if(subQuestionInfo.subQuestionStemAudio&&!subQuestionInfo.subQuestionStemText) {
                  chooseModeNew='3';
                } else {
                  chooseModeNew='1';
                }      
              }     
            }
          if (index2 != '') {
            let groupData = this.state.group;
            chooseMode = chooseModeState?'1':groupData[index2] && groupData[index2].data.subQuestion[sub].ChooseModeSelect || chooseModeNew;

          } else {
            let subQuestions = this.state.subQuestion;
            chooseMode = chooseModeState?'1':subQuestions[sub] && subQuestions[sub].ChooseModeSelect || chooseModeNew
            console.log(subQuestions[sub],chooseMode)
          }
         
         
          if (chooseMode != '3') {
            return <SubQuestionStemInfo data={item} key={'subQuestionStemInfo'+index} 
          saveSubStemText={(value,stemIndex,index2,allowEnterData)=>this.saveSubStem(value,stemIndex,index2,allowEnterData)} 
          saveSubStemImg={(value,stemIndex,index2)=>this.saveSubStemImgInfo(value,stemIndex,index2)} 
          subIndex={sub}
          patternType={patternType}
          saveClearTrue={(value)=>this.saveClearTrueData(value)}
          showData={editData}
          index2={index2}
          allowEnterSubStemInfo={allowEnterSubStemInfo}
          form = {form}
          />;
          } else {
            return ''
          }
        }
      case 'stemAudio':
        {
          return <div><StemAudioControl data={item} key={'stemAudio'+index}  
          saveStemAudio={(value,time,index2)=>this.saveStemAudioID(value,time,index2)}
          subIndex={sub}
          patternType={patternType}
          showData={editData}          
          index2={index2}
          form = {form}
          
          />
         <StemAudioControl2 data={item} key={index+'2'} 

          saveStemAudio={(value,time,index2)=>this.saveStemAudioID2(value,time,index2)}
          subIndex={sub}
          patternType={patternType}
          showData={editData}
          index2={index2}
          form = {form}
          
          />
          </div>;
        }
      case 'subQuestionStemAudio': //7.2.17 小题题干音频控件
        {
          let chooseMode = ''
          const editDataNew = editData&&editData.data 
          const mainIndex=index2=='all'?'1':index2;
          let chooseModeNew=''
          if(editDataNew&&editDataNew.patternType=="TWO_LEVEL") {   
            const subQuestionInfo =editDataNew.subQuestion[sub];
              if(subQuestionInfo.subQuestionStemText&&subQuestionInfo.subQuestionStemAudio) {
                chooseModeNew='1';
              } 
              else if(subQuestionInfo.subQuestionStemText&&!subQuestionInfo.subQuestionStemAudio) {
                chooseModeNew='2';
                  }
              else if(subQuestionInfo.subQuestionStemAudio&&!subQuestionInfo.subQuestionStemText) {
                chooseModeNew='3';
              } else {
                chooseModeNew='1';
              }
              
        }
        else  if(editDataNew&&editDataNew.patternType=="COMPLEX"&&editDataNew.groups[mainIndex].data) { 
            if(editDataNew.groups[mainIndex].data.patternType=="TWO_LEVEL"&&editDataNew.groups[mainIndex].data.subQuestion[sub]) {   
              const subQuestionInfo=editDataNew.groups[index2].data.subQuestion[sub]   
              if(subQuestionInfo.subQuestionStemText&&subQuestionInfo.subQuestionStemAudio) {
                chooseModeNew='1';
              } 
              else if(subQuestionInfo.subQuestionStemText&&!subQuestionInfo.subQuestionStemAudio) {
                chooseModeNew='2';
                  }
              else if(subQuestionInfo.subQuestionStemAudio&&!subQuestionInfo.subQuestionStemText) {
                chooseModeNew='3';
              } else {
                chooseModeNew='1';
              }      
            }     
          }
          if (index2 != '') {
            let groupData = this.state.group;
            chooseMode = chooseModeState?'1':groupData[index2] && groupData[index2].data.subQuestion[sub].ChooseModeSelect || chooseModeNew;

          } else {
            let subQuestions = this.state.subQuestion;
            chooseMode = chooseModeState?'1':subQuestions[sub] && subQuestions[sub].ChooseModeSelect || chooseModeNew
          }
      
          console.log(chooseMode)
          if (chooseMode != '2') {
            return <div><SubQuestionStemAudio data={item} key={'subQuestionStemAudio'+index} subIndex={sub}  
        saveSubStemAudio={(value,time,stemIndex,index2)=>this.saveSubStemAudioInfo(value,time,stemIndex,index2)}
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />

        <SubQuestionStemAudio2 data={item} key={index+'2'} subIndex={sub} 
        saveSubStemAudio={(value,time,stemIndex,index2)=>this.saveSubStemAudioInfo2(value,time,stemIndex,index2)}
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />

        </div>;
          } else {
            return ''
          }
        }
      case 'swapAskAnswerSectionSelect': //7.2.14 切换问答选择控件
        {
          return <SwapAskAnswerControl data={item} key={'swapAskAnswerSectionSelect'+index} subIndex={sub} 
        saveSubAskAnswer={(value,stemIndex,index2)=>this.saveSubAskAnswerInfo(value,stemIndex,index2)}
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'chooseModeSelect': //7.2.15 提问方式控件（chooseModeSelectControl）
        {
          chooseModeState= false;
          return <ChooseModeSelectControl data={item} key={'chooseModeSelect'+index} subIndex={sub} 
        saveSubAskAnswer={(value,stemIndex,index2)=>this.saveChooseModeSelectInfo(value,stemIndex,index2)}
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'stemAudioText':
        {
          return <StemAudioTextControl data={item} key={'stemAudioText'+index} 
          saveCopyStemAudioText={value=>this.changeStemAudioTextStatus(value)} 
          saveStemAudioTextModal={(value,index2)=>this.saveStemAudio(value,index2)}
          subIndex={sub}
          showData={editData}
          index2={index2}
          form = {form}
          saveClearTrue={(value)=>this.saveClearTrueData(value)}
          />;
        }

      case 'stemVideo':
        {
          return <StemVideoControl data={item} key={'stemVideo'+index}  
          saveStemAudio={(value,time,index2)=>this.saveStemVideoeID(value,time,index2)}
          subIndex={sub}
          patternType={patternType}
          showData={editData}          
          index2={index2}
          form = {form}
          />;
        }
      case 'stemVideoText':
        {
          return <StemVideoTextControl data={item} key={'stemVideoText'+index} 
          saveCopyStemAudioText={value=>{}} 
          saveStemAudioTextModal={(value,index2)=>this.savestemVideoText(value,index2)}
          subIndex={sub}
          showData={editData}
          index2={index2}
          form = {form}
          saveClearTrue={(value)=>this.saveClearTrueData(value)}
          />;
        }
      case 'subQuestionStemAudioText': //7.2.18 小题题干音频文本控件
        {
          return <SubQuestionStemAudioText data={item} key={'subQuestionStemAudioText'+index} 
        saveSubCopyStemAudioText={value=>this.changeSubStemAudioTextStatus(value)}
        saveSubStemAudioTextModal={(value,stemIndex,index2)=>this.saveSubStemAudioText(value,stemIndex,index2)}
        subIndex={sub}
        saveClearTrue={(value)=>this.saveClearTrueData(value)}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'evaluationEngine': //7.2.24 评分引擎配置控件
        {
          return <EvaluationEngine data={item} key={'evaluationEngine'+index} 
        saveEvaluationEngineInfo={(value,subIndex,patternType,index2)=>this.saveEvaluationEngine(value,subIndex,patternType,index2)} 
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'HALF_OPEN_ORAL': //7.2.23 口语半开放题答案配置控件
        {
          return <HalfOpenOral data={item} key={'HALF_OPEN_ORAL'+index}  onlyKey={index}
        saveReferenceAnswerInfo={(referenceAnswer,referenceMachineEvaluation,subIndex,patternType,answerType,index2,keywordList,hintReferenceMachineEvaluation,errorReferenceMachineEvaluation)=>this.saveReferenceAnswer(referenceAnswer,referenceMachineEvaluation,subIndex,patternType,answerType,index2,keywordList,hintReferenceMachineEvaluation,errorReferenceMachineEvaluation)}  
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        saveClearTrue={(value)=>this.saveClearTrueData(value)}
        form = {form}
        evaluationEngineInfo = {evaluationEngineComponents}
        />;
        }
      case 'CLOSED_ORAL': //7.2.21  口语封闭题答案配置控件
        {
          let closeOralInfo = '';
          let closeOralQuestionAnswerInfo = {};
          let allowEnterData
          if (this.state.patternType == 'COMPLEX') {
            let mainIndexs = index2 == 'all' ? '1' : index2;
            let groupData = this.state.group;
            if (patternType == 'TWO_LEVEL') {
              const mainData = groupData[mainIndexs]
              allowEnterData =  mainData && mainData.data.subQuestion[sub].allowEnter
              closeOralInfo = mainData && mainData.data.subQuestion[sub].subQuestionStemText
              closeOralQuestionAnswerInfo = mainData && mainData.data.subQuestion[sub].closeOralQuestionAnswerInfo;
            } else {
              const mainData = groupData[mainIndexs]
              allowEnterData =  mainData && mainData.data.mainQuestion.allowEnter
              closeOralInfo = mainData && mainData.data.mainQuestion.stemText
              closeOralQuestionAnswerInfo = mainData && mainData.data.mainQuestion.closeOralQuestionAnswerInfo;
            }
          } else if (this.state.patternType == 'TWO_LEVEL') {
            let subQuestions = JSON.parse(JSON.stringify(this.state.subQuestion));
            allowEnterData = subQuestions[sub] && subQuestions[sub].allowEnter
            closeOralInfo = subQuestions[sub] && subQuestions[sub].subQuestionStemText;
            closeOralQuestionAnswerInfo = subQuestions[sub] && subQuestions[sub].closeOralQuestionAnswerInfo;
          } else {
            allowEnterData = this.state.allowEnter
            closeOralInfo = this.state.stemText;
            closeOralQuestionAnswerInfo = this.state.closeOralQuestionAnswerInfo;
          }
          console.log(closeOralInfo+'~~~~~~'+allowEnterData)
          return <ClosedOralControl data={item} key={'CLOSED_ORAL'+index} 
        saveReferenceTextValue={(value,id,time,subIndex,patternType,answerType,index2,referenceTextMark,allowEnterData)=>this.saveReferenceText(value,id,time,subIndex,patternType,answerType,index2,referenceTextMark,allowEnterData)}  
        subIndex={sub}
        closeOralInfo={closeOralInfo}
        closeOralQuestionAnswerInfo={closeOralQuestionAnswerInfo}
        patternType={patternType}
        showData={editData}
        allowEnterData={allowEnterData}
        form = {form}
        index2={index2}
        checkClear={this.state.checkClear}
        saveClearTrue={(value)=>this.saveClearTrueData(value)}
        evaluationEngineInfo = {this.state.evaluationEngineInfo}/>;
          
        }
      case 'GAP_FILLING': //7.2.20  填空题答案配置控件
        {
          return <GapFillingControl data={item} key={'GAP_FILLING'+index} 
        saveReferenceAnswerInfo={(answerData,subIndex,patternType,answerType,gapMode,gapFloatMode,index2)=>this.saveGapFillingInfo(answerData,subIndex,patternType,answerType,gapMode,gapFloatMode,index2)}  
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        grapFillingData = {grapFillingData}
        index2={index2}
        form = {form}
        />;
        }
      case 'OPEN_ORAL': //7.2.22  口语开放题答案配置控件
        {
          return <OpenOralControl data={item} key={'OPEN_ORAL'+index}  onlyKey={index}
        saveReferenceAnswerInfo={(referenceAnswer,referenceMachineEvaluation,subIndex,patternType,answerType,index2,keywordList)=>this.saveOpenOralQuestionAnswerInfo(referenceAnswer,referenceMachineEvaluation,subIndex,patternType,answerType,index2,keywordList)} 
        subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        saveClearTrue={(value)=>this.saveClearTrueData(value)}
        evaluationEngineInfo = {evaluationEngineComponents}
        />;
        }
      case 'guideSuffixText': //7.2.8 题后指导文本控件
        {
          return <GuideSuffixTextControl data={item} key={'guideSuffixText'+index} 
        saveGuideSuffixTextInfo={(value,index2)=>this.saveGuideSuffixText(value,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'guideSuffixAudio': //7.2.10 题后指导音频控件
        {
          return <GuideSuffixAudioControl data={item} key={'guideSuffixAudio'+index} 
        saveGuideSuffixAudio={(value,time,index2)=>this.saveGuideSuffixAudioInfo(value,time,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        form = {form}
        index2={index2}/>;
        }
      case 'guidePrefixText': //7.2.5 题前指导文本控件
        {
          return <GuidePrefixTextControl data={item} key={'guidePrefixText'+index} 
        saveGuideSuffixTextInfo={(value,index2)=>this.saveGuidePrefixText(value,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'guideMiddleText': //7.2.11  中间指导文本控件（guideMiddleTextControl）
        {
          return <GuideMiddleTextControl data={item} key={'guideMiddleText'+index} 
        saveGuideSuffixTextInfo={(value,index2)=>this.saveGuideMiddleText(value,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        index2={index2}
        form = {form}
        />;
        }
      case 'guidePrefixAudio': //7.2.7  题前指导音频控件
        {
          return <GuidePrefixAudioControl data={item} key={'guidePrefixAudio'+index} 
        saveGuideSuffixAudio={(value,time,index2)=>this.saveGuidePrefixAudioInfo(value,time,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        form = {form}
        index2={index2}
        />;
        }
      case 'guideMiddleAudio': //7.2.13 中间指导音频控件（guideMiddleAudioControl）
        {
          return <GuideMiddleAudioControl data={item} key={'guideMiddleAudio'+index} 
        saveGuideSuffixAudio={(value,time,index2)=>this.saveGuideMiddleAudioInfo(value,time,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        form = {form}
        index2={index2}
        />;
        }
      case 'guidePrefixImage': //7.2.7  题前指导音频控件
        {
          return <GuidePrefixImageControl data={item} key={'guidePrefixImage'+index} 
        saveStemImgModal={(id,index2)=>this.saveGuidePrefixImgInfo(id,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        form = {form}
        index2={index2}
        />;
        }
      case 'guideMiddleImage': //7.2.12 中间指导图片控件（guideMiddleImageControl）
        {
          return <GuideMiddleImageControl data={item} key={'guideMiddleImage'+index} 
        saveStemImgModal={(id,index2)=>this.saveGuideMiddleImgInfo(id,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        form = {form}
        index2={index2}
        />;
        }
      case 'guideSuffixImage': // 7.2.9 题后指导图片控件
        {
          return <GuideSuffixImageControl data={item} key={'guideSuffixImage'+index} 
        saveStemImgModal={(id,index2)=>this.saveGuideSuffixImageInfo(id,index2)}
          subIndex={sub}
        patternType={patternType}
        showData={editData}
        form = {form}
        index2={index2}
        />;
        }
      case 'CHOICE': //7.2.19 选择题答案配置控件
        {
          return <div>{this.state.visible&&<ChoiceControl data={item} key={'CHOICE'+index} 
          saveChoice={(initData2,floatMode,patternType,answerType,subIndex,index2)=>this.saveChoiceControl(initData2,floatMode,patternType,item.name,sub,index2)} 
          saveStemImgModal={(id,index2)=>this.saveImgID(id,index2)}
          subIndex={sub}
          patternType={patternType}
          answerType={item.name}
          showData={editData}
          index2={index2}
          form = {form}
          />}</div>;
        }
      default:
        break;
    }
  }
  forceUpdateRenderHtml=()=>{
    console.log('aaaa')
    this.forceUpdate();
  }
  //渲染普通题型
  renderNormal = () => {
    const { dataSource, form } = this.props;
    const initShowData = dataSource.initData; //编辑展示数据
    return <div className="normalType">
      {dataSource.questionData.structure.components.map((item,index) => {
        dataSource.questionData.structure.answerComponents.map((vo,index) => {
          if(item.name==='stemInfo'&&vo.name==='CLOSED_ORAL') {
            allowEnterStemInfo = true;
          }
        })
        return this.renderAssembly(item.name,item,index,'','','',initShowData)
      })}
        {
        //机评参考
        dataSource.questionData.structure.answerComponents.map((item,index) => {
          return this.renderAssembly(item.name,item,item.name,'','','',initShowData,dataSource.questionData.structure.evaluationEngineComponents)
      })
      }
       {dataSource.questionData.structure.evaluationEngineComponents.map((item,index) => {
        return this.renderAssembly(item.name,item,item.name,'','','',initShowData)
      })}
       <AnswerExplanation
        key={"answerExplanation"}
        saveAnswerExplanation={(value)=>this.saveAnswerExplanation(value,-1)}
        saveClearTrue={(value)=>this.saveClearTrueData(value)}
        showData={initShowData}
        form = {form}
        />
      <TagSubject categry={'NORMAL'} saveDifficult={(value)=>this.saveDifficultLevel(value)} saveAbility={(value)=>this.saveAbilityLevel(value)} showData={initShowData} form={form}/>
    </div>
  }
  //渲染二级题型
  renderTwoLevel = (patternType) => {
    const { dataSource, form } = this.props;
    const initShowData = dataSource.initData; //编辑展示数据
    const questions = dataSource.masterData.mains[dataSource.masterData.staticIndex.mainIndex].questions
    const subs = questions[dataSource.masterData.staticIndex.questionIndex].subs
    return <div>
      {dataSource.questionData.structure.components.map((item,index) => {
        return this.renderAssembly(item.name,item,index,'','','',initShowData)
      })}
      {// 小题
        subs.length>0&&<div className="twoLevel">
            <Tabs animated={false} type="card" onChange={this.forceUpdateRenderHtml}>
            {subs.map((item,index)=>{
                return <TabPane tab={formatMessage({id:"app.text.no",defaultMessage:"第"}) +(index+1)+ formatMessage({id:"app.text.subquestion",defaultMessage:"小题"})} key={index+1} className="smallStem" forceRender={true}>
                    {dataSource.questionData.structure.subComponents.map((vo) => {
                        dataSource.questionData.structure.answerComponents.map((item,index) => {
                          if(vo.name==='subQuestionStemInfo'&&item.name==='CLOSED_ORAL') {
                            allowEnterSubStemInfo = true;
                          }
                        })
                        return this.renderAssembly(vo.name,vo,vo.name+index,'',index,'',initShowData,dataSource.questionData.structure.evaluationEngineComponents)
                    })}
                      {
                  //答案参考
                  dataSource.questionData.structure.answerComponents.map((vo1) => {
                      return this.renderAssembly(vo1.name,vo1,vo1.name+index,patternType,index,'',initShowData,dataSource.questionData.structure.evaluationEngineComponents)
                  })

                  }
                  {dataSource.questionData.structure.evaluationEngineComponents.map((vo2) => {
                    return this.renderAssembly(vo2.name,vo2,vo2.name+index,patternType,index,'',initShowData)
                  })}
                  <AnswerExplanation
                    key={"answerExplanation"+index} 
                    saveAnswerExplanation={(value,subIndex)=>this.saveAnswerExplanation(value,subIndex)}
                    saveClearTrue={(value)=>this.saveClearTrueData(value)}
                    subIndex={index}
                    showData={initShowData}
                    form = {form}
                    />
                  </TabPane>
            })}                  
          </Tabs>
      </div>
      }
    <TagSubject categry={'TWO_LEVEL'} saveDifficult={(value)=>this.saveDifficultLevel(value)} showData={initShowData} showData={initShowData} form={form}/>
    </div>
  }
  //渲染复合题型
  renderComplex = (patternType) => {

    const { dataSource, form } = this.props;
    const questions = dataSource.questionData.structure.groups
    const questionDetail = dataSource.masterData.mains[dataSource.masterData.staticIndex.mainIndex].questions
    const subs = questionDetail[dataSource.masterData.staticIndex.questionIndex].subs
    const initShowData = dataSource.initData; //编辑展示数据
    //判断题干文本题干图片是否继承   
    const stemInfoList = questions.map((v)=>{
      const stemInfo = v.structure.components.find(obj=>obj.name==='stemInfo')
      console.log(stemInfo)
       if(stemInfo) {
         return {
           ...stemInfo
         }
       }
    })
    let stemInfoLen = stemInfoList.length-1;
    let showStemInfo = false
    console.log(stemInfoList)
    stemInfoList.map((vo,index)=>{
      if(vo&&vo.inherit&&vo.inherit==='Y'&&index!==stemInfoLen) {
        if(!(vo.params&&vo.params.text===(stemInfoList[stemInfoLen]&&stemInfoList[stemInfoLen].params.text)&&vo.params.image===(stemInfoList[stemInfoLen]&&stemInfoList[stemInfoLen].params.image))) {
          showStemInfo=true
        }
      }
    })
    console.log(showStemInfo)
    return <div className="twoLevel">
        {questions.length>0&&questions[0].structure.components.filter(function (x) {
            if(showStemInfo) {
              return false;
            }else {
              return x.inherit=='Y';
            }            
          }).map((item,index) => {
            questions[0].structure.answerComponents.map((vo,index) => {
              if(item.name==='stemInfo'&&vo.name==='CLOSED_ORAL') {               
                allowEnterStemInfo = true;
              }
            })
        return this.renderAssembly(item.name,item,index,'','','all',initShowData,questions[0].structure.evaluationEngineComponents)
      })}
        {// 小题
        questions.length>0&&<div className="complexTypeLevel">
        <Tabs animated={false} defaultActiveKey={this.state.questionIndex==0?'1':'2'} forceRender={true}  type="card">
        {questions.map((group,index2)=>{
           switch(group.structure.patternType) {
          // 二层题型
          case 'TWO_LEVEL':
          {
            return <TabPane tab={formatMessage({id:"app.text.no",defaultMessage:"第"}) +(index2+1)+ formatMessage({id:"app.text.partItem",defaultMessage:"部分"})} key={index2+1} className="smallStem" forceRender={true}>                
             {group.structure.components.filter(function (x) {
                if(showStemInfo) {
                    return true;
                  }else {
                    return x.inherit!='Y';
                  }                        
                      }).map((item,index) => {
                        group.structure.answerComponents.map((vo,index) => {
                          if(item.name==='stemInfo'&&vo.name==='CLOSED_ORAL') {               
                            allowEnterStemInfo = true;
                          }
                        })
                return this.renderAssembly(item.name,item,index,'','',index2,initShowData,group.structure.evaluationEngineComponents)
              })}
                {// 二级小题
                  subs.length>0&&<div className="twoLevel">
                      <Tabs animated={false} forceRender={true}  type="card" onChange={this.forceUpdateRenderHtml}>
                      {questionDetail[index2].subs.map((item,index)=>{
                          return <TabPane tab={formatMessage({id:"app.text.no",defaultMessage:"第"}) +(index+1)+ formatMessage({id:"app.text.subquestion",defaultMessage:"小题"})} key={index+1} className="smallStem" forceRender={true}>
                              {group.structure.subComponents.map((vo) => {
                                   group.structure.answerComponents.map((item,index) => {
                                    if(vo.name==='subQuestionStemInfo'&&item.name==='CLOSED_ORAL') {
                                      allowEnterSubStemInfo = true;
                                    }
                                  })
                                  return this.renderAssembly(vo.name,vo,vo.name+index,'',index,index2,initShowData,group.structure.evaluationEngineComponents)
                              })}
                                {
                            //答案参考
                            group.structure.answerComponents.map((vo1) => {
                                return this.renderAssembly(vo1.name,vo1,vo1.name+index,'TWO_LEVEL',index,index2,initShowData,group.structure.evaluationEngineComponents)
                            })

                            }
                            {group.structure.evaluationEngineComponents.map((vo2) => {
                              return this.renderAssembly(vo2.name,vo2,vo2.name+index,'TWO_LEVEL',index,index2,initShowData)
                            })}
                        <AnswerExplanation key={"answerExplanation"+index2+index} subIndex={index} index2={index2}  saveClearTrue={(value)=>this.saveClearTrueData(value)} saveAnswerExplanation={(value,subIndex,index2)=>this.saveAnswerExplanation(value,subIndex,index2)} showData={initShowData} form = {form} />
                            </TabPane>
                      })}                      
                    </Tabs>
                </div>
                }
              </TabPane>
          }
          default:
          {            
            return <TabPane tab={formatMessage({id:"app.text.no",defaultMessage:"第"}) +(index2+1)+ formatMessage({id:"app.text.partItem",defaultMessage:"部分"})} key={index2+1} className="smallStem" forceRender={true}>                
             {group.structure.components.filter(function (x) {
                        if(showStemInfo) {
                          return true;
                        }else {
                          return x.inherit!='Y';
                        } 
                      }).map((item,index) => {
                        group.structure.answerComponents.map((vo,index) => {
                          if(item.name==='stemInfo'&&vo.name==='CLOSED_ORAL') {
                            allowEnterStemInfo = true;
                          }
                        })
                return this.renderAssembly(item.name,item,index,'','',index2,initShowData,group.structure.evaluationEngineComponents)
              })}
                
              {group.structure.answerComponents.map((item,index) => {
                  return this.renderAssembly(item.name,item,index,'','',index2,initShowData,group.structure.evaluationEngineComponents)
                })
              }
              {group.structure.evaluationEngineComponents.map((vo2) => {
                    return this.renderAssembly(vo2.name,vo2,vo2.name+index2,'','',index2,initShowData)
              })}
              <AnswerExplanation key={"answerExplanation"+index2} index2={index2} saveAnswerExplanation={(value,subQuestion,index2)=>this.saveAnswerExplanation(value,-1,index2)} showData={initShowData} form = {form} saveClearTrue={(value)=>this.saveClearTrueData(value)}/>
              </TabPane>
          }
        }           
        })}                      
      </Tabs>
      <TagSubject categry={'COMPLEX'} saveDifficult={(value)=>this.saveDifficultLevel(value)} form={form} showData={initShowData}/>
  </div>
  }
      
      </div>
  }
  // 渲染哪种题型 //题型类型 （普通题型：NORMAL | 二层题型：TWO_LEVEL | 复合题型：COMPLEX）
  renderPattern() {
    switch (this.state.patternType) {
      case 'NORMAL':
        {
          return this.renderNormal();
        }
      case 'TWO_LEVEL':
        {
          return this.renderTwoLevel(this.state.patternType);
        }
      case 'COMPLEX':
        {
          return this.renderComplex(this.state.patternType);
        }
      default:
        break;
    }
  }
  render() {
    const { dataSource, form } = this.props;
    const {cancelLoading} = this.state;
    const heightModal = window.innerHeight - 238;

    // console.log("dataSource",dataSource)
    let Plugin = null;
    if(dataSource.pattern && dataSource.pattern.patternPlugin && isUsePlugin(dataSource.pattern.patternPlugin.pluginPhase,"P3_ADD_QUESTION")){
      Plugin = require("@/frontlib/"+ dataSource.pattern.patternPlugin.frontEndModuleName +"Plugin/Add"+ dataSource.pattern.patternPlugin.frontEndModuleName +"Question/index").default;
    }

    return (
      <Modal
        width={725}
        visible={this.state.visible}
        centered={true}
        title={dataSource.title}
        closable={false}
        destroyOnClose={cancelLoading}
        maskClosable={false}
        cancelText={<FormattedMessage id="app.cancel" defaultMessage="取消"></FormattedMessage>}
        okText={<FormattedMessage id="app.submit" defaultMessage="提交"></FormattedMessage>}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className="addNewSubjectModal"
      >
        <div className="modal-body" style={{maxHeight:heightModal,height:heightModal}}>
        <Form layout="vertical">            
          {(this.state.patternType == '' || Plugin) ? null : this.renderPattern()}
          { Plugin && <Plugin 
                        form={form} 
                        masterData={dataSource.masterData} 
                        index = {this} 
                        dataSource={dataSource}/>}
        </Form>
          
                
        </div>
      </Modal>
    );
  }
}

export default AddNewSubjectModal;
