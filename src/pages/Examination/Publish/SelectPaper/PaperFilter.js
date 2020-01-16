/* eslint-disable eqeqeq */
/**
 * 试卷筛选
 * @author tina
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import paperFilterModal from './PaperFilterModal/main';
import IconButton from '@/components/IconButton';
import './index.less';

@connect(({ release }) => ({
  grade: release.grade,
  years: release.years,
  difficulty: release.difficulty,
  templates: release.templates,
  gradeIndex: release.gradeIndex,
  gradeValue: release.gradeValue,
}))
class PaperFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      gradeName: formatMessage({
        id: 'app.examination.inspect.screen.unlimited',
        defaultMessage: '不限',
      }),
      // yearName: formatMessage({
      //   id: 'app.examination.inspect.screen.unlimited',
      //   defaultMessage: '不限',
      // }), // 默认选择当前年限
      difficulty: formatMessage({
        id: 'app.examination.inspect.screen.unlimited',
        defaultMessage: '不限',
      }),
      address: formatMessage({
        id: 'app.examination.inspect.screen.unlimited',
        defaultMessage: '不限',
      }),
      examtype: formatMessage({
        id: 'app.examination.inspect.screen.unlimited',
        defaultMessage: '不限',
      }),
      gradeCode: '',
      yearCode: '', // 默认选择当前年限
      difficultyCode: '',
      addressCode: '',
      examtypeCode: '',
    };
  }

  componentDidMount() {}

  paperFilterData = () => {
    let dataSource4 = '';
    let dataSource1 = '';
    let dataSource2 = '';
    let dataSource3 = '';
    const dataSource5 = [
      {
        code: '',
        value: formatMessage({
          id: 'app.examination.inspect.screen.unlimited',
          defaultMessage: '不限',
        }),
      },
      {
        code: 'SCOPE_P2J,SCOPE_J2S,SCOPE_S2U',
        value: formatMessage({
          id: 'app.message.entranceExaminationPaper',
          defaultMessage: '升学考试卷',
        }),
      },
      {
        code: 'MID_TERM,MID_TERM_FIRST,MID_TERM_SECOND',
        value: formatMessage({
          id: 'app.text.exam.publish.filter.unit.value2',
          defaultMessage: '期中',
        }),
      },
      {
        code: 'END_TERM,END_TERM_FIRST,END_TERM_SECOND',
        value: formatMessage({
          id: 'app.text.exam.publish.filter.unit.value3',
          defaultMessage: '期末',
        }),
      },
      {
        code: 'UNIT',
        value: formatMessage({ id: 'app.text.exam.publish.unit', defaultMessage: '单元' }),
      },
      {
        code: 'COMPREHENSIVE',
        value: formatMessage({
          id: 'app.text.exam.publish.filter.unit.value4',
          defaultMessage: '单元综合',
        }),
      },
    ];
    const { dispatch } = this.props;
    const fetchPaperTemplates = new Promise((resolve, reject) => {
      dispatch({
        type: 'release/fetchPaperTemplates',
        payload: { campusId: localStorage.getItem('campusId') },
      })
        .then(() => {
          const { templates } = this.props;
          dataSource3 = [
            {
              paperTemplateId: '',
              templateName: formatMessage({
                id: 'app.examination.inspect.screen.unlimited',
                defaultMessage: '不限',
              }),
            },
          ].concat(templates);
          resolve(dataSource2);
        })
        .catch(() => {
          const mgs = formatMessage({
            id: 'app.message.exam.publish.get.paper.template.err',
            defaultMessage: '获取试卷结构接口失败！',
          });
          reject(mgs);
        });
    });

    const fetchGrade = new Promise((resolve, reject) => {
      dispatch({
        type: 'release/fetchGrade',
      })
        .then(() => {
          const { grade } = this.props;
          dataSource4 = [
            {
              grade: '',
              gradeValue: formatMessage({
                id: 'app.examination.inspect.screen.unlimited',
                defaultMessage: '不限',
              }),
            },
          ].concat(grade);
          resolve(dataSource4);
        })
        .catch(() => {
          const mgs = formatMessage({
            id: 'app.message.exam.publish.get.grade.err',
            defaultMessage: '获取年级字典接口失败！',
          });
          reject(mgs);
        });
    });

    const fetchYears = new Promise((resolve, reject) => {
      dispatch({
        type: 'release/fetchYears',
      })
        .then(() => {
          const { years } = this.props;
          dataSource1 = [
            {
              code: '',
              value: formatMessage({
                id: 'app.examination.inspect.screen.unlimited',
                defaultMessage: '不限',
              }),
            },
          ].concat(years);
          resolve(dataSource1);
        })
        .catch(() => {
          const mgs = formatMessage({
            id: 'app.message.exam.publish.get.year.err',
            defaultMessage: '获取年度字典接口失败！',
          });
          reject(mgs);
        });
    });

    const fetchDifficult = new Promise((resolve, reject) => {
      dispatch({
        type: 'release/fetchDifficult',
      })
        .then(() => {
          const { difficulty } = this.props;
          dataSource2 = [
            {
              code: '',
              value: formatMessage({
                id: 'app.examination.inspect.screen.unlimited',
                defaultMessage: '不限',
              }),
            },
          ].concat(difficulty);
          resolve(dataSource2);
        })
        .catch(() => {
          const mgs = formatMessage({
            id: 'app.message.exam.publish.get.difficult.err',
            defaultMessage: '获取难度字典接口失败！',
          });
          reject(mgs);
        });
    });
    const { gradeCode, yearCode, difficultyCode, addressCode, examtypeCode } = this.state;

    Promise.all([fetchPaperTemplates, fetchGrade, fetchYears, fetchDifficult])
      .then(() => {
        paperFilterModal({
          dataSource: {
            grade: dataSource4,
            years: dataSource1,
            difficulty: dataSource2,
            address: dataSource3,
            type: dataSource5,
            gradeCode,
            yearCode,
            difficultyCode,
            addressCode,
            examtypeCode,
          },
          callback: (grade, years, difficulty, address, examtype) => {
            dataSource4.forEach(item => {
              if (item.grade == grade) {
                this.setState({
                  gradeName: item.gradeValue,
                  gradeCode: grade,
                });
              }
            });
            dataSource1.forEach(item => {
              if (item.code == years) {
                this.setState({
                  // yearName: item.value,
                  yearCode: years,
                });
              }
            });
            dataSource2.forEach(item => {
              if (item.code == difficulty) {
                this.setState({
                  difficulty: item.value,
                  difficultyCode: difficulty,
                });
              }
            });
            dataSource3.forEach(item => {
              if (item.paperTemplateId == address) {
                this.setState({
                  address: item.templateName,
                  addressCode: address,
                });
              }
            });

            dataSource5.forEach(item => {
              if (item.code == examtype) {
                this.setState({
                  examtype: item.value,
                  examtypeCode: examtype,
                });
              }
            });
            // 确定筛选条件
            const { filterPaper } = this.props;
            filterPaper(grade, years, difficulty, address, examtype);
          },
        });
      })
      .catch(function(e) {
        console.error(e);
      });
  };

  render() {
    const { address, gradeName, difficulty, examtype } = this.state;
    return (
      <div className="testFilter">
        <div className="lefttop">
          <IconButton
            text={formatMessage({ id: 'app.examination.inspect.screen', defaultMessage: '筛选' })}
            iconName="icon-funnel"
            onClick={this.paperFilterData}
          />
        </div>
        <div className="leftInfo">
          <div className="leftInfocontent">
            <div className="infoCard">
              <span className="label">
                {formatMessage({ id: 'app.campus.manage.basic.grade', defaultMessage: '年级' })}：
              </span>
              <span className="labelinfo">{gradeName}</span>
            </div>
            <div className="infoCard">
              <span className="label">
                {formatMessage({ id: 'app.title.exam.publish.task.type', defaultMessage: '类型' })}
                ：
              </span>
              <span className="labelinfo">{examtype}</span>
            </div>
          </div>
          <div className="leftInfocontent">
            {/* <div className="infoCard">
              <span className="label">
                {formatMessage({ id: 'app.school.year', defaultMessage: '学年' })}：
              </span>
              <span className="labelinfo">{yearName}</span>
            </div> */}
            <div className="infoCard">
              <span className="label">
                {formatMessage({
                  id: 'app.title.exam.publish.facility.value',
                  defaultMessage: '难易度',
                })}
                ：
              </span>
              <span className="labelinfo">{difficulty}</span>
            </div>
          </div>
          <div className="leftInfocontent">
            <div className="infoCard" style={{ display: 'flex' }}>
              <div className="label" style={{ width: '70px' }}>
                {formatMessage({
                  id: 'app.examination.inspect.task.detail.paper.template',
                  defaultMessage: '试卷结构',
                })}
                ：
              </div>
              <div className="labelinfo">{address}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PaperFilter;
