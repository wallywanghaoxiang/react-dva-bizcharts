import React from 'react';
import ReactDom from 'react-dom';
import AddNewPaperModal from './index';

//添加试卷
export default function showAddPaperModal({
  dataSource,
  masterData,
  callback,
  hiddenRecordAnswer,
}) {
  let func = () => {
    let element = document.getElementById('addNewAnswerPaper');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addNewAnswerPaper';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddNewPaperModal
      dataSource={dataSource}
      masterData={masterData}
      callback={callback}
      onClose={func}
      pop={true}
      hiddenRecordAnswer={hiddenRecordAnswer}
    />, //pop弹窗模式
    document.getElementById('addNewAnswerPaper')
  );
}
