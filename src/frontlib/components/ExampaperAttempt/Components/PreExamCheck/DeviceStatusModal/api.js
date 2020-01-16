import React from 'react';
import ReactDom from 'react-dom';
import DeviceStatusModal from './index';

// 弹框是否显示
let isShow = false;
let closeFn = "";

// 关闭耳机掉落警告弹框
export function hideDeviceStatusModal() {
  if( !isShow ) return;
  if( closeFn && typeof(closeFn) === "function" ){
    closeFn();
  }
  const element = document.getElementById('deviceStatusModal');
  if (element) element.parentNode.removeChild(element);

  isShow = false;
}

// 耳机掉落警告
export function showDeviceStatusModal({ dataSource, callback, onError }) {
  if( isShow ) return;
  // 关闭弹框事件
  const bindOnClose = fn=>{
    if( fn && typeof(fn) === "function" ){
      closeFn = fn;
    }
  }
  const div = document.createElement('div');
  div.id = 'deviceStatusModal';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <DeviceStatusModal dataSource={dataSource} onError={onError} callback={callback} onClose={hideDeviceStatusModal} bindOnClose={bindOnClose} />,
    document.getElementById('deviceStatusModal')
  );
  isShow = true;
}
