import { formatMessage, defineMessages } from 'umi/locale';

// const messages = defineMessages({
//   fullClassName: { id: 'app.report.constant.fullclassname', defaultMessage: '本次考试' },
//   fullExerciseName: { id: 'app.report.constant.fullexercisename', defaultMessage: '本次练习' },
//   fullClassSelector: { id: 'app.report.constant.fullclassselector', defaultMessage: '全部班级' },
//   fullPaperSelector: { id: 'app.report.constant.fullpaperselector', defaultMessage: '不限' }
// });

/**
 * 报告常量配置
 * @author tina.zhang
 * @date   2019-05-07
 */

// 本次考试(key)
const FULL_CLALSS_ID = 'FULL';
// 本次考试(text)
const FULL_CLALSS_NAME = '本次考试';// formatMessage(messages.fullClassName);
// 本次练习(text)
const FULL_EXERCISE_NAME = '本次练习'; // formatMessage(messages.fullExerciseName);
// 本次考试默认颜色
const FULL_CLALSS_COLOR = '#03C46B';
// 班级选择不限(text)
const FULL_CLALSS_SELECTOR = '全部班级';// formatMessage(messages.fullClassSelector);
// 试卷下拉框 不限（key）
const FULL_PAPER_ID = 'FULL';
// 试卷下拉框 不限（text）
const FULL_PAPER_SELECTOR = '不限'; // formatMessage(messages.fullClassSelector);

// 报告页切换tab key
const REPORT_TAB_KEY = {
  report: 'report',
  transcript: 'transcript',
  paperreport: 'paperreport',
  // studentreport:'studentreport',
}

// 学生排名信息显示方式
const STUDENT_RANKING_TYPE = {
  ranking: 'ranking',
  pass: 'pass'
}

// 班级类型
const CLASS_TYPES = {
  naturalClass: 'NATURAL_CLASS',
  teachingClass: 'TEACHING_CLASS',
  learningGroup: 'LEARNING_GROUP'
}


// 练习报告类型(type)
// const TASK_TYPE_TEST = 'TT_2';
// 课后训练
// const TASK_TYPE_TRAINING = 'TT_5';
/**
 * 任务类型
 * TT_1 本班考试(默认为考试)
 * TT_2 课堂练习
 * TT_3 多班联考(默认为考试)
 * TT_4 专项训练(// TODO)
 * TT_5 课后训练(该类型任务，需进一步根据 EXERCISE_TYPE 判断为考试还是练习)
 */
const TASK_TYPE = {
  // 课堂练习
  TEST: 'TT_2',
  // 课后训练
  TRAINING: 'TT_5'
}

// 课后练习模式分类
const EXERCISE_TYPE = {
  EXAM: 'EXAM_MODEL',
  EXER: 'EXER_MODEL'
}

export default {
  FULL_CLALSS_ID,
  FULL_CLALSS_NAME,
  FULL_CLALSS_COLOR,
  FULL_CLALSS_SELECTOR,
  FULL_PAPER_ID,
  FULL_PAPER_SELECTOR,
  REPORT_TAB_KEY,
  CLASS_TYPES,
  STUDENT_RANKING_TYPE,
  TASK_TYPE,
  EXERCISE_TYPE,
  FULL_EXERCISE_NAME
}


