import React, { useEffect, useCallback, useMemo,useState } from 'react';
import { AutoComplete, Input, Icon,Menu, Dropdown,Popover } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { stringFormat } from '@/utils/utils';
import NoData from '@/components/NoData';
import noneIcon from '@/assets/examination/none_serach_pic.png';
import styles from './index.less';

/**
 * 校区列表
 * @author tina.zhang
 * @date 2019-7-29 14:12:47
 * @param {Array} campusList - 校区列表
 * @param {string} activeCampusId - 选中校区ID
 * @param {function} onCampusSelect - 校区选中事件
 */
function CampusList(props) {

  const { campusList, activeCampusId, onCampusSelect,index,titleName,select,type,reEdit} = props;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  // 格式化自动补全数据源
  const autoDataSource = useMemo(() => {
    return campusList.map(v => ({
      value: v.campusId,
      text: v.campusName
    }));
  }, [campusList]);

  // 自动补全选中事件
  const handleSelected = useCallback((value, option) => {
    if (campusList.some(v => v.campusId === value)) {
      onCampusSelect(value);
    }
  }, [])

  // 校区列表项点击事件
  const handleCampusClick = useCallback((campus) => {
    if (onCampusSelect && typeof (onCampusSelect) === 'function') {
      onCampusSelect(campus.campusId);
    }
  }, []);
  // 校区重启安排事件
  const dropdownMenu = useCallback((campusId) => {
    return (
      <Menu key={campusId} onClick={() =>reEdit(campusId)}>
        <Menu.Item key="1">
          {formatMessage({id:"app.text.zxbp",defaultMessage:"重新编排"})}
        </Menu.Item>
      </Menu>
    )
  }, []);


  // 渲染校区列表项
  const renderCampusItem = useCallback((campus) => {
    const isActive = campus.campusId === activeCampusId;
    return (
      <div
        id={`campus_list_item_${campus.campusId}`}
        key={campus.campusId}
        className={classnames(styles.campuslistItem, isActive ? styles.active : null)}
        onClick={() => handleCampusClick(campus)}
        title={campus.campusName}
      >
      <div className={styles.campusname}>{type&&campus.finish=="N"?<div className={styles.red}></div>:null}<div>{stringFormat(campus.campusName, 7)}</div></div>
      {!type&&<div className={styles.studentnum}>{`${campus.finishNum}/${campus.studentNum}`}</div>}
      {titleName==formatMessage({id:"app.text.wwc",defaultMessage:"未完成"})&&<div className={styles.studentnum}>{  
      <Dropdown overlay={dropdownMenu(campus.campusId)}>
        <Icon type="ellipsis" />
      </Dropdown>}
  </div>}
      </div>
    )
  }, [activeCampusId,titleName]);

  // 当前活动的校区是否可见，否则滚动至该校区至可见区域
  useEffect(() => {
    const box = document.getElementById(`campus_list_box`);
    const curCampus = document.getElementById(`campus_list_item_${activeCampusId}`);
    if (box && curCampus) {
      const boxHeight = box.offsetHeight;
      const boxBottomPosition = box.offsetTop + boxHeight;
      if ((curCampus.offsetTop - box.scrollTop) < box.offsetTop || (curCampus.offsetTop - box.scrollTop) > boxBottomPosition - 36) {
        curCampus.scrollIntoView({ block: "start", behavior: "smooth" });;
      }
    }
  }, [activeCampusId])

  return (
    <div className={styles.campusListbox}>
      {titleName&&<div className={styles.top}>
        <div className={index==1?styles.select:styles.item} onClick={()=>select(1)}>{formatMessage({id:"app.text.qb",defaultMessage:"全部"})}</div>
        <div className={index==2?styles.select:styles.item} onClick={()=>select(2)}><div className={styles.red}></div><div>{titleName}</div></div>
        <div className={index==3?styles.select:styles.item} onClick={()=>select(3)}>{formatMessage({id:"app.text.ywc",defaultMessage:"已完成"})}</div>
      </div>}
      <div className={styles.selector}>
      <Popover
          placement="bottom"
          content={<NoData tip={formatMessage({ id: "app.exam.inspect.list.no.data.tip", defaultMessage: "暂无搜索结果" })} noneIcon={noneIcon} />}
          visible={tooltipVisible}
          getPopupContainer={() => document.getElementById('campus_list_box')}
        >
        <AutoComplete
          placeholder={formatMessage({ id: "app.placeholder.uexam.examination.inspect.registration.regresult.campusdropdown", defaultMessage: "学校名称快速定位" })}
          dataSource={autoDataSource}
          onSelect={(value, option) => handleSelected(value, option)}
          filterOption={(inputValue, option) =>
            option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
          onBlur={() => setTooltipVisible(false)}
          onSearch={(value) => {
            let visible = false;
            if (value && !autoDataSource.some(v => v.text.toUpperCase().indexOf(value.toUpperCase()) > -1)) {
              visible = true;
            }
             setTooltipVisible(visible);
          }}
        >
          <Input suffix={<Icon type="search" className={styles.input} />} />
        </AutoComplete>
        </Popover>
      </div>
      <div id="campus_list_box" className={styles.campuslist}>
        {campusList && campusList.map(v => renderCampusItem(v))}
      </div>
    </div>
  )
}

export default CampusList;
