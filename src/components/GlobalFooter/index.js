import React from 'react';
import classNames from 'classnames';
import styles from './index.less';
import Police from '@/assets/police.png';

const GlobalFooter = ({ className, links, copyright, isRegister }) => {
  const clsString = classNames(styles.globalFooter, className);
  return (
    <footer className={clsString}>
      {links && (
        <div className={styles.links}>
          {links.map(link => (
            <a
              style={{ color: isRegister ? '#888888' : '#ffffff' }}
              key={link.key}
              title={link.key}
              target={link.blankTarget ? '_blank' : '_self'}
              href={link.href}
            >
              {link.title}
            </a>
          ))}
        </div>
      )}
      {copyright && <div className={styles.copyright}>{copyright}</div>}
      {/* {isRegister !== undefined && (
        <p style={{ color: isRegister ? '#888888' : '#ffffff', fontSize: '12px' }}>
          Copyright ©️ 2018 GaoCloud.com All Rights Reserved. 
          <a style={{color:isRegister?'#888888':'#ffffff'}} className={styles.recordNumber} target="_blank" href=" http://www.beian.miit.gov.cn/state/outPortal/loginPortal.action">苏ICP备18063047号-1</a>
          <img style={{marginLeft:'10px',width:'16px',height:'16px',marginTop:'-2px'}} src={Police} alt="police" />
          <a style={{color:isRegister?'#888888':'#ffffff'}} className={styles.police} target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32059002002463">
            苏公网安备 32059002002463号
          </a>

        </p>
      )} */}
    </footer>
  );
};

export default GlobalFooter;
