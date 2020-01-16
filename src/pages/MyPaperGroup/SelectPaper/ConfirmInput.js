/* eslint-disable no-restricted-globals */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-lonely-if */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import React from 'react';
import { message, Input } from 'antd';
import '../index.less';
import { connect } from 'dva';

@connect(({ papergroup }) => ({
  currentPaperDetail: papergroup.currentPaperDetail,
  showData: papergroup.showData,
  paperData: papergroup.paperData,
  defaultPatternData: papergroup.defaultPatternData,
}))
class ConfirmInput extends React.PureComponent {
  state = {
    isRight: true,
  };

  isInteger(obj, precision) {
    return (Number(obj) * 1000) % (Number(precision) * 1000) === 0;
  }

  saveLocalData(item, flag) {
    const LocalData = localStorage.getItem('confirmInputScore');
    let body = {};
    if (LocalData) {
      body = JSON.parse(LocalData);
    }
    body[item.id] = flag;
    localStorage.setItem('confirmInputScore', JSON.stringify(body));
  }

  render() {
    const {
      defaultValue,
      index,
      datakey,
      item,
      defaultPatternData,
      isComplex,
      precision,
    } = this.props;

    const { isRight } = this.state;

    const { saveLocalData } = this;

    let customStyle = {};

    if (!isRight) {
      customStyle = { border: '1px solid red' };
    }

    return (
      <Input
        className="question_score"
        defaultValue={defaultValue}
        style={customStyle}
        onChange={e => {
          if (!(typeof Number(e.target.value) === 'number' && !isNaN(Number(e.target.value)))) {
            this.setState({ isRight: false });
            saveLocalData(item, false);
            return;
          }
          if (Number(e.target.value) <= 0) {
            this.setState({ isRight: false });
            saveLocalData(item, false);
            return;
          }
          if (isComplex) {
            if (item.data.patternType === 'TWO_LEVEL') {
              if (!this.isInteger(e.target.value / item.data.subQuestion.length, precision)) {
                this.setState({ isRight: false });
                saveLocalData(item, false);
                return;
              }
            }

            if (!this.isInteger(e.target.value, precision)) {
              this.setState({ isRight: false });
              saveLocalData(item, false);
              return;
            }
          } else {
            if (item.data.patternType === 'TWO_LEVEL') {
              if (!this.isInteger(e.target.value / item.data.subQuestion.length, precision)) {
                this.setState({ isRight: false });
                saveLocalData(item, false);
                return;
              }
            }

            if (!this.isInteger(e.target.value, precision)) {
              this.setState({ isRight: false });
              saveLocalData(item, false);
              return;
            }
          }

          this.setState({ isRight: true });
          saveLocalData(item, true);
        }}
        onBlur={e => {
          if (!(typeof Number(e.target.value) === 'number' && !isNaN(Number(e.target.value)))) {
            message.warn('请输入正确数字！');
            saveLocalData(item, false);
            this.setState({ isRight: false });
            return;
          }
          if (Number(e.target.value) <= 0) {
            message.warn('请输入大于0的分数！');
            this.setState({ isRight: false });
            saveLocalData(item, false);
            return;
          }
          if (isComplex) {
            if (item.data.patternType === 'TWO_LEVEL') {
              if (this.isInteger(e.target.value / item.data.subQuestion.length, precision)) {
                defaultPatternData[datakey].pattern.groups[
                  index
                ].pattern.mainPatterns.subQuestionMark =
                  e.target.value / item.data.subQuestion.length;
              } else {
                message.warn(
                  `本题分数请设置为${Number(precision) * item.data.subQuestion.length}的倍数`
                );
                saveLocalData(item, false);
                this.setState({ isRight: false });
                return;
              }
            } else {
              if (!this.isInteger(e.target.value, precision)) {
                message.warn(`本题分数请设置为${precision}的倍数`);
                this.setState({ isRight: false });
                saveLocalData(item, false);
                return;
              }
              defaultPatternData[datakey].pattern.groups[index].pattern.mainPatterns.questionMark =
                e.target.value;
            }
          } else {
            if (item.data.patternType === 'TWO_LEVEL') {
              if (this.isInteger(e.target.value / item.data.subQuestion.length, precision)) {
                // defaultPatternData[datakey].pattern.mainPatterns.subQuestionMark = e.target.value/item.data.subQuestion.length
                if (!defaultPatternData[datakey].pattern.subQuestionPatterns) {
                  defaultPatternData[datakey].pattern.subQuestionPatterns = [];
                }
                defaultPatternData[datakey].pattern.subQuestionPatterns[index] = {
                  subFullMark: Number(e.target.value),
                  subQuestionMark: e.target.value / item.data.subQuestion.length,
                  subQuestionCount: item.data.subQuestion.length,
                };
              } else {
                message.warn(
                  `本题分数请设置为${Number(precision) * item.data.subQuestion.length}的倍数`
                );
                saveLocalData(item, false);
                this.setState({ isRight: false });
                return;
              }
            } else {
              if (!this.isInteger(e.target.value, precision)) {
                message.warn(`本题分数请设置为${precision}的倍数`);
                this.setState({ isRight: false });
                saveLocalData(item, false);
                return;
              }
              if (!defaultPatternData[datakey].pattern.subQuestionPatterns) {
                defaultPatternData[datakey].pattern.subQuestionPatterns = [];
              }
              defaultPatternData[datakey].pattern.subQuestionPatterns[index] = {
                questionMark: Number(e.target.value),
              };
            }
          }
          saveLocalData(item, true);
          this.setState({ isRight: true });
        }}
      />
    );
  }
}

export default ConfirmInput;
