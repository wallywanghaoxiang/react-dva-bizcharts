import React from 'react';
import ReactDom from 'react-dom';
import AddNewPaperModal from './index';

//添加试卷
export default function showAddPaperModal({ dataSource,masterData, modelStatus,callback }) {
  let func = () => {
    let element = document.getElementById('addNewPaper');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addNewPaper';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddNewPaperModal dataSource={dataSource} callback={callback} masterData={masterData} modelStatus={modelStatus} onClose={func} />,
    document.getElementById('addNewPaper')
  );
}
