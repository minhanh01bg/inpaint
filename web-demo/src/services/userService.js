import axios from 'axios';
import config from '../configs';

export const getUser = async () => {
    const url = `${config.apiUrl}/users?permit_key=${config.permit_key}`;
    const option = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    };
    try {
        const res = await axios.get(url, option);
        return res.data;
    } catch (err) {
        console.error('Error getting users:', err);
    }
}

export const createUser = async (formData, showErrorNotification, showSuccessNotification) => {
    console.log('form data', formData)
    const url = `${config.apiUrl}/create_user?permit_key=${config.permit_key}`;
    const option = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': `multipart/form-data`,
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    };
    try {
        const res = await axios.post(url, formData, option);
        showSuccessNotification('create user successfully')
        return res.data;
    } catch (err){
        console.error('Error getting users: ', err);
        if (err.response.data.detail[0].msg !== undefined){
            showErrorNotification(err.response.data.detail[0].msg)
        } else if (err.response.data.detail !== undefined){
            showErrorNotification(err.response.data.detail)
        } else {
            showErrorNotification(err.message)
        }
    }
}


export const deteleUser = async (id, showErrorNotification, showSuccessNotification) =>{
    const url = `${config.apiUrl}/users/${id}`;
    const option = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
    };
    try {
        const res = await axios.delete(url,option);
        showSuccessNotification('delete successfully');
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