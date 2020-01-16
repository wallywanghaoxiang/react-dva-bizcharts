import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox, Pagination } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import SearchBar from '@/components/SearchBar';
import NoData from '@/components/NoData';
import noneTeacherIcon from '@/assets/none_teacher_icon.png';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

/**
 * 安排监考-教师列表
 * @author tina.zhang
 * @date   2019-8-15 10:19:12
 * @param {Array} selectedTeachers - 已选教师列表
 * @param {Array} onItemClick - 教师项点击事件
 */
function InvigilateTeacher(props) {

  const { selectedTeachers, onItemClick, teacherListInfo, loading, dispatch } = props;

  // 分页
  const [pagination, setPagination] = useState({
    filterWord: '',
    pageSize: 16,
    pageIndex: 1
  })

  useEffect(() => {
    dispatch({
      type: 'invigilation/getTeacherList',
      payload: {
        ...pagination,
        campusId: localStorage.campusId
      }
    })
  }, [pagination]);

  // 搜索
  const handleSearch = (value) => {
    setPagination({
      ...pagination,
      pageIndex: 1,
      filterWord: value
    })
  }
  const handleValueChange = (value) => {
    if (!value) {
      setPagination({
        ...pagination,
        pageIndex: 1,
        filterWord: ''
      })
    }
  }

  // 分页
  const onPageChange = (pageIndex) => {
    setPagination({
      ...pagination,
      pageIndex,
    })
  }

  // 点击事件
  const handleTeacherItemClick = (teacher) => {
    if (onItemClick && typeof (onItemClick) === 'function') {
      onItemClick(teacher);
    }
  }

  return (
    <div className={styles.invigilateTeacher}>
      {loading && !teacherListInfo && <NoData tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad={loading} />}
      {!loading
        && !pagination.filterWord
        && (!teacherListInfo || !teacherListInfo.records || teacherListInfo.records.length === 0)
        && <NoData noneIcon={noneTeacherIcon} tip={formatMessage({ id: "app.message.uexam.examination.invigilation.modal.invigilateteacher.noneteacher", defaultMessage: "暂无教师信息，请联系校管理员添加" })} />
      }
      {teacherListInfo && (!!pagination.filterWord || teacherListInfo.records.length > 0) &&
        <div className={styles.search}>
          <SearchBar
            placeholder={formatMessage({ id: "app.campus.manage.class.search.placeholder", defaultMessage: "请输入教师姓名进行搜索" })}
            value={pagination ? pagination.filterWord : ''}
            onChange={(value) => handleValueChange(value)}
            onSearch={(value) => handleSearch(value)}
          />
        </div>
      }
      {teacherListInfo && teacherListInfo.records.length > 0 &&
        <>
          <div className={styles.teacherList}>
            {teacherListInfo.records.map((v, idx) => {
              const selected = selectedTeachers.some(s => s.teacherId === v.teacherId);
              return (
                <div key={`${v.teacherId}`} className={classnames(styles.teacherListItem, selected ? styles.selected : null)} onClick={() => handleTeacherItemClick(v)}>
                  <div className={styles.chk}>
                    <Checkbox checked={selected} />
                  </div>
                  <div className={styles.info}>
                    <div>{stringFormat(v.teacherName, 4)}</div>
                    <div className={styles.tel}>{v.mobile}</div>
                  </div>
                </div>
              )
            })
            }
          </div>
          <div className={styles.pagination}>
            <Pagination
              current={pagination.pageIndex}
              pageSize={pagination.pageSize}
              total={teacherListInfo.total}
              onChange={onPageChange}
            />
          </div>
        </>
      }
      {!loading
        && !!pagination.filterWord
        && (!teacherListInfo || !teacherListInfo.records || teacherListInfo.records.length === 0)
        &&
        <div style={{ marginTop: '-38px' }}>
          <NoData noneIcon={noneTeacherIcon} tip={formatMessage({ id: "app.text.uexam.examination.inspect.registration.import.noneSearch", defaultMessage: "暂无搜索结果" })} />
        </div>
      }
    </div>
  )
}

export default connect(({ invigilation, loading }) => ({
  teacherListInfo: invigilation.teacherListInfo,  // 教师列表及分页信息
  loading: loading.effects['invigilation/getTeacherList']
}))(withRouter(InvigilateTeacher))
