import React, { PureComponent } from 'react';
import styles from './index.less';
import { Input } from 'antd';

/*
    填空答题区域

 */

export default class SubQuestionAnswerArea extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() {}

  render() {
    const { index, value, isRight, callback, allowMultiAnswerMode } = this.props;
    let borderColor = '';
    if (isRight == undefined) {
    } else if (isRight) {
      borderColor = '1px solid #03C46B';
    } else {
      borderColor = '1px solid #FF6E4A';
    }
    return (
      <div className={styles.answerArea} style={{ border: borderColor }}>
        {allowMultiAnswerMode == 'Y' && (
          <div className={styles.question_num} style={{ borderRight: borderColor }}>
            {index}
          </div>
        )}
        <Input
          className={styles.ant_input}
          defaultValue={value}
          value={value}
          onChange={e => {
            console.log(e.target.value);
            callback(e.target.value);
          }}
        />
      </div>
    );
  }
}
