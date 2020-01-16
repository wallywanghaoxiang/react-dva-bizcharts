import React from 'react';
import ReactDom from 'react-dom';
import ExamReport from './index';

// 添加试卷
export default function showExamReport({ dataSource, callback }) {
  const func = () => {
    const element = document.getElementById('ExamReport');
    if (element) element.parentNode.removeChild(element);
  };

  const div = document.createElement('div');
  div.id = 'ExamReport';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <ExamReport dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('ExamReport')
  );
}
