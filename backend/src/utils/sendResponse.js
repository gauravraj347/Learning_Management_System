/**
 * Standardised API response helper.
 * Usage: sendResponse(res, 200, "Success", data)
 */
const sendResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: statusCode < 400,
    message,
  };

  if (data !== null) response.data = data;

  return res.status(statusCode).json(response);
};

export default sendResponse;
