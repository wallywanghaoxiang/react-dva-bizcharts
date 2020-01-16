import React, { Component } from 'react';
import { Modal, messag, Tabs } from 'antd';
import  './index.less';
import styles from './index.less';
import { fromCharCode } from '@/frontlib/utils/utils';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import { read } from 'fs';
import Item from 'antd/lib/list/Item';
import { Button } from 'antd/lib/radio';


/**
 * 总分得分显示
 */
class TopOverallScore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overall: 0,//总得分
      overMark: "",//总分
    };
  }

  componentDidMount() {

  }

  render() {
    const {score,mark}=this.props;
    return (
       <div className="overall1">
          <div className="overallScore"><span className="score">{score}</span>/{mark}分 <span className="slogan">Well Done!</span> </div>
       </div>
    );
  }
}

export default TopOverallScore;
