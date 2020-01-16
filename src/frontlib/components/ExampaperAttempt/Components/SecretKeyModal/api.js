import React from 'react';
import ReactDom from 'react-dom';
import SecretKeyModal from './index';

//添加试卷
export default function showSecretKeyModal({ dataSource,respondentsObject, item,callback }) {
  let func = () => {
    let element = document.getElementById('addNewPaper');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addNewPaper';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <SecretKeyModal dataSource={dataSource} callback={callback} item={item} onClose={func} respondentsObject={respondentsObject} />,
    document.getElementById('addNewPaper')
  );
}
