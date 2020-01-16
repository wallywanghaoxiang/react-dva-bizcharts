import React from 'react';
import ReactDom from 'react-dom';
import AddNewSubjectModal from './index';

//添加试卷
export default function showAddQuestionModal({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('addNewSubject');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addNewSubject';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddNewSubjectModal dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('addNewSubject')
  );
}
