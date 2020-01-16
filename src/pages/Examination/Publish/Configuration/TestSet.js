/* eslint-disable no-unneeded-ternary */
/* eslint-disable func-names */
/* eslint-disable no-lonely-if */
/* eslint-disable no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-plusplus */
/* eslint-disable eqeqeq */
/**
 * 考试设置
 * @author tina
 */
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import './index.less';
import TestSetModal from './TestSetModal/main';

@connect(({ release }) => ({
  distribution: release.distribution,
  strategy: release.strategy,
  rectify: release.rectify,
  taskType: release.taskType,
  distributeType: release.distributeType,
  examType: release.examType,
  rectifyType: release.rectifyType,
}))
class TestSet extends PureComponent {
  state = {
    distributionName: '',
    strategyName: '',
    rectifyName: '',
  };

  componentDidMount() {
    const {
      dispatch,
      distribution,
      strategy,
      rectify,
      distributeType,
      examType,
      rectifyType,
      taskType,
    } = this.props;
    if (taskType && distribution.length == 0) {
      /** 获取分发试卷方式字典接口* */
      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'DIST_TYPE' },
      }).then(data => {
        dispatch({
          type: 'release/saveDistribution',
          payload: data,
        });
        const { distribution, setDistd } = this.props;
        setDistd(distribution && distribution[0].code);
        this.setState({
          distributionName: distribution && distribution[0].value,
        });
      });
      /** 获取策略字典接口* */
      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'EXAM_TYPE' },
      }).then(data => {
        dispatch({
          type: 'release/saveStrategy',
          payload: data,
        });
        const ids = (this.props.strategy && this.props.strategy[0].code) || '';

        const idNames = (this.props.strategy && this.props.strategy[0].value) || '';

        this.setState({
          strategyName: idNames,
        });
        this.props.setStrate(ids);
      });

      /** 人工纠偏* */
      dispatch({
        type: 'dict/getDictionariesData',
        payload: { type: 'RECTIFY_TYPE' },
      }).then(data => {
        dispatch({
          type: 'release/saveRectify',
          payload: data,
        });
        this.setState({
          rectifyName: data && data[0].value,
        });
      });
    } else {
      const examTypeArr = examType.split(',');
      const setDistribution = distribution.filter(function(x) {
        return x.code == distributeType;
      });
      const setRectify = rectify.filter(function(x) {
        return x.code == rectifyType;
      });
      const setStrategyStr = [];
      strategy.forEach(item => {
        examTypeArr.forEach(vo => {
          if (item.code == vo) {
            setStrategyStr.push(item.value);
          }
        });
      });
      this.setState({
        distributionName: setDistribution[0].value,
        rectifyName: setRectify[0].value,
        strategyName: setStrategyStr.join(' | '),
      });
    }
  }

  testPaperSet = () => {
    // 此处获取字典字段
    const { distribution, strategy, rectify, dispatch } = this.props;
    const { distributionName, strategyName, rectifyName } = this.state;
    const dataSource2 = this.props.distribution;
    const dataSource1 = this.props.strategy;
    TestSetModal({
      dataSource: {
        distribution,
        strategy,
        rectify,
        distributionName,
        strategyName: strategyName.split(' | '),
        rectifyName,
      },
      callback: (distribution, strategy, rectify) => {
        let strate = '';
        for (let i = 0; i < strategy.length; i++) {
          if (i === strategy.length - 1) {
            strate += strategy[i];
          } else {
            if (strategy[i].trim() != '') {
              strate += `${strategy[i]} | `;
            }
          }
        }
        if (distribution) {
          this.setState({
            distributionName: distribution,
          });
        }
        // if(strate) {
        this.setState({
          strategyName: strate,
        });
        // }

        if (rectify) {
          this.setState({
            rectifyName: rectify,
          });
        }
        const that = this;
        const setDist = dataSource2.filter(function(x) {
          const distributions = distribution ? distribution : that.state.distributionName;
          return x.value == distributions;
        });
        const setStrategy = [];
        const stateStr = strate.split(' | ');
        const strates = strategy.length > 0 ? strategy : stateStr;
        dataSource1.forEach(item => {
          strates.forEach(vo => {
            if (item.value == vo) {
              setStrategy.push(item);
            }
          });
        });

        let ids = '';
        setStrategy.forEach((item, idx) => {
          if (idx == setStrategy.length - 1) {
            ids += item.code;
          } else {
            ids += `${item.code},`;
          }
        });

        const setRectify = this.props.rectify.filter(function(x) {
          const rectifys = rectify ? rectify : that.state.rectifyName;
          return x.value == rectifys;
        });

        dispatch({
          type: 'release/saveExamSetting',
          distributeType: setDist[0].code,
          examType: ids,
          rectifyType: setRectify[0].code,
        });

        // this.props.setDistd(setDist[0].code);
        // this.props.setStrate(ids);

        // 确定设置条件
      },
    });
  };

  render() {
    const { distributionName, strategyName, rectifyName } = this.state;
    return (
      <div className="setPaper">
        <h2>
          {formatMessage({
            id: 'app.examination.inspect.task.detail.exam.setting.title',
            defaultMessage: '考试设置',
          })}
        </h2>
        <div className="setResult">
          <div>
            {formatMessage({
              id: 'app.examination.inspect.task.detail.dist.mode.title',
              defaultMessage: '分发试卷方式：',
            })}
            <span>{distributionName}</span>
            {formatMessage({
              id: 'app.examination.inspect.task.detail.exam.strategy.title',
              defaultMessage: '考试策略：',
            })}
            <span>
              {strategyName ||
                formatMessage({ id: 'app.examination.inspect.exam.no.data', defaultMessage: '无' })}
            </span>
            {formatMessage({
              id: 'app.examination.inspect.task.detail.manual.rectification.title',
              defaultMessage: '人工纠偏：',
            })}
            <span>{rectifyName}</span>
          </div>

          <div
            className="icon-btn iconButton"
            style={{ display: 'flex', alignItems: 'center', width: 'auto' }}
            onClick={this.testPaperSet}
          >
            <i className="iconfont iconfont icon-set" />
            <span className="icontext textsColor">
              {formatMessage({
                id: 'app.button.exam.publish.modify.title',
                defaultMessage: '修改',
              })}
            </span>
          </div>
          {/* <IconButton
                  onClick={this.testPaperSet}
                  text = "修改"
                  iconName = "iconfont icon-set"
                  className="iconButton"
                  textColor= "textsColor"
              /> */}
        </div>
      </div>
    );
  }
}

export default TestSet;
