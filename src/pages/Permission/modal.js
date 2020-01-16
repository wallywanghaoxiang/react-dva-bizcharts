// 弹出框打开方式
import Modal from '@/components/Modal/popupModal';
import styles from './index.less';

export default dom => {
  Modal.info({
    title: null,
    visible: true,
    closeable: false,
    centered: true,
    className: styles.infoForModal,
    width: 930,
    icon: null,
    okButtonProps: {
      style: { display: 'none' },
    },
    cancelButtonProps: {
      style: { display: 'none' },
    },
    content: dom,
    bodyStyle: { padding: '0px' },
  });
};
