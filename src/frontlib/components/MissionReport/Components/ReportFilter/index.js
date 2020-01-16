import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Dimensions from 'react-dimensions';
import { Select, Row, Col, Affix, Icon } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../ReportPanel/index';
import constant from '../../constant';
import styles from './index.less';

const { Option } = Select;

const messages = defineMessages({
  paperLabel: { id: 'app.examination.report.reportfilter.paperLabel', defaultMessage: '试卷' },
  classLabel: { id: 'app.examination.report.reportfilter.classLabel', defaultMessage: '班级' },
  groupLabel: { id: "app.text.examination.report.reportfilter.groupLabel", defaultMessage: "分组" },
  noAnswerInfo: { id: 'app.examination.report.reportfilter.noAnswerInfo', defaultMessage: '无答卷信息' },
  studentAnswerNum: { id: 'app.examination.report.reportfilter.studentAnswerNum', defaultMessage: '学生答卷人数' },

  fullClassSelector: { id: 'app.report.constant.fullclassselector', defaultMessage: '全部' },
  fullPaperSelector: { id: 'app.report.constant.fullpaperselector', defaultMessage: '不限' }
});

// const keys
const { FULL_CLALSS_ID, CLASS_TYPES, FULL_PAPER_ID, FULL_PAPER_SELECTOR } = constant;

/**
 * 考后报告 试卷、班级筛选
 * @author tina.zhang
 * @date   2019-05-06
 * @param {boolean} showFullPaperOption - 试卷必选
 * @param {array} paperList - 试卷列表
 * @param {string} defaultPaperId - 选中试卷ID
 * @param {array} classList - 班级列表
 * @param {number} examNum - 答卷人数
 * @param {boolean} multiple - 班级是否多选
 * @param {function} onPaperChanged(value,item) - 试卷切换
 * @param {function} onClassChanged(value,item) - 班级切换
 * @param {string} classType - 任务发布班级类型
 */
const ReportFilter = React.forwardRef((props, ref) => {

  const { showFullPaperOption, paperList, defaultPaperId, classList, examNum, multiple, onPaperChanged, onClassChanged, classType } = props;

  const formatClassLabel = formatMessage(classType !== CLASS_TYPES.learningGroup ? messages.classLabel : messages.groupLabel);
  const fullClassSelector = formatMessage(messages.fullClassSelector);
  const fullPaperSelector = formatMessage(messages.fullPaperSelector);
  const isTeacher = localStorage.identityCode === 'ID_TEACHER';

  const [state, setState] = useState({
    affixed: false,
    paperSelectorOpen: false,
    classSelectorOpen: false,
    paperId: FULL_PAPER_ID,
    classId: FULL_CLALSS_ID,
    classIdList: []
  });

  useEffect(() => {
    if (!showFullPaperOption && state.paperId === FULL_PAPER_ID) {
      setState({
        ...state,
        paperId: defaultPaperId || paperList.filter(v => v.examNum > 0)[0].paperId
      })
    }
  }, [showFullPaperOption]);

  // #region 事件处理
  const stateRef = useRef();
  stateRef.current = state;

  // 固钉
  const handlerAffixChange = useCallback((affixed) => {
    setState({
      ...stateRef.current,
      affixed,
      paperSelectorOpen: false,
      classSelectorOpen: false
    })
  }, [])

  // 试卷选择
  const handlePaperChanged = useCallback((value, item) => {
    setState({
      ...stateRef.current,
      paperId: value,
      paperSelectorOpen: false
    })
    if (onPaperChanged && typeof (onPaperChanged) === 'function') {
      onPaperChanged(value, item);
    }
  }, []);

  // 班级选择（多选）
  const handleClassSelect = useCallback((value) => {
    let selectedItems = stateRef.current.classIdList;
    if (value === FULL_CLALSS_ID) {
      selectedItems = [];
    } else {
      const valueIndex = selectedItems.indexOf(value);
      if (valueIndex < 0) {
        selectedItems.push(value);
      } else {
        selectedItems.splice(valueIndex, 1);
      }
    }
    setState({
      ...stateRef.current,
      classIdList: selectedItems
    })
    // change
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged([...selectedItems]);
    }
  }, []);

  const handleClassDeselect = useCallback((value) => {
    const selectedItems = stateRef.current.classIdList;
    if (value !== FULL_CLALSS_ID) {
      const valueIndex = selectedItems.indexOf(value);
      selectedItems.splice(valueIndex, 1);
      setState({
        ...stateRef.current,
        classIdList: selectedItems
      })
    }
    // change
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged([...selectedItems]);
    }
  }, [])

  // 单班选择
  const handleClassChanged = useCallback((value, item) => {
    setState({
      ...stateRef.current,
      classId: value,
      classSelectorOpen: false
    })
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged(value, item);
    }
  }, [])

  // 窗体滚动，收起下拉列表
  const handleScroll = useCallback(() => {
    if (stateRef.current.paperSelectorOpen || stateRef.current.classSelectorOpen) {
      setState({
        ...stateRef.current,
        paperSelectorOpen: false,
        classSelectorOpen: false
      })
    }
  }, []);

  // 注册窗体滚动监听
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    const popWindow = document.getElementsByClassName('ant-modal-body')[0];
    if (popWindow) {
      popWindow.addEventListener('scroll', handleScroll);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (popWindow) {
        popWindow.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 试卷下拉列表改变事件
  const onPaperDropdownVisibleChange = useCallback((open) => {
    setState({
      ...stateRef.current,
      paperSelectorOpen: open
    })
  }, []);

  // 班级下拉列表改变事件
  const onClassDropdownVisibleChange = useCallback((open) => {
    setState({
      ...stateRef.current,
      classSelectorOpen: open
    })
  }, []);

  // 禁止 select 输入
  useEffect(() => {
    if (classList && classList.length > 1 && multiple) {
      const selector = document.getElementsByClassName('readonlySelector');
      if (selector && selector.length > 0) {
        const ipt = selector[0].getElementsByClassName('ant-select-search__field');
        if (ipt && ipt.length > 0) {
          ipt[0].setAttribute('readonly', 'readonly');
        }
      }
    }
  }, [classList, multiple]);
  // #endregion

  // #region styles


  const paperSelectStyle = {
    width: '80%'
  }
  const classSelectStyle = {
    maxWidth: '90%',
    minWidth: '140px',
  }
  // #endregion

  // 低分辨率时班级选择框换行设置顶部margin
  // const containerWidth = window.innerWidth;
  const { containerWidth } = props;
  let classColSpan = {};
  if (containerWidth < 1200 && classList && classList.length > 0) {
    classColSpan = {
      marginTop: '10px'
    }
  }

  // 固钉size计算
  const domAndTop = useMemo(() => {
    let dom = window;
    let top = 64;
    const affixM = { marginLeft: '-48px', marginRight: '-48px' };

    if (document.getElementById('popWindow')) {
      dom = document.getElementById('popWindow').parentNode;
      top = 0;
      affixM.marginLeft = '-24px';
      affixM.marginRight = '-30px';
    } else if (props.type && props.type === 'exam') {
      dom = document.getElementById('divReportOverview').parentNode.parentNode;
      top = 0;
      affixM.marginLeft = '-54px';
      affixM.marginRight = '-54px';

    }

    const affixStyle = {
      zIndex: '9',
      // width: 'calc(100%-200px)',
      ...affixM,
      borderRadius: '0px',
      boxShadow: '0px 4px 3px -2px rgba(0, 0, 0, 0.1)',
    }
    return { dom, top, affixStyle };
  }, [state.affixed]);

  return (
    <Affix offsetTop={domAndTop.top} onChange={handlerAffixChange} target={() => domAndTop.dom}>
      <div className={styles.reportFilter} ref={ref}>
        <ReportPanel style={state.affixed ? domAndTop.affixStyle : {}}>
          <Row gutter={20} className={styles.filterRow} type="flex" justify="space-around" align="top">
            <Col xl={8} lg={18} xs={18}>
              <div className={styles.selectContainer}>
                <span>{formatMessage(messages.paperLabel)}：</span>
                <Select
                  style={paperSelectStyle}
                  onChange={handlePaperChanged}
                  value={state.paperId}
                  open={state.paperSelectorOpen}
                  onDropdownVisibleChange={onPaperDropdownVisibleChange}
                >
                  {showFullPaperOption &&
                    <Option key={FULL_PAPER_ID} value={FULL_PAPER_ID}>
                      {fullPaperSelector}
                    </Option>
                  }
                  {paperList && paperList.length > 0 &&
                    paperList.map(item => {
                      let text = `${item.paperName}  |  ${formatMessage({ id: "app.text.examination.report.reportfilter.fullmark", defaultMessage: "总分" })}${item.mark}`;
                      let disabled = false;
                      if (item.examNum <= 0) {
                        text = `${text}  (${formatMessage(messages.noAnswerInfo)})`;
                        disabled = true;
                      }
                      return (
                        <Option key={item.paperId} value={item.paperId} disabled={disabled} title={text}>
                          {text}
                        </Option>
                      )
                    })}
                </Select>
              </div>
            </Col>
            {containerWidth < 1200 &&
              <Col lg={6} xs={6}>
                <div className={styles.rightContent} style={{ display: isTeacher ? 'block' : 'none' }}>
                  {formatMessage(messages.studentAnswerNum)}：<span className={styles.examNum}>{examNum}</span>
                </div>
              </Col>
            }
            <Col xl={12} lg={24} xs={24} style={classColSpan}>
              {classList && classList.length === 1 &&
                <div className={styles.selectContainer}>
                  <span>{formatClassLabel}：</span>
                  <span className={styles.className}>{classList[0].className}</span>
                </div>
              }
              {classList && classList.length > 1 &&
                <div className={styles.selectContainer}>
                  <span>{formatClassLabel}：</span>
                  {multiple ?
                    <Select
                      className="readonlySelector"
                      style={classSelectStyle}
                      mode="multiple"
                      placeholder={fullClassSelector}
                      showArrow
                      removeIcon={<Icon type="close" />}
                      onSelect={handleClassSelect}
                      onDeselect={handleClassDeselect}
                      value={state.classIdList}
                      dropdownMatchSelectWidth={false}
                      open={state.classSelectorOpen}
                      onDropdownVisibleChange={onClassDropdownVisibleChange}
                    >
                      <Option key={FULL_CLALSS_ID} value={FULL_CLALSS_ID}>
                        {fullClassSelector}
                      </Option>
                      {classList.map(item => (
                        <Option key={item.classId} value={item.classId}>
                          {item.className}
                        </Option>
                      ))}
                    </Select>
                    :
                    <Select
                      style={classSelectStyle}
                      placeholder={fullClassSelector}
                      showArrow
                      onChange={handleClassChanged}
                      value={state.classId}
                      dropdownMatchSelectWidth={false}
                      open={state.classSelectorOpen}
                      onDropdownVisibleChange={onClassDropdownVisibleChange}
                    >
                      <Option key={FULL_CLALSS_ID} value={FULL_CLALSS_ID}>
                        {fullClassSelector}
                      </Option>
                      {classList.map(item => (
                        <Option key={item.classId} value={item.classId}>
                          {item.className}
                        </Option>
                      ))}
                    </Select>
                  }
                </div>
              }
            </Col>
            {containerWidth >= 1200 &&
              <Col xl={4}>
                <div className={styles.rightContent} style={{ display: isTeacher ? 'block' : 'none' }}>
                  {formatMessage(messages.studentAnswerNum)}：<span className={styles.examNum}>{examNum}</span>
                </div>
              </Col>
            }
          </Row>
        </ReportPanel>
      </div>
    </Affix>
  )
})
export default Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})(ReportFilter);

// export default ReportFilter;
