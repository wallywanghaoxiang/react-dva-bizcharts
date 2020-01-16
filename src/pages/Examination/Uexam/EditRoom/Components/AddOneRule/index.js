import React, { PureComponent } from 'react';
import { Button, Input, Modal, Radio, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import moment from 'moment';
import { connect } from 'dva';
import styles from './index.less';
import MyTimePicker from './Components/MyTimePicker/index';
import MyAddNum from './Components/MyAddNum/index';
import TableList from './Components/TableList/index';

/**
 * 新增策略
 * @author tina.zhang.xu
 * @date   2019-8-10
 *
 */

@connect(({ loading }) => ({
  addStrategyLoading: loading.effects['editroom/addStrategy'],
}))
class AddOneRule extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      limit: 'Y', // 默认限定
      amStartTime: moment('08:00', 'HH:mm'), // 上午开始时间
      pmStartTime: moment('13:00', 'HH:mm'), // 下午开始时间
      examTime: 30, // 默认考试30分钟
      tips: '', // 错误提示
    };
    this.examBatchList = {};
    this.backupNum = 0; // 备用场次
    this.standardNum = 1; // 标准场次
    this.name = ''; // 策略名称
    this.backupMachineNum = 5; // 备用机默认0
  }

  componentDidMount() {}

  // 103 新增策略
  addStrategy = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'editroom/addStrategy',
      payload: { data },
    }).then(() => {
      this.callback('add');
    });
  };

  // 保存策略
  handleOk = () => {
    const { amStartTime, pmStartTime, examTime, limit } = this.state;
    let tipInfo = '';
    const data = {
      orgId: localStorage.getItem('campusId'), // 组织者
      name: this.name, // 名称
      amBeginTime: amStartTime.format('HH:mm'), // 上午开始时间
      pmBeginTime: pmStartTime.format('HH:mm'), // 下午开始时间
      examTime, // 考试时长
      standardNum: this.standardNum, // 标准场次
      backupNum: this.backupNum, // 备用场次
      backupMachineNum: this.backupMachineNum,
      isLimited: limit,
      isMakeUp: 'N', // 是否允许补考
      examBatchList: this.examBatchList,
    };
    if (this.name.length > 20) {
      tipInfo = formatMessage({
        id: 'app.text.clmcbncg20z',
        defaultMessage: '策略名称不能超过20字',
      });
    } else if (this.name.length === 0) {
      tipInfo = formatMessage({ id: 'app.text.qsrclmc', defaultMessage: '请输入策略名称' });
    }
    if (!this.checkData(this.examBatchList)) {
      tipInfo = formatMessage({
        id: 'app.text.uexam.examination.editroom.addonerule.atLeastOneBatchTypeAsTheStandard',
        defaultMessage: '至少要有一个批次的类型为标准',
      });
    }
    if (tipInfo) {
      this.setState({
        tips: tipInfo,
      });
    } else {
      this.addStrategy(data);
    }
  };

  handleCancel = () => {
    this.callback();
  };

  callback = e => {
    const { callback } = this.props;
    callback(e);
  };

  checkData = data => {
    // 判断有没有标准批次
    const a = data.some(Item => {
      return Item.type === 'STARDARD';
    });
    return a;
  };

  // 修改上午和下午的开始时间
  startTime = (time, when) => {
    if (when === 'am') {
      this.setState({
        amStartTime: time,
      });
    } else if (when === 'pm') {
      this.setState({
        pmStartTime: time,
      });
    }
  };

  // 设置考试时长（分钟）
  setEaxmTime = num => {
    this.setState({
      examTime: num,
    });
  };

  // 保存备用机数量
  setBackupNum = num => {
    this.backupMachineNum = num;
  };

  // 保存场次等信息
  saveDataList = (data, std, bac) => {
    this.examBatchList = data;
    this.standardNum = std;
    this.backupNum = bac;
  };

  limit = e => {
    this.setState({
      limit: e.target.value,
    });
  };

  // 策略名称
  inputName = e => {
    this.name = e.target.value;
  };

  // 弹框底部功能：分页和按钮
  footer = tips => {
    const html = (
      <div className={styles.footer}>
        <div className={styles.info}>{tips && tips}</div>
        <div className={styles.btns}>
          <Button className={styles.btnCancel} onClick={this.handleCancel}>
            {formatMessage({ id: 'app.text.qx', defaultMessage: '取消' })}
          </Button>
          <Button className={styles.btnOk} onClick={this.handleOk}>
            {formatMessage({ id: 'app.text.bccl', defaultMessage: '保存策略' })}
          </Button>
        </div>
      </div>
    );
    return html;
  };

  // 弹窗顶部的信息
  head = () => {
    const html = (
      <div className={styles.head}>
        <div className={styles.title}>
          {formatMessage({ id: 'app.text.xzcl', defaultMessage: '新增策略' })}
        </div>
      </div>
    );
    return html;
  };

  render() {
    const { limit, amStartTime, pmStartTime, examTime, tips } = this.state;
    return (
      <Modal
        title={null}
        centered
        visible
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okButtonProps={{ disabled: true }}
        width={460}
        closable={false}
        footer={null}
        maskClosable={false}
      >
        <div className={styles.addOneRule}>
          <>{this.head()}</>
          <div className={styles.input}>
            {formatMessage({ id: 'app.text.clmc', defaultMessage: '策略名称' })}
            <span>*</span>
            <Input
              onChange={this.inputName}
              placeholder={formatMessage({
                id: 'app.text.qsrclmc',
                defaultMessage: '请输入策略名称',
              })}
            />
          </div>
          <div className={styles.line} />
          <div className={styles.setTimeArea}>
            <div className={styles.setTime}>
              {formatMessage({ id: 'app.text.swkssj', defaultMessage: '上午开始时间：' })}
              <MyTimePicker when="am" defaultValue="8:00" callback={this.startTime} />
            </div>
            <div className={styles.setTime}>
              {formatMessage({ id: 'app.text.xwkssj', defaultMessage: '下午开始时间：' })}
              <MyTimePicker when="pm" defaultValue="13:00" callback={this.startTime} />
            </div>
            <div className={styles.setTime}>
              <span className={styles.leftttt}>
                {formatMessage({ id: 'app.text.kssz', defaultMessage: '考试时长：' })}
              </span>
              <MyAddNum value={examTime} uplimite={120} callback={this.setEaxmTime} />
              {formatMessage({ id: 'undefined', defaultMessage: '（分钟）' })}
            </div>
            <div className={styles.setTime}>
              <span className={styles.leftttt}>
                {formatMessage({
                  id: 'app.text.standardBatchSpareMachineNumber',
                  defaultMessage: '标准批次备用机数：',
                })}
              </span>
              <MyAddNum value={5} uplimite={100} callback={this.setBackupNum} />
            </div>
          </div>
          <div className={styles.tableList}>
            <TableList
              amBeginTime={amStartTime}
              pmBeginTime={pmStartTime}
              examTime={examTime}
              callback={this.saveDataList}
            />
          </div>
          <div className={styles.limit}>
            <div>
              {formatMessage({ id: 'app.text.kcrs', defaultMessage: '考场人数' })}
              <Tooltip
                title={formatMessage({
                  id:
                    'app.message.limitCanArrangeTheExamineeNumberMoreThanTestStudentsMachineRemainingNumber',
                  defaultMessage: '限定：可安排考生数不可超过考场学生机剩余数',
                })}
                arrowPointAtCenter
              >
                <i className="iconfont icon-help" />
              </Tooltip>
            </div>
            <div>
              <Radio.Group onChange={this.limit} value={limit}>
                <Radio value="Y">
                  {formatMessage({ id: 'app.text.xd', defaultMessage: '限定' })}
                </Radio>
                <Radio value="N">
                  {formatMessage({ id: 'app.text.bxd', defaultMessage: '不限定' })}
                </Radio>
              </Radio.Group>
            </div>
          </div>
          <div className={styles.line} />
          <>{this.footer(tips)}</>
        </div>
      </Modal>
    );
  }
}
export default AddOneRule;
