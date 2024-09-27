import { useState, useEffect } from 'react';
import { postImages, removeBackground, checkImageStatus } from '../services/imagesService';
import config from '../configs';
const useImageUpload = (showErrorNotification, showSuccessNotification) => {
  const [formData, setFormData] = useState({
    input:{
      source:"",
      input_type:"",
    }
   })
  const [file, setFile] = useState("");
  const [mask, setMask] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // const handleFileChange = (event) => {
  //   setFormData({ ...formData, file: event.target.files[0] });
  // };
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
  
  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   // Handle form submission
  //   console.log(formData)
  //   const res = await postImages(formData, showErrorNotification);
  //   if (res !== undefined) {
  //     setFile(`data:image/png;base64,${res.image}`);
  //     setMask(`data:image/png;base64,${res.result_base64}`)
  //   }
  // };
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Reset previous results
    setFile(null);
    setMask(null);
    setIsProcessing(true);
    // Log form data (optional)
    console.log(formData);

    // Step 1: Call removeBackground to start the background task
    const res = await removeBackground(formData, showErrorNotification);
    if (res && res.id) {
        const taskId = res.id;

        // Step 2: Poll the status using checkImageStatus
        const pollInterval = 2000; // Poll every 2 seconds
        const intervalId = setInterval(async () => {
            const statusRes = await checkImageStatus(taskId);
            if (statusRes && statusRes.status === 'COMPLETED') {
                console.log(statusRes);
                setFile(`data:image/png;base64,${statusRes.output.image}`);
                setMask(`data:image/png;base64,${statusRes.output.result_base64}`);
                clearInterval(intervalId); 
                setIsProcessing(false);
            } else if (statusRes && statusRes.status !== 'IN_QUEUE' && statusRes.status !== "IN_PROGRESS") {
                clearInterval(intervalId); 
                showErrorNotification("Error in processing the image.");
                setIsProcessing(false);
            }
        }, pollInterval); // Poll every 2 seconds
    } else {
        showErrorNotification("Failed to initiate background task.");
    }
  };

  return {
    file,
    mask,
    formData,
    isProcessing,
    handleFileChange,
    handleSubmit,
    setFormData
  };
}

export default useImageUpload;