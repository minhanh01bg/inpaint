// src/services/apiService.js
import axios from 'axios';
import config from '../configs';
// 
export const postImages = async (formData, showErrorNotification) => {
  const url = `${config.apiUrl}/imgs`;
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


export const getResult = async (taskId, id) => {
  try {
    
    const response = await axios.get(`${config.apiUrl}/imgs/result/${taskId}/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    // console.error("Error fetching result:", error);
  }
};
// 
export const getImagesFront = async () => {
  const url = `${config.apiUrl}/imgs?classify=front`;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error('Error getting images:', err);
  }
}
// 
export const deleteImage = async (id, showErrorNotification, showSuccessNotification) => {
  const url = `${config.apiUrl}/imgs/${id}`;
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


// AddImgsV2

export const postImagesV2 = async (formData, showErrorNotification) => {
  const url = `${config.apiUrl}/imgs_v2`;
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

export const getResultV2 = async (taskId, id) => {
  try {
    
    const response = await axios.get(`${config.apiUrl}/imgs/result/${taskId}/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    });
    return response.data;
  } catch (error) {
    // console.error("Error fetching result:", error);
  }
};