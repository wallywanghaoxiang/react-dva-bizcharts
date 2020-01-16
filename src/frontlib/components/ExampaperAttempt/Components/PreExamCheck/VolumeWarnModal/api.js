import React from 'react';
import ReactDom from 'react-dom';
import VolumeWarnModal from './index';

//添加试卷
export default function showVolumeWarnModal({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('volumeWarn');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'volumeWarn';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <VolumeWarnModal dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('volumeWarn')
  );
}
