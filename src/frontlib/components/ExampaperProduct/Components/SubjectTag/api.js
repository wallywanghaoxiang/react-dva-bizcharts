import React from 'react';
import ReactDom from 'react-dom';
import AddSubjectTag from './index';

//试卷标签
export default function showPaperTag({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('addPaperTag');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addPaperTag';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddSubjectTag dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('addPaperTag')
  );
}
