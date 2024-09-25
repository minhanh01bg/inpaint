import { useState, useEffect } from 'react';
import { postImages, checkImageStatus } from '../services/imageUpscalerService';

const useImageUpscaler = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({ file: null, type: 'front' });
  const [file, setFile] = useState("");
  const [upscaled, setUpscaled] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    setFormData({ ...formData, file: event.target.files[0] });
  };

  const clearForm = () => {
    setFormData({
      file: null,
      type: 'front',
    });
  };

  const checkStatus = async (imageId) => {
    const intervalId = setInterval(async () => {
      try {
        const statusRes = await checkImageStatus(imageId); // Gọi API kiểm tra trạng thái ảnh
        console.log(statusRes)
        if (statusRes.status === 'completed') {
          
          setUpscaled(`data:image/png;base64,${statusRes.result}`);
          showSuccessNotification("Image upscaled successfully!");
          clearInterval(intervalId); // Dừng polling khi đã có kết quả
          setIsProcessing(false);
        }
      } catch (err) {
        // showErrorNotification("Error checking image status");
      }
    }, 5000); // check after 5 second
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    const res = await postImages(formData, showErrorNotification);
    if (res !== undefined) {
      setFile(`data:image/png;base64,${res.image_base64}`);
      console.log(res.image_id);
      showSuccessNotification(res.message);
      checkStatus(res.image_id);
    }
  };

  return {
    file,
    upscaled,
    formData,
    isProcessing,
    handleFileChange,
    handleSubmit,
    clearForm,
    setFormData
  };
};

export default useImageUpscaler;
