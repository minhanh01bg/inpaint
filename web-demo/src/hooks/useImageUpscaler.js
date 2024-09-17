import { useState, useEffect } from 'react';
import { postImages, getTaskStatus } from '../services/imageUpscalerService';

const useImageUpscaler = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({ file: null, type: 'front' })
  const [file, setFile] = useState("");
  const [upscaled, setUpscaled] = useState("");
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("")

  const handleFileChange = (event) => {
    setFormData({ ...formData, file: event.target.files[0] });
  };

  const clearForm = () => {
    setFormData({
      file: null,
      type: 'front',
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const res = await postImages(formData, showErrorNotification);
    if (res !== undefined) {
      setTaskId(res.task_id);
      
      // Bắt đầu kiểm tra trạng thái với setInterval
      const interval = setInterval(async () => {
        const taskStatus = await checkTaskStatus(res.task_id);
        
        // Dừng interval nếu task hoàn thành hoặc gặp lỗi
        if (taskStatus === "SUCCESS" || taskStatus === "FAILURE") {
          clearInterval(interval);  // Dừng việc kiểm tra
        }
      }, 5000); // Kiểm tra mỗi 5 giây
    }
  };
  
  const checkTaskStatus = async (taskId) => {
    const res = await getTaskStatus(taskId);
    setStatus(res.status);
    
    if (res.status === "SUCCESS") {
      setFile(res.result.image);
      setUpscaled(res.result.upscaled);
    }
    
    return res.status; // Trả về trạng thái để dừng interval nếu cần
  };
  

  return {
    file,
    upscaled,
    formData,
    handleFileChange,
    handleSubmit,
    clearForm,
    setFormData,
    status
  };
}

export default useImageUpscaler;
