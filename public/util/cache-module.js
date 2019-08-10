window.CACHE_MODULE = {
  getAuthenticatedUserFromCache,
  saveAuthenticatedUserFromCache,
  deleteAutenticatedUserFromCache
};

function getAuthenticatedUserFromCache(){
  const jwtToken = localStorage.getItem('jwtToken');
  const userid = localStorage.getItem('userid');
  const username = localStorage.getItem('username');
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');

  if(jwtToken){
    return {
      jwtToken,
      userid,
      username,
      name,
      email
    };  
  } else {
    return undefined;
  }
};

function saveAuthenticatedUserFromCache(user){
  localStorage.setItem('jwtToken', user.jwtToken);
  localStorage.setItem('userid'. user.id);
  localStorage.setItem('username', iser.username);
  localStorage.setItem('name', user.name);
  localStorage.setItem('email', user.email);
};

function deleteAutenticatedUserFromCache(){
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('userid');
  localStorage.removeItem('username');
  localStorage.removeItem('name');
  localStorage.removeItem('email');
};