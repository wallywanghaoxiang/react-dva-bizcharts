import React, { PureComponent } from 'react';
import styles from './index.less';
import AddNewSubjectModal from '../AddSubject/AddNewSubjectModal/api';
import QuestionShowCard from '../QuestionShowCard';
import { returnSubIndex, isUsePlugin } from '@/frontlib/utils/utils';
import { formatMessage, FormattedMessage } from 'umi/locale';
/*
  添加试题组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    subIndex      二层题型序号
  * @param     {[type]}    mainIndex     大题序号
  * @param     {[type]}    questionIndex 小题序号
  * @param     {[type]}    focus         题目焦点
  * @param     {[type]}    showData      展示数据
  * @param     {[type]}    editData      编辑数据
  * @param     {[type]}    dataSource    保存数据
  * @param     {[type]}    beforeNum     复合题型此题之前小题序号
  * @param     {[type]}    masterData    主控数据
  * @param     {[type]}    type          题目类型
  * @param     {[type]}    paperId       试卷ID
 */

export default class ItemCard extends PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-18
   * @copyright 添加题目
   */
  addQuestion() {
    const { showData, editData, pattern, masterData, paperId, type } = this.props;

    // console.log('===========showData============');
    // console.log(type)
    // console.log(showData);

    AddNewSubjectModal({
      dataSource: {
        title: <FormattedMessage id="app.question.edit" defaultMessage="添加题目" />,
        questionData: editData,
        paperID: paperId,
        masterData: masterData,
        patternType: type,
        pattern: pattern,
      },
      callback: questioJson => {
        this.reLoadPaperData();
      },
    });

    // console.log('=============editData============');
    // console.log(editData);
    // console.log(masterData)
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-26
   * @copyright 刷新paperData
   * @return    {[type]}    [description]
   */
  reLoadPaperData() {
    this.props.self.reLoadPaperData();
  }
  reLoadVerifiesData() {
    this.props.self.reLoadVerifiesData();
  }
  changeleftMeus(mainIndex, questionIndex, subIndex, type, option = undefined) {
    const { self, dataSource } = this.props;

    let itemQuestionIndex = questionIndex;
    if (type == 'NORMAL') {
      itemQuestionIndex = itemQuestionIndex - 1;
    }

    if (
      dataSource[itemQuestionIndex] &&
      dataSource[itemQuestionIndex].data &&
      dataSource[itemQuestionIndex].data.mainQuestion &&
      dataSource[itemQuestionIndex].data.mainQuestion.answerType === 'CHOICE'
    ) {
      self.changeleftMeus(mainIndex, questionIndex, subIndex, type);
    } else {
      setTimeout(function() {
        self.changeleftMeus(mainIndex, questionIndex, subIndex, type);
      }, 200);
    }

    /*添加题目先改变主控数据,再呼出弹框,后期继续优化。。。*/
    if (option == 'add') {
      let that = this;
      setTimeout(function() {
        that.addQuestion();
      }, 300);
    }
  }

  scoringMachine(data) {
    this.props.self.scoringMachine(data);
  }

  renderNoneQuestion() {
    const { questionIndex, beforeNum, type, masterData, subs } = this.props;
    if (subs) {
      return (
        <div className="questionSubs">
          {subs.map((item, index) => {
            return <div className="questionIndex marginTop">{item}</div>;
          })}
        </div>
      );
    } else {
      return (
        <div>
          <div className="questionIndex">
            {type == 'NORMAL' ? returnSubIndex(masterData, questionIndex - 1, 0) : beforeNum}
          </div>
        </div>
      );
    }
  }

  render() {
    const {
      index,
      onClick,
      focus,
      subIndex,
      questionIndex,
      mainIndex,
      beforeNum,
      self,
      type,
      showData,
      dataSource,
      masterData,
      beforeNums,
      editData,
      paperId,
      invalidate,
      isExamine,
      ExampaperStatus,
      paperData,
      pattern,
    } = this.props;

    let itemQuestionIndex = questionIndex;
    let jsx = [];

    let className = 'addquestion-card';
    if (focus == true) {
      className = 'addquestion-card  addquestion-focus';
    }

    if (
      pattern &&
      pattern.patternPlugin &&
      pattern.patternPlugin.frontEndModuleName &&
      isUsePlugin(pattern.patternPlugin.pluginPhase, 'P4_SHOW_STATIC_QUESTION')
    ) {
      const PluginCard = require('@/frontlib/' +
        pattern.patternPlugin.frontEndModuleName +
        'Plugin/Static' +
        pattern.patternPlugin.frontEndModuleName +
        'Card/index').default;
      if (type == 'NORMAL') {
        itemQuestionIndex = itemQuestionIndex - 1;
      }
      jsx.push(
        <PluginCard
          dataSource={dataSource[itemQuestionIndex]}
          showData={showData}
          editData={editData}
          paperID={paperId}
          paperData={paperData}
          isExamine={isExamine}
          masterData={masterData}
          patternType={type}
          pattern={pattern}
          invalidate={invalidate}
          type={type}
          questionCount={beforeNum}
          mainIndex={mainIndex}
          questionIndex={questionIndex}
          subIndex={subIndex}
          beforeNum={beforeNums}
          self={this}
          ExampaperStatus={ExampaperStatus}
          onChange={e => {
            self.changeSubIndex(e);
          }}
        />
      );
    } else if (type == 'NORMAL') {
      itemQuestionIndex = itemQuestionIndex - 1;
      if (dataSource[itemQuestionIndex] && dataSource[itemQuestionIndex].id) {
        jsx.push(
          <QuestionShowCard
            dataSource={dataSource[itemQuestionIndex]}
            showData={showData}
            editData={editData}
            paperID={paperId}
            isExamine={isExamine}
            masterData={masterData}
            invalidate={invalidate}
            patternType={type}
            type={type}
            questionCount={returnSubIndex(masterData, questionIndex - 1, 0)}
            mainIndex={mainIndex}
            questionIndex={questionIndex}
            subIndex={subIndex}
            key={`question_${dataSource[itemQuestionIndex].id}`}
            self={this}
            focus={focus}
            ExampaperStatus={ExampaperStatus}
            changeleftMeus={() => {
              this.changeleftMeus(mainIndex, questionIndex, subIndex, type);
            }}
          />
        );
      }
    } else if (type == 'TWO_LEVEL') {
      if (dataSource[itemQuestionIndex] && dataSource[itemQuestionIndex].id) {
        jsx.push(
          <QuestionShowCard
            dataSource={dataSource[itemQuestionIndex]}
            showData={showData}
            editData={editData}
            paperID={paperId}
            isExamine={isExamine}
            masterData={masterData}
            patternType={type}
            invalidate={invalidate}
            type={type}
            questionCount={beforeNum}
            mainIndex={mainIndex}
            questionIndex={questionIndex}
            subIndex={subIndex}
            beforeNum={beforeNums}
            key={`question_${dataSource[itemQuestionIndex].id}`}
            self={this}
            focus={focus}
            ExampaperStatus={ExampaperStatus}
            changeleftMeus={() => {
              this.changeleftMeus(mainIndex, questionIndex, subIndex, type);
            }}
          />
        );
      }
    } else if (type == 'COMPLEX') {
      itemQuestionIndex = 0;
      if (dataSource[0] && dataSource[0].id) {
        jsx.push(
          <QuestionShowCard
            dataSource={dataSource[0]}
            showData={showData}
            editData={editData}
            masterData={masterData}
            invalidate={invalidate}
            paperID={paperId}
            isExamine={isExamine}
            type={type}
            questionCount={beforeNum}
            mainIndex={mainIndex}
            questionIndex={questionIndex}
            subIndex={subIndex}
            beforeNum={beforeNums}
            key={`question_${dataSource[itemQuestionIndex].id}`}
            self={this}
            focus={focus}
            ExampaperStatus={ExampaperStatus}
            changeleftMeus={() => {
              this.changeleftMeus(mainIndex, questionIndex, subIndex, type);
            }}
          />
        );
      }
    }

    // let isExamine = localStorage.getItem('isExamine');
    return (
      <div
        className={className}
        onClick={this.changeleftMeus.bind(this, mainIndex, questionIndex, subIndex, type)}
      >
        {dataSource[itemQuestionIndex] && dataSource[itemQuestionIndex].id ? (
          jsx
        ) : (
          <div>
            {this.renderNoneQuestion()}
            {isExamine == '0' && (
              <div className="addquestion-flex">
                <div
                  className="questionbtn"
                  style={masterData.allowChooseQuestion == 'Y' ? {} : { width: '100%' }}
                  onClick={this.changeleftMeus.bind(
                    this,
                    mainIndex,
                    questionIndex,
                    subIndex,
                    type,
                    'add'
                  )}
                >
                  <FormattedMessage id="app.question.edit" defaultMessage="添加题目" />
                </div>
                {masterData.allowChooseQuestion == 'Y' && (
                  <div className="questionbtn">
                    <FormattedMessage id="app.question.library" defaultMessage="题库选题" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
