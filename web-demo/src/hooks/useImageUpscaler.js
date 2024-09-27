import { useState, useEffect } from 'react';
import { postImages, checkImageStatus } from '../services/imageUpscalerService';

const useImageUpscaler = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({
    input:{
      source:"",
      input_type:"",
    }
  })
  const [file, setFile] = useState("");
  const [upscaled, setUpscaled] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onloadend = () => {
      // Cập nhật formData với Base64 của file
      const base64String = reader.result.replace(/^data:image\/\w+;base64,/, '');
      setFormData({ 
        ...formData, 
        input: {
          source: base64String,
          input_type: 'base64'
        }
      });
    };
  
    if (file) {
      reader.readAsDataURL(file);
    }
  };


  const checkStatus = async (Id) => {
    const intervalId = setInterval(async () => {
      try {
        const statusRes = await checkImageStatus(Id); // Gọi API kiểm tra trạng thái ảnh
        console.log(statusRes)
        if (statusRes.status === 'COMPLETED') {
          
          setUpscaled(`data:image/png;base64,${statusRes.output.result_base64}`);
          setFile(`data:image/png;base64,${statusRes.output.image}`);
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
    console.log(formData)
    const res = await postImages(formData, showErrorNotification);
    if (res !== undefined) {
      console.log(res.id);
      showSuccessNotification(res.message);
      checkStatus(res.id);
    }
  };

  return {
    file,
    upscaled,
    formData,
    isProcessing,
    handleFileChange,
    handleSubmit,
  };
};

export default useImageUpscaler;
