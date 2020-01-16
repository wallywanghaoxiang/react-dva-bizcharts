import React, { Component } from 'react';
import Dimensions from 'react-dimensions';
import { message, Popover, Radio, Button, Select } from 'antd';
import { connect } from 'dva';
import cs from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import defaultCampusPic from '@/assets/campus/campus_default_pic.png';
import CustomUpload from '@/frontlib/components/CustomUpload';

const { Option } = Select;

const RadioGroup = Radio.Group;

const messages = defineMessages({
  classAliasSuccess: {
    id: 'app.campus.manage.basic.class.alias.set.success',
    defaultMessage: '班级别名可见范围设置成功！',
  },
  classFormatSuccess: {
    id: 'app.campus.manage.basic.class.format.set.success',
    defaultMessage: '班级名称格式设置成功！',
  },
  classFormatTit: {
    id: 'app.campus.manage.basic.class.format.title',
    defaultMessage: '班级名称格式',
  },
  classN: { id: 'app.campus.manage.basic.class', defaultMessage: '班' },
  grade: { id: 'app.campus.manage.basic.grade', defaultMessage: '年级' },
  classAliasTit: {
    id: 'app.campus.manage.basic.class.alias.title',
    defaultMessage: '班级别名可见范围',
  },
  classAliasOption1: {
    id: 'app.campus.manage.basic.class.alias.optin1',
    defaultMessage: '全校可见',
  },
  classAliasOption2: {
    id: 'app.campus.manage.basic.class.alias.optin2',
    defaultMessage: '仅本班相关教师可见',
  },
  saveBtnTit: { id: 'app.campus.manage.basic.class.save.btn.title', defaultMessage: '保存' },
  classFormatTip: {
    id: 'app.campus.manage.basic.class.format.tip',
    defaultMessage: '请选择以下选项，进行班级名称格式配置',
  },
  primaryName: { id: 'app.campus.manage.basic.primary', defaultMessage: '小学' },
  middleName: { id: 'app.campus.manage.basic.middle', defaultMessage: '初中' },
  highName: { id: 'app.campus.manage.basic.high', defaultMessage: '高中' },
  yang: { id: 'app.campus.manage.basic.yang', defaultMessage: '样' },
  basicTemTit: { id: 'app.campus.manage.basic.template.title', defaultMessage: '基础结构' },
  classNumYang: { id: 'app.campus.manage.basic.class.number.yang', defaultMessage: '班序样式' },
  bracketsOption1: {
    id: 'app.campus.manage.basic.class.brackets.option1',
    defaultMessage: '有括号',
  },
  bracketsOption2: {
    id: 'app.campus.manage.basic.class.brackets.option2',
    defaultMessage: '无括号',
  },
  campusManage: { id: 'app.menu.campusmanage', defaultMessage: '校区管理' },
  baiscSetTit: { id: 'app.campus.manage.basic.set.title', defaultMessage: '基本' },
  eduPhaseTit: { id: 'app.campus.manage.basic.edution.phase', defaultMessage: '学段' },
  educationSystemTit: { id: 'app.campus.manage.basic.education.system', defaultMessage: '学制' },
  classFramework: { id: 'app.campus.manage.basic.class.framework', defaultMessage: '班级架构' },
  classFormatSetTit: {
    id: 'app.campus.manage.basic.class.format.set.title',
    defaultMessage: '班级名称配置',
  },
  settingTit: { id: 'app.campus.manage.basic.setting.title', defaultMessage: '设置' },
  classFrameworkOption1: {
    id: 'app.campus.manage.basic.class.framework.option1',
    defaultMessage: '走班制',
  },
  classFrameworkOption2: {
    id: 'app.campus.manage.basic.class.framework.option2',
    defaultMessage: '传统行政班制',
  },
  campusLogoConfigTit: {
    id: 'app.campus.manage.basic.campus.logo.config.title',
    defaultMessage: '学校Logo配置',
  },
  campusLogoConfigTip: {
    id: 'app.campus.manage.basic.campus.logo.config.tip',
    defaultMessage: '图片尺寸长、宽400px以内，支持jpg、png格式',
  },
  uploadBtnTit: { id: 'app.campus.manage.basic.upload.btn.tit', defaultMessage: '更换Logo' },
  updateLogoSuccess: {
    id: 'app.campus.manage.basic.upload.logo.success',
    defaultMessage: '更换成功！',
  },
  gradeValue1: { id: 'app.campus.manage.basic.middle.school.grade1', defaultMessage: '初一' },
  gradeValue2: { id: 'app.campus.manage.basic.middle.school.grade2', defaultMessage: '初1' },
  gradeValue3: { id: 'app.campus.manage.basic.middle.school.grade3', defaultMessage: '七' },
  gradeValue4: { id: 'app.campus.manage.basic.middle.school.grade4', defaultMessage: '7' },
});

@connect(({ campusmanage, file }) => {
  const { campusConfigInfo } = campusmanage;
  const { fileInfo } = file;
  return { campusConfigInfo, fileInfo };
})
class CampusBasicConfigure extends Component {
  state = {
    middleSchoolGrade: [
      {
        key: 'grade1',
        value: formatMessage(messages.gradeValue1),
      },
      {
        key: 'grade2',
        value: formatMessage(messages.gradeValue2),
      },
      {
        key: 'grade3',
        value: formatMessage(messages.gradeValue3),
      },
      {
        key: 'grade4',
        value: formatMessage(messages.gradeValue4),
      },
    ],
    highSchoolGrade: [
      {
        key: 'highGrade1',
        value: '高一',
      },
      {
        key: 'highGrade2',
        value: '高1',
      },
    ],
    classRange: 'Y',
    popoverVisible: false,
    classNamePopoverVisible: false,
    primaryGrade: '',
    primaryClass: '',
    primaryEduPhaseCode: '', // 学段code
    primaryEduPhaseValue: '', // 学段value
    primaryBrackets: '1', // 是否有括号
    primaryBracketsValue: '', // 小学班序样

    middleGrade: '',
    middleClass: '',
    middleEduPhaseCode: '',
    middleEduPhaseValue: '', // 学段
    middleBrackets: '1', // 是否有括号
    middleBracketsValue: '', // 初中班序样

    highGrade: '',
    highClass: '',
    highEduPhaseCode: '',
    highEduPhaseValue: '', // 学段
    highBrackets: '1', // 是否有括号
    highBracketsValue: '', // 高中班序样

    currentLogoPath: '', // 当前更改的logo
  };

  componentDidMount() {
    this.getCampusConfigInfo();
  }

  // 获取校区管理信息
  getCampusConfigInfo = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'campusmanage/campusConfigInfo',
      payload: {},
      callback: res => {
        if (res.responseCode === '200') {
          const { data } = res;
          const { educationPhaseList, logo } = data;
          if (logo) {
            // 有上传过校区logo
            const params = {
              fileId: logo,
            };
            dispatch({
              type: 'file/file',
              payload: params,
              callback: fileData => {
                const { path } = fileData;
                this.setState({
                  currentLogoPath: path,
                });
              },
            });
          }

          this.setState({
            classRange: data.optionalClassAlias,
          });
          educationPhaseList.forEach(item => {
            if (item.educationPhaseCode === '101') {
              // 小学
              const { formatName } = item;
              let formatNameArr = [];
              if (formatName) {
                formatNameArr = formatName.split(',');
              }
              const gradeNum = formatNameArr[0];
              const hasBrackets = formatNameArr[1];
              const classNum = formatNameArr[2];
              const showValue = this.autoInitText(gradeNum, classNum, hasBrackets, false);

              this.setState({
                primaryBracketsValue: showValue,
                primaryEduPhaseCode: item.educationPhaseCode,
                primaryGrade: gradeNum,
                primaryClass: classNum,
                primaryBrackets: hasBrackets,
                primaryEduPhaseValue: item.educationPhaseValue,
              });
            }
            if (item.educationPhaseCode === '201') {
              // 初中
              const { formatName } = item;
              let formatNameArr = [];
              if (formatName) {
                formatNameArr = formatName.split(',');
              }
              const gradeNum = formatNameArr[0];
              const hasBrackets = formatNameArr[1];
              const classNum = formatNameArr[2];
              const showValue = this.autoInitText(gradeNum, classNum, hasBrackets, false);
              this.setState({
                middleBracketsValue: showValue,
                middleEduPhaseCode: item.educationPhaseCode,
                middleGrade: gradeNum,
                middleClass: classNum,
                middleBrackets: hasBrackets,
                middleEduPhaseValue: item.educationPhaseValue,
              });
            }
            if (item.educationPhaseCode === '301') {
              // 高中
              const { formatName } = item;
              let formatNameArr = [];
              if (formatName) {
                formatNameArr = formatName.split(',');
              }
              const gradeNum = formatNameArr[0];
              const hasBrackets = formatNameArr[1];
              const classNum = formatNameArr[2];
              const showValue = this.autoInitText(gradeNum, classNum, hasBrackets, true);
              this.setState({
                highBracketsValue: showValue,
                highEduPhaseCode: item.educationPhaseCode,
                highGrade: gradeNum,
                highClass: classNum,
                highBrackets: hasBrackets,
                highEduPhaseValue: item.educationPhaseValue,
              });
            }
          });
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  onClassRangeChange = e => {
    this.setState({
      classRange: e.target.value,
    });
  };

  setClassRange = () => {
    const { popoverVisible } = this.state;
    this.setState({
      popoverVisible: !popoverVisible,
    });
  };

  visibleChange = (visible = false) => {
    this.setState({
      popoverVisible: visible,
    });
  };

  // 保存班级别名可见范围
  saveClassRange = () => {
    const { dispatch } = this.props;
    const { classRange } = this.state;

    const campusId = localStorage.getItem('campusId');
    const params = {
      campusId,
      optionalClassAlias: classRange,
    };
    dispatch({
      type: 'campusmanage/updateCampusConfigInfo',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          this.setState({
            popoverVisible: false,
          });
          this.getCampusConfigInfo();
          const mgs = formatMessage(messages.classAliasSuccess);
          message.success(mgs);
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  setClassName = () => {
    const { classNamePopoverVisible } = this.state;
    this.setState({
      classNamePopoverVisible: !classNamePopoverVisible,
    });
  };

  classNameVisibleChange = (visible = false) => {
    this.setState({
      classNamePopoverVisible: visible,
    });
  };

  /* 班级名称格式配置 */
  // 切换年级
  primaryGradeChange = (value, type) => {
    // 重组样
    switch (type) {
      case 1:
        {
          const { primaryBrackets, primaryClass } = this.state;
          const showValue = this.autoInitText(value, primaryClass, primaryBrackets, false);
          this.setState({
            primaryGrade: value,
            primaryBracketsValue: showValue,
          });
        }
        break;
      case 2:
        {
          const { middleBrackets, middleClass, middleSchoolGrade } = this.state;
          const gradeObj = middleSchoolGrade.find(it => it.key === value);
          const gradeValue = gradeObj.value;
          const showValue = this.autoInitText(gradeValue, middleClass, middleBrackets, false);
          this.setState({
            middleGrade: gradeValue,
            middleBracketsValue: showValue,
          });
        }
        break;
      case 3:
        {
          const { highBrackets, highClass, highSchoolGrade } = this.state;
          const gradeObj = highSchoolGrade.find(it => it.key === value);
          const gradeValue = gradeObj.value;
          const showValue = this.autoInitText(gradeValue, highClass, highBrackets, true);
          this.setState({
            highGrade: gradeValue,
            highBracketsValue: showValue,
          });
        }
        break;
      default:
        break;
    }
  };

  // 切换班级
  primaryClassChange = (value, type) => {
    switch (type) {
      case 1:
        {
          // 重组样
          const { primaryBrackets, primaryGrade } = this.state;
          const showValue = this.autoInitText(primaryGrade, value, primaryBrackets, false);

          this.setState({
            primaryClass: value,
            primaryBracketsValue: showValue,
          });
        }
        break;
      case 2:
        {
          // 重组样
          const { middleBrackets, middleGrade } = this.state;
          const showValue = this.autoInitText(middleGrade, value, middleBrackets, false);

          this.setState({
            middleClass: value,
            middleBracketsValue: showValue,
          });
        }
        break;
      case 3:
        {
          // 重组样
          const { highBrackets, highGrade } = this.state;
          const showValue = this.autoInitText(highGrade, value, highBrackets, true);

          this.setState({
            highClass: value,
            highBracketsValue: showValue,
          });
        }
        break;
      default:
        break;
    }
  };

  onPrimaryRodioChange = (e, type) => {
    switch (type) {
      case 1:
        {
          const { primaryGrade, primaryClass } = this.state;
          const showValue = this.autoInitText(primaryGrade, primaryClass, e.target.value, false);
          this.setState({
            primaryBrackets: e.target.value,
            primaryBracketsValue: showValue,
          });
        }
        break;
      case 2:
        {
          const { middleGrade, middleClass } = this.state;
          const showValue = this.autoInitText(middleGrade, middleClass, e.target.value, false);
          this.setState({
            middleBrackets: e.target.value,
            middleBracketsValue: showValue,
          });
        }
        break;
      case 3:
        {
          const { highGrade, highClass } = this.state;
          const showValue = this.autoInitText(highGrade, highClass, e.target.value, true);
          this.setState({
            highBrackets: e.target.value,
            highBracketsValue: showValue,
          });
        }
        break;
      default:
        break;
    }
  };

  // 保存班级名称格式
  saveClassFormat = () => {
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const {
      primaryEduPhaseCode,
      primaryGrade,
      primaryClass,
      primaryBrackets,
      middleEduPhaseCode,
      middleGrade,
      middleClass,
      middleBrackets,
      highEduPhaseCode,
      highGrade,
      highClass,
      highBrackets,
    } = this.state;

    const list = [];
    if (primaryEduPhaseCode) {
      const obj = {
        campusId,
        educationPhaseCode: primaryEduPhaseCode,
        formatName: `${primaryGrade},${primaryBrackets},${primaryClass}`,
      };
      list.push(obj);
    }
    if (middleEduPhaseCode) {
      const obj = {
        campusId,
        educationPhaseCode: middleEduPhaseCode,
        formatName: `${middleGrade},${middleBrackets},${middleClass}`,
      };
      list.push(obj);
    }
    if (highEduPhaseCode) {
      const obj = {
        campusId,
        educationPhaseCode: highEduPhaseCode,
        formatName: `${highGrade},${highBrackets},${highClass}`,
      };
      list.push(obj);
    }

    dispatch({
      type: 'campusmanage/updateClassEduPhase',
      payload: list,
      callback: res => {
        if (res.responseCode === '200') {
          this.setState({
            classNamePopoverVisible: false,
          });
          const mgs = formatMessage(messages.classFormatSuccess);
          message.success(mgs);
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  /*  生成显示文本
        isHasBrackets:是否有括号
        isHigh:标识是否是高中，高中不需要拼接年级
    */
  autoInitText = (gradeNum, classNum, isHasBrackets, isHigh) => {
    let showValue = '';
    const classN = formatMessage(messages.classN);
    const grade = formatMessage(messages.grade);
    if (Number(isHasBrackets) === 1) {
      // 有括号
      const { middleSchoolGrade } = this.state;
      const midSchoolGrade1 = middleSchoolGrade[0].value;
      const midSchoolGrade2 = middleSchoolGrade[1].value;
      if (isHigh) {
        showValue = `${gradeNum}(${classNum})${classN}`;
      } else if (gradeNum === midSchoolGrade1 || gradeNum === midSchoolGrade2) {
        showValue = `${gradeNum}(${classNum})${classN}`;
      } else {
        showValue = `${gradeNum}${grade}(${classNum})${classN}`;
      }
    } else {
      // 无括号
      const { middleSchoolGrade } = this.state;
      const midSchoolGrade1 = middleSchoolGrade[0].value;
      const midSchoolGrade2 = middleSchoolGrade[1].value;
      if (isHigh) {
        showValue = `${gradeNum}${classNum}${classN}`;
      } else if (gradeNum === midSchoolGrade1 || gradeNum === midSchoolGrade2) {
        showValue = `${gradeNum}${classNum}${classN}`;
      } else {
        showValue = `${gradeNum}${grade}${classNum}${classN}`;
      }
    }

    return showValue;
  };

  // 图片上传成功的回调
  handleSuccess = (id, path) => {
    // console.log(id,path,name);
    this.setState({
      currentLogoPath: path,
    });
    const { dispatch } = this.props;
    const campusId = localStorage.getItem('campusId');
    const params = {
      campusId,
      logo: id,
    };
    dispatch({
      type: 'campusmanage/updateCampusConfigInfo',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const mgs = formatMessage(messages.updateLogoSuccess);
          message.success(mgs);
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const { campusConfigInfo, containerWidth } = this.props;
    const {
      classRange,
      popoverVisible,
      classNamePopoverVisible,
      primaryBrackets,
      primaryBracketsValue,
      primaryGrade,
      primaryClass,
      primaryEduPhaseCode,
      middleBrackets,
      middleBracketsValue,
      middleGrade,
      middleClass,
      middleEduPhaseCode,
      highBrackets,
      highBracketsValue,
      highGrade,
      highClass,
      highEduPhaseCode,
      primaryEduPhaseValue,
      middleEduPhaseValue,
      highEduPhaseValue,
      currentLogoPath,
      middleSchoolGrade,
      highSchoolGrade,
    } = this.state;

    const text = <span>{formatMessage(messages.classAliasTit)}</span>;
    const popContent = (
      <div className={styles.popContent}>
        <RadioGroup onChange={this.onClassRangeChange} value={classRange}>
          <Radio value="Y" style={{ color: '#333', fontSize: '14px' }}>
            {formatMessage(messages.classAliasOption1)}
          </Radio>
          <Radio value="N" style={{ color: '#333', fontSize: '14px' }}>
            {formatMessage(messages.classAliasOption2)}
          </Radio>
        </RadioGroup>
        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <Button onClick={this.saveClassRange}>{formatMessage(messages.saveBtnTit)}</Button>
        </div>
      </div>
    );

    const nameFormatText = (
      <div className={styles.nameFormatTit}>
        <i className="iconfont icon-warning" />
        <span>{formatMessage(messages.classFormatTip)}</span>
      </div>
    );
    const nameFormatContent = (
      <div className={styles.nameFormatContent}>
        {/* 小学 */}
        {primaryEduPhaseCode && (
          <div className={styles.item}>
            <div className={styles.top}>
              <div className={styles.section}>{formatMessage(messages.primaryName)}</div>
              <div className={styles.yangBox}>
                <div className={styles.itemYang}>{formatMessage(messages.yang)}</div>
                <div className={styles.formatName}>
                  <span>{primaryBracketsValue}</span>
                </div>
              </div>
            </div>
            <div className={styles.middle}>
              <div className={styles.baisc}>
                <span>{formatMessage(messages.basicTemTit)}：</span>
                <Select
                  defaultValue={primaryGrade}
                  style={{ width: 95 }}
                  onChange={e => this.primaryGradeChange(e, 1)}
                >
                  <Option value="一">一</Option>
                  <Option value="1">1</Option>
                </Select>
                <span className={styles.grade}>{formatMessage(messages.grade)}</span>
              </div>
              <div className={styles.class}>
                <Select
                  defaultValue={primaryClass}
                  style={{ width: 95 }}
                  onChange={e => this.primaryClassChange(e, 1)}
                >
                  <Option value="1">1</Option>
                  <Option value="一">一</Option>
                </Select>
                <span>{formatMessage(messages.classN)}</span>
              </div>
            </div>
            <div className={styles.bottom}>
              <span>{formatMessage(messages.classNumYang)}：</span>
              <RadioGroup onChange={e => this.onPrimaryRodioChange(e, 1)} value={primaryBrackets}>
                <Radio value="1">{formatMessage(messages.bracketsOption1)}</Radio>
                <Radio value="0">{formatMessage(messages.bracketsOption2)}</Radio>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* 初中 */}
        {middleEduPhaseCode && (
          <div className={styles.item}>
            <div className={styles.top}>
              <div className={styles.section}>{formatMessage(messages.middleName)}</div>
              <div className={styles.yangBox}>
                <div className={styles.itemYang}>{formatMessage(messages.yang)}</div>
                <div className={styles.formatName}>
                  <span>{middleBracketsValue}</span>
                </div>
              </div>
            </div>
            <div className={styles.middle}>
              <div className={styles.baisc}>
                <span>{formatMessage(messages.basicTemTit)}：</span>
                <Select
                  defaultValue={middleGrade}
                  style={{ width: 95 }}
                  onChange={e => this.primaryGradeChange(e, 2)}
                >
                  {middleSchoolGrade.map(tag => {
                    return <Option value={tag.key}>{tag.value}</Option>;
                  })}
                </Select>
                <span className={styles.grade}>{formatMessage(messages.grade)}</span>
              </div>
              <div className={styles.class}>
                <Select
                  defaultValue={middleClass}
                  style={{ width: 95 }}
                  onChange={e => this.primaryClassChange(e, 2)}
                >
                  <Option value="1">1</Option>
                  <Option value="一">一</Option>
                </Select>
                <span>{formatMessage(messages.classN)}</span>
              </div>
            </div>
            <div className={styles.bottom}>
              <span>{formatMessage(messages.classNumYang)}：</span>
              <RadioGroup onChange={e => this.onPrimaryRodioChange(e, 2)} value={middleBrackets}>
                <Radio value="1">{formatMessage(messages.bracketsOption1)}</Radio>
                <Radio value="0">{formatMessage(messages.bracketsOption2)}</Radio>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* 高中 */}
        {highEduPhaseCode && (
          <div className={styles.item} style={{ borderBottom: 'none' }}>
            <div className={styles.top}>
              <div className={styles.section}>{formatMessage(messages.highName)}</div>
              <div className={styles.yangBox}>
                <div className={styles.itemYang}>{formatMessage(messages.yang)}</div>
                <div className={styles.formatName}>
                  <span>{highBracketsValue}</span>
                </div>
              </div>
            </div>
            <div className={styles.middle}>
              <div className={styles.baisc}>
                <span>{formatMessage(messages.basicTemTit)}：</span>
                <Select
                  defaultValue={highGrade}
                  style={{ width: 95 }}
                  onChange={e => this.primaryGradeChange(e, 3)}
                >
                  {highSchoolGrade.map(tag => {
                    return <Option value={tag.key}>{tag.value}</Option>;
                  })}
                </Select>
                <span className={styles.grade}>{formatMessage(messages.grade)}</span>
              </div>
              <div className={styles.class}>
                <Select
                  defaultValue={highClass}
                  style={{ width: 95 }}
                  onChange={e => this.primaryClassChange(e, 3)}
                >
                  <Option value="1">1</Option>
                  <Option value="一">一</Option>
                </Select>
                <span>{formatMessage(messages.classN)}</span>
              </div>
            </div>
            <div className={styles.bottom}>
              <span>{formatMessage(messages.classNumYang)}：</span>
              <RadioGroup onChange={e => this.onPrimaryRodioChange(e, 3)} value={highBrackets}>
                <Radio value="1">{formatMessage(messages.bracketsOption1)}</Radio>
                <Radio value="0">{formatMessage(messages.bracketsOption2)}</Radio>
              </RadioGroup>
            </div>
          </div>
        )}

        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <Button onClick={this.saveClassFormat}>{formatMessage(messages.saveBtnTit)}</Button>
        </div>
      </div>
    );

    const primaryStr = primaryEduPhaseValue ? `${primaryEduPhaseValue} | ` : '';
    const middleStr = middleEduPhaseValue ? `${middleEduPhaseValue} | ` : '';
    const highStr = highEduPhaseValue ? `${highEduPhaseValue} | ` : '';
    const eduPhaseStr = `${primaryStr}${middleStr}${highStr}`;
    const showEduPhase = eduPhaseStr.substring(0, eduPhaseStr.length - 2);

    const primaryBracketsStr = primaryBracketsValue ? `${primaryBracketsValue} | ` : '';
    const middleBracketsStr = middleBracketsValue ? `${middleBracketsValue} | ` : '';
    const highBracketsStr = highBracketsValue ? `${highBracketsValue} | ` : '';
    const bracketsStr = `${primaryBracketsStr}${middleBracketsStr}${highBracketsStr}`;
    const showBracketsStr = bracketsStr.substring(0, bracketsStr.length - 2);

    return (
      <div className={styles.campusBasicConfigure}>
        <h1 className={styles.tit}>
          {formatMessage(messages.campusManage)}
          <span className={styles.division}>/</span>
          <span className={styles.subTit}>{formatMessage(messages.baiscSetTit)}</span>
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <div className={styles.campusInfo}>
            <div className={styles.campusName}>{campusConfigInfo ? campusConfigInfo.name : ''}</div>
          </div>
          <div className={styles.classNameSet}>
            <div className={cs('clearfix')}>
              {/* 学段 */}
              <div
                className={styles.eduPhase}
                style={{ marginRight: '20px', marginBottom: '10px' }}
              >
                <div className={styles.configTit}>{formatMessage(messages.eduPhaseTit)}</div>
                <div className={styles.configCont}>{showEduPhase}</div>
              </div>
              {/* 学制 */}
              {campusConfigInfo && campusConfigInfo.educationSystem && (
                <div
                  className={styles.eduSystem}
                  style={{ marginRight: '20px', marginBottom: '10px' }}
                >
                  <div className={styles.configTit}>
                    {formatMessage(messages.educationSystemTit)}
                  </div>
                  <div className={styles.configCont}>
                    {campusConfigInfo && campusConfigInfo.educationSystemValue
                      ? campusConfigInfo.educationSystemValue
                      : ''}
                  </div>
                </div>
              )}

              {/* 班级架构 */}

              <div className={styles.optionalSystem} style={{ marginRight: '20px' }}>
                <div className={styles.configTit}>{formatMessage(messages.classFramework)}</div>
                <div className={styles.configCont}>
                  {campusConfigInfo && campusConfigInfo.optionalClassSystem === 'Y'
                    ? formatMessage(messages.classFrameworkOption1)
                    : formatMessage(messages.classFrameworkOption2)}
                </div>
              </div>
            </div>
          </div>
          {/* 班级名称配置 */}
          <div className={styles.classNameSet}>
            <div className={styles.setTitle}>{formatMessage(messages.classFormatSetTit)}</div>
            <div className={styles.classNameSetCont}>
              <div className={styles.classSetting} style={{ marginRight: '20px' }}>
                <div className={styles.itemTit}>{formatMessage(messages.classAliasTit)}</div>
                <div className={styles.itemCont}>
                  {campusConfigInfo && campusConfigInfo.optionalClassAlias === 'Y'
                    ? formatMessage(messages.classAliasOption1)
                    : formatMessage(messages.classAliasOption2)}
                </div>
                <Popover
                  overlayClassName={styles.pop}
                  placement="bottom"
                  title={text}
                  content={popContent}
                  trigger="click"
                  visible={popoverVisible}
                  onVisibleChange={this.visibleChange}
                  overlayStyle={{ paddingTop: '2px' }}
                >
                  <div className={styles.setBtn} onClick={this.setClassRange}>
                    <i className="iconfont icon-link-arrow-down">
                      <span style={{ paddingLeft: '3px' }}>
                        {formatMessage(messages.settingTit)}
                      </span>
                    </i>
                  </div>
                </Popover>
              </div>
              {/* 班级名称格式 */}
              <div className={styles.classSetting}>
                <div className={styles.itemTit}>{formatMessage(messages.classFormatTit)}</div>
                <div className={styles.itemCont} style={{ display: 'flex' }}>
                  <div className={styles.yang}>{formatMessage(messages.yang)}</div>
                  <div className={styles.formatName}>{showBracketsStr}</div>
                </div>
                <Popover
                  overlayClassName={styles.pop}
                  placement="bottom"
                  title={nameFormatText}
                  content={nameFormatContent}
                  trigger="click"
                  visible={classNamePopoverVisible}
                  onVisibleChange={this.classNameVisibleChange}
                  autoAdjustOverflow={false}
                  overlayStyle={{ paddingTop: '2px' }}
                >
                  <div className={styles.setBtn} onClick={this.setClassName}>
                    <i className="iconfont icon-link-arrow-down">
                      <span style={{ paddingLeft: '3px' }}>
                        {formatMessage(messages.settingTit)}
                      </span>
                    </i>
                  </div>
                </Popover>
              </div>
            </div>
          </div>
          {/* 学校Logo配置 */}
          <div className={styles.classNameSet}>
            <div className={styles.setTitle}>{formatMessage(messages.campusLogoConfigTit)}</div>
            <div className={styles.campusLogoCont}>
              <div className={styles.logoBox}>
                <img
                  className={styles.campusLogo}
                  src={currentLogoPath || defaultCampusPic}
                  alt="campusLogo"
                />
              </div>
              <div className={styles.tip}>{formatMessage(messages.campusLogoConfigTip)}</div>
              <div className={styles.upload}>
                <CustomUpload
                  name={formatMessage(messages.uploadBtnTit)}
                  onSuccess={this.handleSuccess}
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => {
    return window.innerHeight;
  },
  getWidth: () => {
    return window.innerWidth;
  },
})(CampusBasicConfigure);
