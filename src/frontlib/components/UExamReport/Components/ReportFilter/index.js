import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Select, Row, Col, Affix, Icon } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
// import Dimensions from 'react-dimensions';
import ReportPanel from '../ReportPanel/index';
import constant from '../../constant';
import styles from './index.less';

const { Option } = Select;

const messages = defineMessages({
  paperLabel: { id: 'app.examination.report.reportfilter.paperLabel', defaultMessage: '试卷' },
  classLabel: { id: 'app.text.uexam.report.reportfilter.classLabel', defaultMessage: '班级' },
  noAnswerInfo: {
    id: 'app.examination.report.reportfilter.noAnswerInfo',
    defaultMessage: '无答卷信息',
  },
  studentAnswerNum: {
    id: 'app.examination.report.reportfilter.studentAnswerNum',
    defaultMessage: '学生答卷人数',
  },

  fullClassSelector: { id: 'app.report.constant.fullclassselector', defaultMessage: '全部' },
  fullPaperSelector: { id: 'app.report.constant.fullpaperselector', defaultMessage: '不限' },
});

// const keys
const { SYS_TYPE, FULL_CAMPUS_ID, FULL_CLALSS_ID, FULL_PAPER_ID } = constant;

/**
 * 考后报告 试卷、班级筛选
 * @author tina.zhang
 * @date   2019-08-21
 * @param {array} paperList - 试卷列表
 * @param {array} classList - 班级列表
 * @param {number} examNum - 答卷人数
 * @param {function} onPaperChanged(value,item) - 试卷切换
 * @param {function} onClassChanged(value,item) - 班级切换
 * @param {boolean} showFullPaperOption - 是否显示【不限】选项
 * @param {string} defaultPaperId - 默认选中试卷ID
 * @param {boolean} multiple - 班级是否多选
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 * @param {string} hiddenFullClassOption - 报告详情页，单板报告时，隐藏班级 “全部选项”
 */
function ReportFilter(props) {
  // const ReportFilter = React.forwardRef((props, ref) => {

  const {
    taskId,
    examStudentNum,
    dispatch,
    showFullPaperOption,
    paperList,
    defaultPaperId,
    classList,
    examNum,
    multiple,
    onPaperChanged,
    onClassChanged,
    type,
    hiddenFullClassOption,
  } = props;

  const fullClassSelector = formatMessage(messages.fullClassSelector);
  const fullPaperSelector = formatMessage(messages.fullPaperSelector);

  const [state, setState] = useState({
    affixed: false,
    paperSelectorOpen: false,
    classSelectorOpen: false,
    paperId: FULL_PAPER_ID,
    classId: hiddenFullClassOption && classList ? classList[0].classId : FULL_CLALSS_ID,
    classIdList: [],
  });

  useEffect(() => {
    if (!showFullPaperOption && state.paperId === FULL_PAPER_ID) {
      if (paperList) {
        setState({
          ...state,
          paperId: defaultPaperId || paperList[0].paperId, // paperList.filter(v => v.examNum > 0)[0].paperId
        });
      }
    }
  }, [showFullPaperOption]);

  // 加载答卷人数
  useEffect(() => {
    // 单班报告隐藏学生答卷人数
    if (type === SYS_TYPE.CLASS) {
      return;
    }
    const { paperId, classId, classIdList } = state;
    if (paperId === FULL_PAPER_ID) {
      return;
    }
    const classIds = !multiple ? [classId] : classIdList;
    dispatch({
      type: 'uexamReport/getExamNum',
      payload: {
        campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
        taskId,
        paperId,
        classIdList: classIds,
      },
    });
  }, [state.paperId, state.classId, state.classIdList]);

  // 获取答卷人数
  const getExamNum = useMemo(() => {
    if (state.paperId === FULL_PAPER_ID) {
      return examNum || 0;
    }
    // return paperList.find(v => v.paperId === state.paperId).examNum;
    return examStudentNum || 0;
  }, [state.paperId, examStudentNum]);

  // #region 事件处理
  const stateRef = useRef();
  stateRef.current = state;

  // // 固钉
  // const handlerAffixChange = useCallback((affixed) => {
  //   setState({
  //     ...stateRef.current,
  //     affixed,
  //     paperSelectorOpen: false,
  //     classSelectorOpen: false
  //   })
  // }, [])

  // 试卷选择
  const handlePaperChanged = useCallback((value, item) => {
    setState({
      ...stateRef.current,
      paperId: value,
      paperSelectorOpen: false,
    });
    if (onPaperChanged && typeof onPaperChanged === 'function') {
      onPaperChanged(value, item);
    }
  }, []);

  // 班级选择（多选）
  const handleClassSelect = useCallback(value => {
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
      classIdList: selectedItems,
    });
    // change
    if (onClassChanged && typeof onClassChanged === 'function') {
      onClassChanged([...selectedItems]);
    }
  }, []);

  const handleClassDeselect = useCallback(value => {
    const selectedItems = stateRef.current.classIdList;
    if (value !== FULL_CLALSS_ID) {
      const valueIndex = selectedItems.indexOf(value);
      selectedItems.splice(valueIndex, 1);
      setState({
        ...stateRef.current,
        classIdList: selectedItems,
      });
    }
    // change
    if (onClassChanged && typeof onClassChanged === 'function') {
      onClassChanged([...selectedItems]);
    }
  }, []);

  // 单班选择
  const handleClassChanged = useCallback((value, item) => {
    setState({
      ...stateRef.current,
      classId: value,
      classSelectorOpen: false,
    });
    if (onClassChanged && typeof onClassChanged === 'function') {
      onClassChanged(value, item);
    }
  }, []);

  // 窗体滚动，收起下拉列表
  const handleScroll = useCallback(() => {
    if (stateRef.current.paperSelectorOpen || stateRef.current.classSelectorOpen) {
      setState({
        ...stateRef.current,
        paperSelectorOpen: false,
        classSelectorOpen: false,
      });
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
  const onPaperDropdownVisibleChange = useCallback(open => {
    setState({
      ...stateRef.current,
      paperSelectorOpen: open,
    });
  }, []);

  // 班级下拉列表改变事件
  const onClassDropdownVisibleChange = useCallback(open => {
    setState({
      ...stateRef.current,
      classSelectorOpen: open,
    });
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
    width: '80%',
  };
  const classSelectStyle = {
    maxWidth: '90%',
    minWidth: '140px',
  };
  // #endregion

  // container width
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const handleWindowResize = useCallback(e => {
    setContainerWidth(window.innerWidth);
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // 低分辨率时班级选择框换行设置顶部margin
  // const containerWidth = window.innerWidth;
  const classColSpan = useMemo(() => {
    // const { containerWidth } = props;
    let colSpan = {};
    if (containerWidth < 1200 && classList && classList.length > 0) {
      colSpan = {
        marginTop: '10px',
      };
    }
    return colSpan;
  }, [containerWidth]);

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
    };
    return { dom, top, affixStyle };
  }, [state.affixed]);

  return (
    // <Affix offsetTop={domAndTop.top} onChange={handlerAffixChange} target={() => domAndTop.dom}>
    // <div className={styles.reportFilter} ref={ref}>
    <div className={styles.reportFilter}>
      <ReportPanel style={state.affixed ? domAndTop.affixStyle : {}}>
        <Row
          gutter={20}
          className={styles.filterRow}
          type="flex"
          justify="space-around"
          align="top"
        >
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
                {showFullPaperOption && (
                  <Option key={FULL_PAPER_ID} value={FULL_PAPER_ID}>
                    {fullPaperSelector}
                  </Option>
                )}
                {paperList &&
                  paperList.length > 0 &&
                  paperList.map(item => {
                    let text = `${item.paperName}  |  ${formatMessage({
                      id: 'app.text.examination.report.reportfilter.fullmark',
                      defaultMessage: '总分',
                    })}${item.mark}`;
                    let disabled = false;
                    if (item.examNum <= 0) {
                      text = `${text}  (${formatMessage(messages.noAnswerInfo)})`;
                      disabled = true;
                    }
                    return (
                      <Option
                        key={item.paperId}
                        value={item.paperId}
                        disabled={disabled}
                        title={text}
                      >
                        {text}
                      </Option>
                    );
                  })}
              </Select>
            </div>
          </Col>
          {containerWidth < 1200 && (
            <Col lg={6} xs={6}>
              {type !== SYS_TYPE.CLASS && (
                <div className={styles.rightContent}>
                  {formatMessage(messages.studentAnswerNum)}：
                  <span className={styles.examNum}>{getExamNum}</span>
                </div>
              )}
            </Col>
          )}
          <Col xl={12} lg={24} xs={24} style={classColSpan}>
            {classList && classList.length === 1 && (
              <div className={styles.selectContainer}>
                <span>{formatMessage(messages.classLabel)}：</span>
                <span className={styles.className}>{classList[0].className}</span>
              </div>
            )}
            {classList && classList.length > 1 && (
              <div className={styles.selectContainer}>
                <span>{formatMessage(messages.classLabel)}：</span>
                {multiple ? (
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
                ) : (
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
                    {!hiddenFullClassOption && (
                      <Option key={FULL_CLALSS_ID} value={FULL_CLALSS_ID}>
                        {fullClassSelector}
                      </Option>
                    )}
                    {classList.map(item => (
                      <Option key={item.classId} value={item.classId}>
                        {item.className}
                      </Option>
                    ))}
                  </Select>
                )}
              </div>
            )}
          </Col>
          {containerWidth >= 1200 && (
            <Col xl={4}>
              {type !== SYS_TYPE.CLASS && (
                <div className={styles.rightContent}>
                  {formatMessage(messages.studentAnswerNum)}：
                  <span className={styles.examNum}>{getExamNum}</span>
                </div>
              )}
            </Col>
          )}
        </Row>
      </ReportPanel>
    </div>
    // </Affix>
  );
}

// export default Dimensions({
//   getHeight: () => window.innerHeight,
//   getWidth: () => window.innerWidth,
// })(ReportFilter);

export default connect(({ uexamReport }) => ({
  taskId: uexamReport.taskInfo ? uexamReport.taskInfo.taskId : null, // 任务总览
  examStudentNum: uexamReport.examStudentNum,
}))(ReportFilter);
