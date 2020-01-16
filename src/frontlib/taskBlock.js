import dynamic from 'dva/dynamic';


// 只引入 任务 区块功能
const TaskBlock = dynamic({
  app    : window.g_app,
  models : ()=> [
    import('./models/examBlock')
  ],
  component: () => import('./components/ExamBlock'),
});

export default TaskBlock;
