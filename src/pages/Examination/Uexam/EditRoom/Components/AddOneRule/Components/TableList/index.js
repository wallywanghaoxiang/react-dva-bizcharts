import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import moment from 'moment';
import styles from './index.less';

/**
 * 新增策略场次表格
 * @author tina.zhang.xu
 * @date   2019-8-10
 */

@connect(({ editroom }) => ({
  stdDict: editroom.stdDict,
}))
class TableList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      examBatchList: [], // 表格数据;
      showAdd: true, // 是否显示"添加一场"
    };
    this.uplimite = 100; // 数值上限
    this.amNum = 1; // 上午场次,默认是1
    this.pmNum = 0; // 下午场次
    this.stdNum = 1; // 场次序号
    this.backupNum = 0; // 备用场次序号
  }

  componentDidMount() {
    const { amBeginTime, examTime } = this.props;
    const startTimeAm = moment(JSON.parse(JSON.stringify(amBeginTime)));
    // const startTimePm = moment(JSON.parse(JSON.stringify(pmBeginTime)));
    this.setState({
      examBatchList: [
        {
          name: '批次1',
          startTime: startTimeAm.format('HH:mm'),
          endTime: startTimeAm.add(examTime, 'm').format('HH:mm'),
          type: 'STARDARD',
        },
      ],
    });
  }

  componentWillReceiveProps(nextProps) {
    const { amBeginTime, pmBeginTime, examTime } = this.props;
    const { examBatchList } = this.state;
    const data = JSON.parse(JSON.stringify(examBatchList));
    if (
      nextProps.amBeginTime === amBeginTime &&
      nextProps.pmBeginTime === pmBeginTime &&
      nextProps.examTime === examTime
    ) {
      return;
    }
    this.flashList(nextProps.amBeginTime, nextProps.pmBeginTime, nextProps.examTime, data);
  }

  showList = data => {
    const { stdDict, callback } = this.props;
    const html = [];
    callback(data, this.stdNum, this.backupNum); // 将最新的列表信息更新出去
    for (let i = 0; i < data.length; i += 1) {
      html.push(
        <tr key={i}>
          <td style={{ width: 100 }}>{data[i].name}</td>
          <td style={{ width: 130 }}>
            <Select
              style={{ width: 75 }}
              value={data[i].type}
              onChange={e => this.handleChange(e, i)}
            >
              {stdDict &&
                stdDict.map(Item => {
                  return (
                    <Select.Option key={Item.code} value={Item.code}>
                      {Item.value}
                    </Select.Option>
                  );
                })}
            </Select>
          </td>
          <td>{`${data[i].startTime}-${data[i].endTime}`}</td>
          <td>
            {i > 0 && i === data.length - 1 && (
              <i className="iconfont icon-detele" onClick={this.lessExam} />
            )}
          </td>
        </tr>
      );
    }
    return html;
  };

  flashList = (amBeginTime, pmBeginTime, examTime, data) => {
    const dataTemp = data;
    this.stdNum = 0;
    this.backupNum = 0;
    this.amNum = 0;
    this.pmNum = 0;
    let type = '';
    let popStart = 0;
    for (let i = 0; i < dataTemp.length; i += 1) {
      if (dataTemp[i].type === 'STARDARD') {
        this.stdNum += 1;
        dataTemp[i].name = `批次${this.stdNum}`;
      } else {
        this.backupNum += 1;
        dataTemp[i].name = `备用${this.backupNum}`;
      }
      type = this.addAmOrPm(amBeginTime, pmBeginTime, examTime);
      if (type === 'am') {
        this.amNum += 1;
        dataTemp[i].startTime = moment(JSON.parse(JSON.stringify(amBeginTime)))
          .add(examTime * (this.amNum - 1), 'm')
          .format('HH:mm');
        dataTemp[i].endTime = moment(JSON.parse(JSON.stringify(amBeginTime)))
          .add(examTime * this.amNum, 'm')
          .format('HH:mm');
      } else if (type === 'pm') {
        this.pmNum += 1;
        dataTemp[i].startTime = moment(JSON.parse(JSON.stringify(pmBeginTime)))
          .add(examTime * (this.pmNum - 1), 'm')
          .format('HH:mm');
        dataTemp[i].endTime = moment(JSON.parse(JSON.stringify(pmBeginTime)))
          .add(examTime * this.pmNum, 'm')
          .format('HH:mm');
      } else if (type === 'full') {
        if (popStart === 0) {
          // 记录满的位置
          popStart = i;
        }
      }
    }
    this.setState({
      showAdd: true,
    });
    if (popStart > 0) {
      const length = data.length - popStart;
      for (let k = 0; k < length; k += 1) {
        data.pop(); // 超过总场次数，需要删除后面的场次
      }
      this.setState({
        showAdd: false,
      });
    }
    if (this.addAmOrPm(amBeginTime, pmBeginTime, examTime) === 'full') {
      // 判断下一场
      this.setState({
        showAdd: false,
      });
    }

    this.setState({
      examBatchList: data,
    });
  };

  // 修改场次类型
  handleChange = (e, index) => {
    const { amBeginTime, pmBeginTime, examTime } = this.props;
    const { examBatchList } = this.state;
    const data = JSON.parse(JSON.stringify(examBatchList));
    data[index].type = e;
    this.flashList(amBeginTime, pmBeginTime, examTime, data);
  };

  addAmOrPm = (amBeginTime, pmBeginTime, examTime) => {
    // 判断下一个增加的是上午场还是下午场
    const Temp1 = moment(JSON.parse(JSON.stringify(amBeginTime)));
    const Temp2 = moment(JSON.parse(JSON.stringify(pmBeginTime)));
    if (
      Temp1.add(examTime * (this.amNum + 1), 'm').isBefore(moment(Temp2.format('HH:mm'), 'HH:mm'))
    ) {
      return 'am'; // 增加的是上午场
    }
    if (Temp2.add(examTime * (this.pmNum + 1), 'm').isBefore(moment('23:59:59', 'HH:mm:ss'))) {
      return 'pm'; // 增加测是下午场
    }
    return 'full'; // 表示无法增加场次了
  };

  addExam = () => {
    const { amBeginTime, pmBeginTime, examTime } = this.props;
    const { examBatchList } = this.state;
    let T1;
    let T2;
    const data = JSON.parse(JSON.stringify(examBatchList));
    const type = this.addAmOrPm(amBeginTime, pmBeginTime, examTime);
    let i = 0;
    if (type === 'full') {
      return;
    }
    if (type === 'am') {
      this.amNum += 1;
      i = this.amNum;
      T1 = moment(JSON.parse(JSON.stringify(amBeginTime)));
      T2 = moment(JSON.parse(JSON.stringify(amBeginTime)));
    } else if (type === 'pm') {
      this.pmNum += 1;
      i = this.pmNum;
      T1 = moment(JSON.parse(JSON.stringify(pmBeginTime)));
      T2 = moment(JSON.parse(JSON.stringify(pmBeginTime)));
    }
    this.stdNum += 1;
    data.push({
      name: `批次${this.stdNum}`,
      startTime: T1.add(examTime * (i - 1), 'm').format('HH:mm'),
      endTime: T2.add(examTime * i, 'm').format('HH:mm'),
      type: 'STARDARD',
    });
    this.setState({
      examBatchList: data,
    });
    if (this.addAmOrPm(amBeginTime, pmBeginTime, examTime) === 'full') {
      // 判断下一场
      this.setState({
        showAdd: false,
      });
    }
  };

  lessExam = () => {
    const { examBatchList } = this.state;
    const data = JSON.parse(JSON.stringify(examBatchList));
    if (data.length === 1) {
      return;
    }
    const a = data.pop(); // 删掉最后一个数组
    if (a.type === 'STARDARD') {
      this.stdNum -= 1;
    }
    if (a.type === 'BACKUP') {
      this.backupNum -= 1;
    }
    if (this.pmNum > 0) {
      this.pmNum -= 1;
    } else {
      this.amNum -= 1;
    }

    this.setState({
      examBatchList: data,
      showAdd: true,
    });
  };

  render() {
    const { examBatchList, showAdd } = this.state;
    return (
      <div className={styles.myTableList}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 110 }}>
                {formatMessage({
                  id: 'app.text.uexam.examination.editroom.details.batch',
                  defaultMessage: '批次',
                })}
              </th>
              <th style={{ width: 120 }}>
                {formatMessage({
                  id: 'app.text.uexam.examination.editroom.details.batchType',
                  defaultMessage: '批次类型',
                })}
              </th>
              <th>
                {formatMessage({
                  id: 'app.text.uexam.examination.editroom.details.time',
                  defaultMessage: '时间',
                })}
              </th>
              <th> </th>
            </tr>
          </thead>
        </table>
        <div className={styles.tableBody}>
          <table className={styles.table}>
            <tbody>{examBatchList.length > 0 && this.showList(examBatchList)}</tbody>
          </table>
        </div>
        {showAdd && (
          <div className={styles.add}>
            <a onClick={this.addExam}>+添加批次</a>
          </div>
        )}
      </div>
    );
  }
}
export default TableList;
