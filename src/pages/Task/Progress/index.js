/**
 * 线上平台的，进入任务中
 * 启动业务：
 *  1、每隔一秒，获取当前时间戳并写入modal中，
 *  2、绑定页面刷新事件，禁止刷新页面（ 如果强制离开，则 对本地localstroage改写值  ）
 * 离开逻辑：
 *  1、移除间隔的写入事件
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Prompt from 'umi/prompt';
import pathToRegexp from 'path-to-regexp';
import Exam from './Exam';
import Practice from './Practice';

@connect(({ task }) => {
  const { taskId, storageKey, paperList = [], currentPaperId } = task;
  const { exerciseType } = paperList.find(item => item.paperId === currentPaperId) || {};
  return {
    taskId, // 任务id
    storageKey, // localStroage 对应的key值
    exerciseType, // 训练模式（考试模式:EXAM_MODEL，练习模式:EXER_MODEL）
  };
})
class Progress extends PureComponent {

  componentDidMount() {
    const { storageKey } = this.props;
    // 开始轮训写入当期时间戳到 stroage中
    localStorage.setItem(storageKey, Date.now());
    this.timer = setInterval(() => {
      localStorage.setItem(storageKey, Date.now());
    }, 1000);

    // 监听localstroage中的时间戳事件
    // TODO
    window.addEventListener('beforeunload', this.beforeunload, false);
    window.addEventListener('unload', this.unload, false);
  }

  componentWillUnmount() {
    const { storageKey } = this.props;
    // 取消监听
    // TODO
    window.removeEventListener('beforeunload', this.beforeunload);
    window.removeEventListener('unload', this.unload);

    // 取消逻辑循环
    clearInterval(this.timer);
    localStorage.removeItem(storageKey);
  }

  /**
   * 阻止页面刷新，或关系
   */
  beforeunload = e => {
    // 1、调用接口得知当前的状态是异常状态，则不阻止考试过程中自动登出。
    if (window.canChangeUrl) {
      return true;
    }

    // 2、如果判断到 localhost uid 不存在即，未登录，或者已退出登录，同上。
    if (!localStorage.getItem('uid')) {
      return true;
    }

    // 阻止页面刷新，关闭
    const event = e || window.event;
    event.returnValue = '';
    return false;
  };

  /**
   * 仍然退出的化，删除该任务的localstroage记录
   */
  unload = () => {
    const { storageKey } = this.props;
    localStorage.removeItem(storageKey);
  };

  render() {
    const { exerciseType } = this.props;
    const result = exerciseType === 'EXAM_MODEL' ? <Exam /> : <Practice />;
    return (
      <>
        <Prompt
          message={location => {
            // 考试的页面只能跳转到结束页面或者错误页面
            return (
              pathToRegexp('/task/:taskId/result').test(location.pathname) ||
              pathToRegexp('/exception/:type?').test(location.pathname)
            );
          }}
        />
        {result}
      </>
    );
  }
}

export default Progress;
