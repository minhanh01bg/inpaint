// src/services/apiService.js
import axios from 'axios';
import config from '../configs';
// 
export const postImages = async (formData, showErrorNotification) => {
  const url = `${config.apiUrl}/imgs?permit_key=${config.permit_key}`;
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };
  try {
    const res = await axios.post(url, formData, option);
    return res.data;
  } catch (err) {
    // console.error('Error submitting form:', err);
    if (err.response.data.detail[0].msg !== undefined){
      showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined){
        showErrorNotification(err.response.data.detail)
    } else {
        showErrorNotification(err.message)
    }
  }
};

// 
export const deleteImage = async (id, showErrorNotification, showSuccessNotification) => {
  const url = `${config.apiUrl}/imgs/${id}?permit_key=${config.permit_key}`;
  const option = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  try {
    const res = await axios.delete(url,option);
    showSuccessNotification('Deleted successfully');
    return res.data;
  } catch (err) {
    if (err.response.data.detail[0].msg !== undefined){
      showErrorNotification(err.response.data.detail[0].msg)
    } else if (err.response.data.detail !== undefined){
        showErrorNotification(err.response.data.detail)
    } else {
        showErrorNotification(err.message)
    }
  }
}