import config from "../configs";
import axios from "axios";

export function getToken() {
  return localStorage.getItem("token");
}

export async function checkToken(){
    const url = `${config.apiUrl}/users/me`;
    const token = getToken();
    if (!token) {
        return [false, false];
    }
    const option = {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    try {
        const response = await axios.get(url, option);
        return [true, response.data.is_admin]; // Nếu token hợp lệ
    } catch (error) {
        if (error.response.status === 401) {
            return [false, false]; // Nếu token hết hạn
        }
        return [false, false]; // Nếu có lỗi hoặc token không hợp lệ
    }
    // return false;
}

export function setToken(token){
    localStorage.setItem('token', token);
}

export function removeToken(){
    localStorage.removeItem('token');
}