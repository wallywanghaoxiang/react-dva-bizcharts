import React from 'react';
import ReactDom from 'react-dom';
import AddPublishCorrect from './index';

//校对
export default function showPublishCorrect({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('addPublishCorrect');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addPublishCorrect';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddPublishCorrect dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('addPublishCorrect')
  );
}
