// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? localStorage.getItem('antd-pro-authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['admin'];
}
export function setNewAuthority(authority) {
  return localStorage.setItem('vb-pro-authority', authority);  
}
export function setAuthority(authority,token,userID,mobile) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  localStorage.setItem('access_token', token);
  localStorage.setItem('uid', userID);
  localStorage.setItem('mobile', mobile);
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}
