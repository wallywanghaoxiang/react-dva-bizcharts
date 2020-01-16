import React from 'react';
import ReactDom from 'react-dom';
import EndExamModal from './index';

//添加试卷
export default function showEndExamModal({ dataSource, id,answersData, callback }) {
  let func = () => {
    let element = document.getElementById('addNewPaper');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addNewPaper';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <EndExamModal dataSource={dataSource} answersData={answersData} id={id} callback={callback} onClose={func} />,
    document.getElementById('addNewPaper')
  );
}
