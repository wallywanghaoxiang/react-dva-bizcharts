export default [
  // browser
  {
    path: '/browser',
    component: '../layouts/BrowserLayout',
    routes: [
      { path: '/browser', redirect: '/browser/browserVersion' },
      // 系统判断浏览器最低版本
      { path: '/browser/browserVersion', name: '', component: './BrowserVersion' },
      // 如果进行课后训练的最低版本
      { path: '/browser/trainBrowserVersion', name: '', component: './BrowserVersion/Train' },
    ],
  },
  // correct
  {
    path: '/artificial',
    component: '../layouts/BlankLayout',
    routes: [
      { path: '/artificial', redirect: '/artificial/correct/:paperId/:taskId/:classId' },
      {
        path: '/artificial/correct/:paperId/:taskId/:classId',
        name: '',
        component: './Correction/index.js',
      },
    ],
  },
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      // { path: '/user/login', component: './User/Login/index' },
      { path: '/user/login', component: './User/Login/home' },
      { path: '/user/register/:type', component: './User/Register/index' },
      { path: '/user/perfect', component: './User/Perfect/index' },
      { path: '/user/binding', component: './User/Binding' },
      { path: '/user/resetpw/:type', component: './User/ChangePW/index' },
      { path: '/user/togglerole', component: './User/ToggleRole' }, // 切换教师， type：（teahcer，student） 要切换成为的角色
      { redirect: '/exception/404' },
    ],
  },
  { path: '/', redirect: '/user' },
  // student
  {
    path: '/student',
    component: '../layouts/StudentLayout',
    routes: [
      { path: '/student/home', name: 'studentHome', component: './User/Student/Home/index.js' },
      {
        path: '/student/center',
        name: 'studentCenter',
        component: './User/Student/Center/index.js',
      },
      {
        path: '/student/learncenter',
        name: 'learnCenter',
        component: './User/Student/LearnCenter/index.js',
      },
      { redirect: '/exception/404' },
    ],
  },
  // do tAKING( 进行任务-线上版本 )
  {
    path: '/task/:taskId',
    component: './Task/index.js',
    routes: [
      { path: '/task/:taskId/', redirect: '/task/:taskId/ready' },
      // 任务准备页面
      {
        path: '/task/:taskId/ready',
        name: 'taskReady',
        component: './Task/Ready/index.js',
      },
      // 进入任务页面
      {
        path: '/task/:taskId/progress',
        name: 'taskProgress',
        component: './Task/Progress/index.js',
      },
      // 进入结果页面
      {
        path: '/task/:taskId/result',
        name: 'taskResult',
        component: './Task/Result/index.js',
      },
      { redirect: '/exception/404' },
    ],
  },

  // 报错提示页面 400 403 404 500
  {
    name: 'exception',
    icon: 'warning',
    path: '/exception/:type?',
    component: './Exception',
  },

  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      { path: '/', redirect: '/user' },
      {
        path: '/home',
        name: 'home',
        component: './Home',
        icon: 'icon-home',
      },
      // 听说模考
      {
        name: 'examination',
        icon: 'icon-computer-play',
        path: '/examination',
        routes: [
          // result
          {
            path: '/examination/publish',
            name: 'release',
            component: './Examination/Publish',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/examination/publish',
                redirect: '/examination/publish/step',
              },
              {
                path: '/examination/publish/step',
                name: 'public',
                component: './Examination/Publish/Publish',
              },
              {
                path: '/examination/publish/configuration/:taskType',
                name: 'public',
                component: './Examination/Publish/Configuration',
              },
              {
                path: '/examination/publish/selectpaper/:taskType',
                name: 'public',
                component: './Examination/Publish/SelectPaper',
              },
              {
                path: '/examination/publish/confirm/:taskType',
                name: 'public',
                component: './Examination/Publish/Confirm',
              },
              {
                path: '/examination/publish/affterclasstrain',
                name: 'public',
                component: './Examination/Publish/AffterClassTrain',
              },
              { redirect: '/exception/404' },
            ],
          },
          {
            path: '/examination/inspect',
            name: 'inspect',
            component: './Examination/Inspect/index',
          },
          {
            path: '/examination/inspect/detail/:taskId',
            name: 'taskDetail',
            component: './Examination/Inspect/TaskDetail/index',
          },
          // 考后报告 leo.guo 2019-05-06
          {
            path: '/examination/inspect/report/:id',
            name: 'report',
            hideInMenu: true,
            component: './Examination/Report/Teacher',
          },
          // 学生报告 leo.guo 2019-05-06
          {
            path: '/examination/inspect/report/student/:id/:paperId/:studentId',
            name: 'report',
            hideInMenu: true,
            component: './Examination/Report/Student',
          },
          // 课后训练 leo.guo 2019-06-25
          {
            path: '/examination/inspect/inspection/:id',
            name: 'inspect',
            hideInMenu: true,
            component: './Examination/Inspect/Inspection',
          },
          // 统考任务列表  leo.guo 2019-8-12
          { path: '/examination/uexam', name: 'uexam', component: './Examination/Uexam/TaskList' },
          // 考场编排 tina.zhang.xu 2019-8-7 区统一编排
          {
            path: '/examination/uexam/editroom/roommanage/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/EditRoom/RoomManage',
          },
          // 统考-报名  leo.guo 2019-8-29
          {
            path: '/examination/uexam/registration/manage/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Registration/Manage',
          },
          // 统考-报名结果  leo.guo 2019-8-29
          {
            path: '/examination/uexam/registration/result/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Registration/Result',
          },
          // 统考-监考安排  leo.guo 2019-8-13
          {
            path: '/examination/uexam/invigilation/manage/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Invigilation/Manage',
          },
          // 统考-监考安排结果  leo.guo 2019-8-16
          {
            path: '/examination/uexam/invigilation/result/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Invigilation/Result',
          },
          // 统考-考务信息  leo.guo 2019-8-20
          {
            path: '/examination/uexam/information/exam/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Information/Exam',
          },
          // 统考-批次信息  leo.guo 2019-9-6
          {
            path: '/examination/uexam/information/batch/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Information/Batch',
          },
          // 统考-统考报告  leo.guo 2019-9-2
          {
            path: '/examination/uexam/report/:taskId',
            name: 'uexam',
            hideInMenu: true,
            component: './Examination/Uexam/Report',
          },
          { redirect: '/exception/404' },
        ],
      },
      // 校区管理
      {
        name: 'campusmanage',
        icon: 'icon-config',
        path: '/campusmanage',
        routes: [
          // result
          {
            path: '/campusmanage/basicset',
            name: 'basicset',
            component: './CampusManage/BasicConfigure/index',
          },

          {
            path: '/campusmanage/classset',
            name: 'classset',
            component: './CampusManage/ClassConfigure/index',
          },
          {
            path: '/campusmanage/teachclassset',
            name: 'teachingClass',
            component: './CampusManage/TeachClassConfigure/index',
          },
          {
            path: '/campusmanage/teacherMange',
            name: 'teacherMange',
            component: './TeacherManage/index',
          },

          {
            path: '/campusmanage/subjectManage',
            name: 'subjectManage',
            component: './CampusManage/ManagerConfigure/index',
          },
          {
            path: '/campusmanage/teacherMange/import',
            name: 'importteacher',
            component: './TeacherManage/pages/Import/index',
            hideInMenu: true,
          },
          { redirect: '/exception/404' },
        ],
      },
      // 班级配置
      {
        name: 'classallocation',
        path: '/classallocation',
        icon: 'icon-group',
        routes: [
          // 班级管理
          {
            name: 'classmanage',
            path: './classmanage',
            component: './ClassAllocation/classmanage',
          },
          // 学习小组
          {
            name: 'learninggroup',
            path: './learninggroup',
            component: './ClassAllocation/learninggroup',
          },
          // 管理员
          {
            path: '/classallocation/classmanage/admin/:id',
            component: './ClassAllocation/pages/ClassManage/Administrator',
          },
          // 非管理员
          {
            path: '/classallocation/classmanage/nonadmin/:id',
            component: './ClassAllocation/pages/ClassManage/NonAdministrator',
          },
          // 教学班
          {
            path: '/classallocation/classmanage/teaching/:id',
            component: './ClassAllocation/pages/TeachingClass',
          },
          // 教学班班务管理
          {
            path: '/classallocation/classmanage/teaching/:id/ClassWork',
            component: './ClassAllocation/pages/TeachingClass/components/ClassWork',
          },
          // 我的分组
          {
            path: '/classallocation/classmanage/mygrouping',
            component: './ClassAllocation/pages/ClassManage/MyGrouping',
          },
          // 班务管理
          {
            path: '/classallocation/classmanage/classwork/:id',
            component: './ClassAllocation/pages/ClassManage/ClassWork',
          },
          // 导入学生
          {
            path: '/classallocation/classmanage/importingstudents/:naturalClassId',
            component: './ClassAllocation/pages/ClassManage/ImportingStudents',
          },
          { redirect: '/exception/404' },
        ],
      },
      // 试卷管理
      {
        name: 'papermanage',
        icon: 'icon-circle',
        path: '/papermanage',
        routes: [
          // result
          {
            path: '/papermanage/schoolpaper',
            name: 'schoolpaper',
            component: './MyPaperGroup/index',
          },
          {
            path: '/papermanage/schoolpaperbag',
            name: 'schoolpaper1',
            component: './PaperManage/index',
          },

          { path: '/papermanage/mypaper', name: 'mypaper', component: './PaperManage/mypaper' },
          { redirect: '/exception/404' },
        ],
      },

      // 站内信
      {
        name: 'notice',
        path: '/notice',
        routes: [
          // 教师端
          { path: '/notice/list', name: 'list', hideInMenu: true, component: './Notice/Teacher' },
          { redirect: '/exception/404' },
        ],
      },

      // {
      //   path: '/campusmanage/teachermanage/import',
      //   name: 'importteacher',
      //   component: './TeacherManage/pages/Import/index',
      //   hideInMenu: true,
      // },

      // 个人中心
      {
        name: 'account',
        path: '/account',
        hideInMenu: true,
        routes: [
          {
            path: '/account/center',
            name: 'center',
            component: './User/Center/index',
          },
          { redirect: '/exception/404' },
        ],
      },

      {
        name: 'result',
        icon: 'check-circle-o',
        path: '/result',
        routes: [
          // result
          {
            path: '/result/success',
            name: 'success',
            component: './Result/Success',
          },
          { path: '/result/fail', name: 'fail', component: './Result/Error' },
          { redirect: '/exception/404' },
        ],
      },

      { redirect: '/exception/404' },
    ],
  },
];
