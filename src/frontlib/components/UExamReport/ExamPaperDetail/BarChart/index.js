/*
 * @Author    tina.zhang
 * @Date      2019-3-15
 * @copyright 教师端报告页柱状图
 */
import React, { PureComponent } from 'react';
import { Card, Tabs, Button, Message, Select } from 'antd';
import { connect } from 'dva';
import './index.less';
import { lessWords } from '@/frontlib/utils/utils';
import { formatMessage } from 'umi/locale';

//import { Bar } from 'ant-design-pro/lib/Charts';
import {
  G2,
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord,
  Label,
  Legend,
  View,
  Guide,
  Shape,
  Facet,
  Util,
} from 'bizcharts';

class BarChart extends PureComponent {
  constructor(props) {
    super(props);
    this.index = 0; // 口语题切换数字
    this.classId = 'FULL'; // 保存班级ID
    this.speechData = [];
    this.rightcolor = '#03C46B'; // 默认是绿色
    this.color = '#FF6E4A'; // 橙色
    this.myColor = '#FFB400'; // 黄色
    this.myScore = ''; // 学口语得分的分数处于哪个分段
    this.state = {
      studentData: [],
      unOralShow: false, // 非口语题显示
      oralShow: false, // 口语题显示
      ExamOralShow: false, // 考中互动讲评，口语题显示
      showNoAnswer: false, // 填空题显示全对的状态
      leftShow: true,
      rightShow: true,
      word1: '', // 用于学生报告页，展示自己成绩所在柱状图位置
      word2: '',
      dataSource: [],
      dataSource1: [],
      dataSource2: [],
      dataSource3: [],
      text: '', // 本题无代表性的错误答案！or 本题还无学生作答
      noShowSlist: false, // 不显示学生列表，在考中互动讲评报告页里不显示学生列表
    };
  }

  // 选择题按ABC排序

  inABC = data => {
    let dataSource = [];
    let temp = [];
    const num = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
      G: 6,
      H: 7,
      I: 8,
      J: 9,
      K: 10,
    };
    data.map(i => {
      if (num[i.word] !== undefined) {
        temp[num[i.word]] = i;
      } else {
        temp[11] = i;
      }
    });
    temp.map(i => {
      if (i) {
        dataSource.push(i);
      }
    });
    return dataSource;
  };

  // 填空题最多显示前五个答案

  upTo5Answer(arr) {
    var i = arr.length,
      j;
    var tempExchangVal;
    while (i > 0) {
      for (j = 0; j < i - 1; j++) {
        if (
          arr[j][formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })] <
          arr[j + 1][formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]
        ) {
          tempExchangVal = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = tempExchangVal;
        }
      }
      i--;
    }
    return arr.length > 5 ? arr.slice(0, 5) : arr;
  }

  init() {
    //数据初始化
    const { taskId, subId, role } = this.props;
    // console.log("subId",subId);
    let data = this.getResultJson(this.props.subId.id);
    let noScoreStatis = false;
    if (!data) {
      return;
    }
    if (data.hasOwnProperty('snapshotId')) {
      //考中报告页，不显示得分统计，不显示学生列表
      this.setState({
        noShowSlist: true,
      });
      noScoreStatis = true;
    }
    let list = [];
    let element = ['pronunciationStatis', 'integrityStatis', 'fluencyStatis']; //rhythmStatis 韵律度 暂时不显示
    let elementScore = ['pronunciationScore', 'integrityScore', 'fluencyScore']; //rhythmScore
    let elementName = [
      formatMessage({ id: 'app.text.fy', defaultMessage: '发音' }),
      formatMessage({ id: 'app.text.wanzd', defaultMessage: '完整度' }),
      formatMessage({ id: 'app.text.lld', defaultMessage: '流利度' }),
    ];
    let dataSource = [];

    if (JSON.stringify(data) != '{}') {
      //console.log("bizcharts",data);
      switch (
      subId.type //别忘了恢复
      ) {
        case 'GAP_FILLING':

        // this.getStudentAnswerChoice(taskId,snapshotId,subId.id);

        case 'CHOICE':
          {
            //if(gap){this.getStudentAnswerGap(taskId,snapshotId,subId.id)}
            if (role && data && data.answerStatis) {
              //list=data.answerStatis.replace(/:/g,",").replace(/\|/g,",").split(",");
              list = JSON.parse(data.answerStatis);
              for (let i = 0; i < list.length; i++) {
                //最多只显示五个结果
                if (list[i].K == 'server.wzd') {
                  if (list.length == 1 && subId.type == 'GAP_FILLING') {
                    //只有未作答的数据
                    this.setState({
                      showNoAnswer: true, //显示“没有错误答案”
                      unOralShow: true,
                      text: formatMessage({
                        id: 'app.text.btwdbxdcwda',
                        defaultMessage: '本题无代表性的错误答案',
                      }),
                    });
                  }
                  continue; //跳过未作答
                }
                dataSource.push({
                  word: list[i].K == 'server.wzd' ? '未作答' : list[i].K,// lessWords(list[i].K, 10),
                  人数: Number(list[i].V),
                  //data.studentNum 考中报告页未定义，因此不显示
                  per: Number(
                    (
                      (Number(list[i].V) * 100) /
                      Number(data.studentNum ? data.studentNum : 100)
                    ).toFixed(1)
                  ), //百分比
                });
              }
              if (subId.type == 'CHOICE') {
                let num = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                const newDataSource = dataSource;
                for (let j = 0; j < subId.choiceList; j++) {
                  let is = false;
                  for (let k = 0; k < newDataSource.length; k++) {
                    if (newDataSource[k].word === num[j]) {
                      is = true;
                    }
                  }
                  if (!is) {
                    dataSource.push({
                      word: num[j],
                      人数: 0,
                      per: 0,
                    });
                  }
                }
                this.setState({
                  unOralShow: true,
                  dataSource: this.inABC(dataSource),
                });
              } else {
                this.setState({
                  unOralShow: true,
                  dataSource: this.upTo5Answer(dataSource),
                });
              }
            } else {
              if (role) {
                if (subId.type == 'CHOICE') {
                  //数据为null的时候，选择题也要显示ABCD选项
                  let num = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                  let newDataSource = [];
                  for (let j = 0; j < subId.choiceList; j++) {
                    dataSource.push({
                      word: num[j],
                      人数: 0,
                      per: 0,
                    });
                  }
                  this.setState({
                    unOralShow: true,
                    dataSource: dataSource,
                  });
                } else {
                  this.setState({
                    showNoAnswer: true, //显示没有错误答案
                    unOralShow: true,
                    text: formatMessage({
                      id: 'app.text.btwdbxdcwda',
                      defaultMessage: '本题无代表性的错误答案',
                    }),
                  });
                }
              }
            }
          }
          break;
        case 'CLOSED_ORAL':
        case 'OPEN_ORAL':
        case 'HALF_OPEN_ORAL':
          {
            let show = [
              formatMessage({ id: 'app.text.c', defaultMessage: '差' }),
              formatMessage({ id: 'app.text.c', defaultMessage: '差' }),
              formatMessage({ id: 'app.text.z', defaultMessage: '中' }),
              formatMessage({ id: 'app.text.l', defaultMessage: '良' }),
              formatMessage({ id: 'app.text.y', defaultMessage: '优' }),
            ];
            //this.getStudentAnswerOral(taskId,snapshotId,subId.id);
            if (!noScoreStatis && data && data.scoreStatis) {
              let a = {
                value: '得分',
                result: [],
                myScore: '',
              };
              this.myScore = '';
              list = JSON.parse(data.scoreStatis);
              let empty = true; //表示没有人
              for (let i = 0; i < list.length; i++) {
                a.result.push({
                  score: this.scoreMatch(list[i].K, data.score),
                  number: Number(list[i].V),
                });
                if (Number(list[i].V) > 0) {
                  empty = false;
                }
              }
              if (empty) {
                this.setState({
                  showNoAnswer: true, //显示没有错误答案
                  oralShow: true,
                  text: formatMessage({ id: 'app.text.btwrezd', defaultMessage: '本题无人作答' }),
                });
              }
              a.myScore = this.myScore;
              dataSource.push(a);
            }
            // update 2019-10-11 10:49:30
            // REMOVE  -> data.evaluationEngine=="eval.choc.en"||
            if (
              data.evaluationEngine == 'eval.sent.en' ||
              data.evaluationEngine == 'eval.para.en'
            ) {
              for (let index = 0; index < element.length; index++) {
                list = [];
                if (data[element[index]]) {
                  list = JSON.parse(data[element[index]]);
                }
                if (list.length > 0) {
                  let temp = [];
                  let a = {
                    value: elementName[index],
                    result: [],
                    myScore: show[Number(data[elementScore[index]])],
                  };
                  for (let i = 0; i < list.length; i++) {
                    temp.push({
                      score: show[Number(list[i].K)],
                      number: Number(list[i].V),
                    });
                  }
                  //按优良中差排序
                  let n = 0;
                  let get = false;

                  for (let x = 4; x > 0; x--) {
                    get = false;
                    temp.map(It => {
                      if (It.score == show[x]) {
                        a.result[n] = It;
                        n++;
                        get = true;
                      }
                    });
                    if (get == false) {
                      a.result[n] = {
                        score: show[x],
                        number: 0,
                      };
                      n++;
                    }
                  }
                  dataSource.push(a);
                }
              }
            }
            this.speechData = dataSource;
            //console.log("speechData",this.speechData)

            if (data.hasOwnProperty('snapshotId')) {
              //判断是否在考中报告页
              this.setState({
                ExamOralShow: true,
                oralShow: true,
              });
              if (this.speechData.length > 0) {
                this.changeExamIndex('less');
              }
            } else {
              this.setState({
                oralShow: true,
              });
              this.changeIndex('less');
            }
          }
          break;
        default:
          break;
      }
    }
  }
  //匹配学生所得分数，在显示的哪个分段中
  //转换分段显示方式
  //data= "[0.80,0.90)"
  // score= 0.6 //学生的
  scoreMatch(value, score) {
    //先将"[0.80,0.90)"转换成 data=["[",0.80,0.90,")"]
    let data = [];
    let item = '';
    let result = '';
    if (value.indexOf('[') == -1 && value.indexOf('(') == -1) {
      this.myScore = Number(score);
      return String(Number(value));
    }
    item = value;
    item = item.slice(0, 1) + ',' + item.slice(1);
    item = item.slice(0, -1) + ',' + item.slice(-1);
    data = item.split(',');
    if (data[0] == '[') {
      if (data[3] == ']') {
        if (Number(data[1]) === Number(data[2])) {
          result = `${Number(data[1])}`;
          if (Number(score) == Number(data[1])) {
            this.myScore = result;
          }
        }
        if (Number(data[1]) < Number(data[2])) {
          result = `${Number(data[2])}≥${formatMessage({
            id: 'app.text.df',
            defaultMessage: '得分',
          })}≥${Number(data[1])}`;
          if (Number(score) >= Number(data[1]) && Number(score) <= Number(data[2])) {
            this.myScore = result;
          }
        }
      } else if (data[3] == ')') {
        if (Number(data[1]) < Number(data[2])) {
          result = `${Number(data[2])}>${formatMessage({
            id: 'app.text.df',
            defaultMessage: '得分',
          })}≥${Number(data[1])}`;
          if (Number(score) >= Number(data[1]) && Number(score) < Number(data[2])) {
            this.myScore = result;
          }
        }
      }
    } else if (data[0] == '(') {
      if (data[3] == ']') {
        if (Number(data[1]) < Number(data[2])) {
          result = `${Number(data[2])}≥${formatMessage({
            id: 'app.text.df',
            defaultMessage: '得分',
          })}>${Number(data[1])}`;
          if (Number(score) > Number(data[1]) && Number(score) <= Number(data[2])) {
            this.myScore = result;
          }
        }
      } else if (data[3] == ')') {
        if (Number(data[1]) < Number(data[2])) {
          result = `${Number(data[2])}>${formatMessage({
            id: 'app.text.df',
            defaultMessage: '得分',
          })}>${Number(data[1])}`;
          if (Number(score) > Number(data[1]) && Number(score) < Number(data[2])) {
            this.myScore = result;
          }
        }
      }
    }

    return result;
  }

  //将 "1.213123-3.432423" 变成 "1.21-3.43"
  getRange(data) {
    return data;
    let a = data.split('-');
    a[0] = Number(a[0]) ? Number(a[0]).toFixed(2) : 0;
    a[1] = Number(a[1]).toFixed(2);
    return `${a[0]}-${a[1]}`;
  }

  //考中互动讲评，空试卷显示
  emptyShow() {
    const { taskId, subId, role } = this.props;
    switch (subId.type) {
      case 'GAP_FILLING':
      case 'CHOICE':
        {
          this.setState({
            showNoAnswer: true, //显示没有错误答案
            unOralShow: true,
            text: formatMessage({ id: 'app.text.bthwxszd', defaultMessage: '本题还无学生作答!' }),
          });
        }
        break;
      case 'CLOSED_ORAL':
      case 'OPEN_ORAL':
      case 'HALF_OPEN_ORAL': {
        this.setState({
          ExamOralShow: true,
          showNoAnswer: true,
          oralShow: true,
          text: formatMessage({ id: 'app.text.bthwxszd', defaultMessage: '本题还无学生作答!' }),
        });
      }
    }
  }

  componentDidMount() {
    // console.log("componentDidMount")
    const { teacherPaperInfo } = this.props;
    this.classId = this.props.classId;
    if (teacherPaperInfo == 'empty') {
      this.setState({
        noShowSlist: true,
      });
      this.emptyShow(); //考中互动讲评，空试卷显示
    } else {
      this.init();
    }
    //获取弹窗内容
    // console.log("subId.id")
    // console.log(subId.id)
    // console.log("teacherPaperInfo")
    // console.log(teacherPaperInfo)
  }

  componentWillUnmount() {
    if (typeof this.closeModel === 'function') {
      this.closeModel();
    }
  }

  //根据id获取json串
  getResultJson() {
    const { teacherPaperInfo, studentAnswer, subId, role } = this.props;
    let json = {};
    if (role) {
      json = teacherPaperInfo.find(function (item) {
        return item.subquestionNo === subId.id;
      });
    } else {
      json = studentAnswer.find(function (item) {
        return item.subquestionNo === subId.id;
      });
    }
    return json;
  }

  //显示非口语题结果
  showNoSpeech = () => {
    const { role, teacherPaperInfo } = this.props;
    let html = [];
    let data = '';
    let scale = '';
    let line = '';
    let sourceCount = '';
    let geomLabel = '';
    if (teacherPaperInfo != 'empty') {
      data = this.getResultJson(this.props.subId.id);
    }
    if (!this.state.showNoAnswer) {
      if (!data || JSON.stringify(data) == '{}') {
        return;
      }
      sourceCount = Math.max.apply(
        Math,
        this.state.dataSource.map(function (v) {
          return v[formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })];
        })
      );
      scale = {
        [formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]: {
          tickCount: 6, //刻度总数量
          formatter: val => `${Number(val).toFixed(0)}`,
        },
      };
      if (sourceCount < 6) {
        scale = {
          [formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]: {
            tickInterval: 1,
          },
        };
      }

      line = {
        fill: '#ffffff',
        lineWidth: 1,
      };
      geomLabel = {
        per: {
          content: ['人数*per', (人数, per) => `${人数}人 ${per}%`],
          noPer: ['人数', 人数 => `${人数}人`],
        },
      };
    }
    html.push(
      <div className="barChart">
        <div className="barChart-teacher short">
          <div className="barInfo">
            <div className="upInfo">
              {formatMessage({ id: 'app.text.dfl', defaultMessage: '得分率' })}
            </div>
            <div className="midInfo">
              <span>{data ? Number((Number(data.scoreRate) * 100).toFixed(1)) : '--'}</span>
              <span>{data && '%'}</span>
            </div>
            <div className="botInfo">
              <span>{data ? data.markNum : '--'}</span>人
            </div>
          </div>
          {this.state.showNoAnswer && (
            <div className="showNoAnswer">
              <div className="showNoAnswer_icon">
                <i className="iconfont icon-tip"></i>
              </div>
              <div className="showNoAnswer_word">{this.state.text}</div>
            </div>
          )}
          <div className={this.state.showNoAnswer ? 'noBarChartPic' : 'barChartPic'}>
            {!this.state.showNoAnswer && (
              <Chart
                padding={[50, 0, 50, 50]}
                height={200}
                key={this.props.subId.id}
                data={this.state.dataSource}
                forceFit
                scale={scale}
              >
                <Axis
                  name="word"
                  label={{
                    formatter: (val) => {
                      return val;// lessWords(val, 10);
                    },
                    htmlTemplate(val, item, index) {
                      return `<div title="${val}" style="white-space: nowrap;">${lessWords(val, 10)}</div>`
                    }
                  }}
                />
                <Axis name="人数" line={line} />
                <Axis name="per" />
                {/* <Tooltip
                  crosshairs={{
                    type: 'rect',
                  }}/> */}
                <Geom
                  color={[
                    'word*人数',
                    (word, 人数) => {
                      if (word === this.props.subId.rightChoice) {
                        return this.rightcolor;
                      } else {
                        return this.color;
                      }
                    },
                  ]}
                  size={20}
                  type="interval"
                  position="word*人数"
                >
                  <Label
                    content={this.state.noShowSlist ? geomLabel.per.noPer : geomLabel.per.content}
                  />
                </Geom>
              </Chart>
            )}
          </div>
        </div>
      </div>
    );

    return html;
  };
  //TODO

  //显示口语题结果
  showSpeech = () => {
    const { role } = this.props;
    // console.log('this.state.dataSource1', this.state.dataSource1)
    const source1Count = Math.max.apply(
      Math,
      this.state.dataSource1.map(function (v) {
        return v[formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })];
      })
    );
    // console.log('this.state.dataSource2', this.state.dataSource2)
    const source2Count = Math.max.apply(
      Math,
      this.state.dataSource2.map(function (v) {
        return v[formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })];
      })
    );
    let scale1 = {
      [formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]: {
        tickCount: 6, //刻度总数量
        formatter: val => `${Number(val).toFixed(0)}`,
      },
    };
    let scale2 = {
      [formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]: {
        tickCount: 6, //刻度总数量
        formatter: val => `${Number(val).toFixed(0)}`,
      },
    };

    if (source1Count < 6) {
      scale1 = {
        [formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]: {
          tickInterval: 1,
        },
      };
    }
    if (source2Count < 6) {
      scale2 = {
        [formatMessage({ id: 'app.text.rs', defaultMessage: '人数' })]: {
          tickInterval: 1,
        },
      };
    }

    let line = {
      fill: '#ffffff',
      lineWidth: 1,
    };
    const numLabel = {
      人数: {
        content: ['人数', 人数 => `${人数}人`],
      },
    };
    let html = [];
    html.push(
      <div key={'barChart'} className="barChart">
        {this.state.showNoAnswer && (
          <div className="barChart-teacher center">
            <div className="showNoAnswer Acenter">
              <div className="showNoAnswer_icon">
                <i className="iconfont icon-tip"></i>
              </div>
              <div className="showNoAnswer_word">{this.state.text}</div>
            </div>
          </div>
        )}
        {!this.state.showNoAnswer && (
          <div className="barChart-teacher center">
            <div className="clink leave">
              {this.state.leftShow && (
                <i
                  className="iconfont icon-link-arrow-left"
                  onClick={() => this.changeIndex('less')}
                />
              )}
            </div>
            <div className="barChartVoice leave">
              <Chart
                padding={[50, 0, 50, 50]}
                height={200}
                width={340}
                data={this.state.dataSource1}
                key={this.props.subId.id}
                forceFit
                scale={scale1}
              >
                <Axis name="word" />
                <Axis name="人数" line={line} />
                {/* <Tooltip
             crosshairs={{type: "rect"}} /> */}
                <Geom
                  type="interval"
                  position="word*人数"
                  size={20}
                  color={[
                    'word*人数',
                    (word, 人数) => {
                      if (word === this.state.word1) {
                        return this.myColor;
                      } else {
                        return this.rightcolor;
                      }
                    },
                  ]}
                >
                  <Label content={numLabel.人数.content} />
                </Geom>
              </Chart>
              <div className="speechName">{this.speechData[2 * this.index].value}</div>
            </div>
            {this.speechData[2 * this.index + 1] && (
              <div className="barChartVoice leave">
                <Chart
                  padding={[50, 0, 50, 50]}
                  height={200}
                  width={340}
                  data={this.state.dataSource2}
                  key={this.props.subId.id + '1'}
                  forceFit
                  scale={scale2}
                >
                  <Axis name="word" />
                  <Axis name="人数" line={line} />
                  {/* <Tooltip
             crosshairs={{type: "rect"}} /> */}
                  <Geom
                    type="interval"
                    position="word*人数"
                    size={20}
                    color={[
                      'word*人数',
                      (word, 人数) => {
                        if (word === this.state.word2) {
                          return this.myColor;
                        } else {
                          return this.rightcolor;
                        }
                      },
                    ]}
                  >
                    <Label content={numLabel.人数.content} />
                  </Geom>
                </Chart>
                <div className="speechName">{this.speechData[2 * this.index + 1].value}</div>
              </div>
            )}

            <div className="clink leave">
              {this.state.rightShow && (
                <i className="iconfont icon-link-arrow" onClick={() => this.changeIndex('add')} />
              )}
            </div>
          </div>
        )}
      </div>
    );
    return html;
  };

  changeIndex = a => {
    let array1 = [];
    let array2 = [];
    let L = true; //左边按钮显示
    let R = true; //右边按钮显示
    if (a == 'add') {
      this.index++;
      if (!this.speechData[2 * (this.index + 1)]) {
        R = false;
      }
      if (!this.speechData[2 * this.index]) {
        this.index = --this.index;
        R = false;
      }
    } else if (a == 'less') {
      this.index--;
      if (this.index <= 0) {
        this.index = 0;
        L = false;
      }
    }
    this.speechData[2 * this.index].result.map((Item, index) => {
      let item = Item.score;
      array1.push({
        word: Item.score,
        人数: Item.number,
      });
    });
    if (this.speechData[2 * this.index + 1]) {
      this.speechData[2 * this.index + 1].result.map((Item, index) => {
        array2.push({
          word: Item.score,
          人数: Item.number,
        });
      });
    }
    // console.log("array1",array1);
    // console.log("array2",array2)
    setTimeout(() => {
      //维度少的就不显示切换按钮
      if (this.speechData.length < 3) {
        L = false;
        R = false;
      }
      this.setState({
        dataSource1: array1,
        dataSource2: array2,
        word1: this.speechData[2 * this.index].myScore,
        word2: this.speechData[2 * this.index + 1]
          ? this.speechData[2 * this.index + 1].myScore
          : '',
        leftShow: L,
        rightShow: R,
      });
    }, 300);
    this.setState({
      dataSource1: [],
      dataSource2: [],
      word1: '',
      word2: '',
    });
  };

  changeExamIndex = a => {
    let array = [];
    let L = true; //左边按钮显示
    let R = true; //右边按钮显示
    if (a == 'add') {
      this.index++;
      if (!this.speechData[this.index + 1]) {
        R = false;
      }
      if (!this.speechData[this.index]) {
        this.index = --this.index;
        R = false;
      }
    } else if (a == 'less') {
      this.index--;
      if (this.index <= 0) {
        this.index = 0;
        L = false;
      }
    }
    this.speechData[this.index].result.map((Item, index) => {
      let item = Item.score;
      array.push({
        word: Item.score,
        人数: Item.number,
      });
    });

    this.setState({
      dataSource3: array,
      word1: this.speechData[this.index].myScore,
      leftShow: L,
      rightShow: R,
    });
    //维度少的就不显示切换按钮
    if (this.speechData.length < 2) {
      this.setState({
        leftShow: false,
        rightShow: false,
      });
    }
  };

  render() {
    const { unOralShow, oralShow, ExamOralShow } = this.state;
    return (
      <div>
        {oralShow && this.showSpeech()}
        {unOralShow && this.showNoSpeech()}
      </div>
    );
  }
}
export default BarChart;
