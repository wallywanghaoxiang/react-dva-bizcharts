import React from 'react';
import ReactDom from 'react-dom';
import EndExamModal from './index';

//添加试卷
export default function showEndExamModal({ dataSource, id,instructions, callback }) {
  let func = () => {
    let element = document.getElementById('addNewPaperResult');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addNewPaperResult';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <EndExamModal dataSource={dataSource} id={id} instructions={instructions} callback={callback} onClose={func} />,
    document.getElementById('addNewPaperResult')
  );
}


