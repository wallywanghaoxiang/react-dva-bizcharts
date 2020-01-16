import dynamic from 'dva/dynamic';
import ExampaperAttempt from './components/ExampaperAttempt';
import ExampaperProduct from './components/ExampaperProduct';
import TaskBlock from './taskBlock';

/**
 * 绑定 练习模式下的modal
 */
export const UserPageComponent = dynamic({
  app : window.g_app,
  models: () => [
    import('./models/examProduct'),
  ],
  component: () => import('./components/ExampaperProduct'),
});

export default { ExampaperAttempt, ExampaperProduct, TaskBlock };
