const formatResponse = (success, message, data = null) => {
  const response = {
    success,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return response;
};

const formatPagination = (currentPage, itemCount) => {
  const page = parseInt(currentPage) || 1;
  return {
    currentPage: page,
    nextPage: page + 1,
    previousPage: page > 1 ? page - 1 : null,
    hasMore: itemCount > 0,
    itemCount
  };
};

module.exports = {
  formatResponse,
  formatPagination
};
