import { stringify } from 'qs';
import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

/**
 * GET /resources/info
 * AUTH-400：获取校区的版本功能清单
 */
export async function getPremissionList(params) {
  const urlParams = stringify(params);
  return request(`/api/uaa/resources/info?${urlParams}`);
}

/**
 * GET /tenant-authorize
 * AUTH-418：获取校区授权版本
 * @param {Object} params - 参数
 * @param {String} params.campusId - 校区id
 */
export async function getPremissionVersion(params) {
  const urlParams = stringify(params);
  return request(`/api/uaa/tenant-authorize?${urlParams}`);
}

/**
 * GET /resources/app-info
 * AUTH-399：获取APP对应版本功能清单
 * @param {*} params : {applicationId}
 */
export async function getStandardList(params) {
  const urlParams = stringify(params);
  return request(`/api/uaa/resources/app-info?${urlParams}`);
}
