/**
 * 统考报告常量配置
 * @author tina.zhang
 * @date   2019-8-21
 */

/**
 * uexam tab keys
 */
const UEXAM_REPORT_TAB = {
  TAB_1: '1',
  TAB_2: '2',
  TAB_3: '3',
  TAB_4: '4',
  TAB_5: '5',
}

/**
 * !TODO 类型
 * 用于控制区、校、班不同的显示方式
 */
const SYS_TYPE = {
  /**
   * 区级
   */
  UEXAM: 'EXAM',
  /**
   * 校级
   */
  CAMPUS: 'CAMPUS',
  /**
   * 班级
   */
  CLASS: 'CLASS'
}

/**
 * 接口请求 campusId = FULL
 */
const FULL_CAMPUS_ID = 'FULL';

/**
 * 试卷下拉框，不限选项
 */
const FULL_PAPER_ID = 'FULL';

/**
 * 班级复选框，全部选项
 */
const FULL_CLASS_ID = 'FULL';

/**
 * !TODO 雷达图各图例指定颜色
 * 自定义图表颜色
 */
const SYS_COLORS = {
  /**
   * 本次考试，颜色
   */
  FULL_CLASS: '#03C46B',
  /**
   * 本校，颜色
   */
  CAMPUS: '#FFB400',
  /**
   * 班级，颜色
   */
  CLASS: '#228EFF',
}

export default {
  UEXAM_REPORT_TAB,
  SYS_TYPE,
  FULL_CAMPUS_ID,
  FULL_PAPER_ID,
  FULL_CLASS_ID,
  SYS_COLORS
}


