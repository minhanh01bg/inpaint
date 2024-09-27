import Title from '../templates/Title';
import ResetButton from '../redux/resetButton'
import useImageUpscaler from '../hooks/useImageUpscaler';
import { useNotification } from '../contexts/NotificationContext';
import Base64Image from '../templates/Base64Image';
import { useState } from 'react';
function Upscaler() {
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const {
    file,
    upscaled,
    isProcessing,
    mode,
    setMode,
    formData,
    setFormData,
    handleFileChange:handleFileChangeHook,
    handleSubmit,
    clearForm,
    
  } = useImageUpscaler(showErrorNotification, showSuccessNotification);


  const [errorMessage, setErrorMessage] = useState(''); // Trạng thái để lưu thông báo lỗi

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const img = new Image();
      img.onload = () => {
        // Kiểm tra kích thước ảnh
        if (img.width > 1000 || img.height > 1000) {
          setErrorMessage('Image size must be less than 1000px on either side');
        } else {
          setErrorMessage(''); // Xóa thông báo lỗi nếu kích thước hợp lệ
          handleFileChangeHook(e); // Gọi hàm từ hook sau khi kiểm tra
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  return (
    <>
      {/* <ResetButton /> */}
      <Title title='Home' />
      <div className='p-5 max-w-2xl mx-auto'>
        <form onSubmit={handleSubmit}>
        <span className="text-red-500">{errorMessage && errorMessage}</span> {/* Hiển thị thông báo lỗi */}
          <div className="form-control">
            <label className="label-text">Choose image upscaling factor:</label>
            <label className="label cursor-pointer w-48">
              <span className="label-text">x2</span>
              <input type="checkbox" className="checkbox checkbox-primary" 
                checked={mode==="x2"} 
                onChange={()=>{
                  setMode("x2")
                  setFormData({ 
                    ...formData, 
                    input: {
                      ...formData.input,
                      mode: "x2",
                    }
                  });
                }}
              />
            </label>

            <label className="label cursor-pointer w-48">
              <span className="label-text">x4</span>
              <input type="checkbox" className="checkbox checkbox-primary" 
              checked={mode==="x4"} 
                onChange={()=>{
                  setMode("x4")
                  setFormData({ 
                    ...formData, 
                    input: {
                      ...formData.input,
                      mode: "x4",
                    }
                  });
                }} 
              />
            </label>
          </div>
          <input
              type="file"
              className="mt-3 file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs mr-5" onChange={handleFileChange} />

          <button
            type="submit"
            className={`mt-3 btn btn-primary btn-sm ${isProcessing ? 'loading loading-spinner' : ''}`} // Thêm class 'loading' khi đang xử lý
            disabled={isProcessing ? "disable":""} // Vô hiệu hóa nút khi đang gửi
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
        </form>
        {file && (
          <div className="diff aspect-[15/10] mt-5 border-2 rounded-box max-w-2xl">
            <div className="diff-item-1">
                <Base64Image base64String={upscaled} />
            </div>
            <div className="diff-item-2">
                <Base64Image base64String={file} />
            </div>
            <div className="diff-resizer"></div>
          </div>
        )}
      </div>
    </>
  )
}

export default Upscaler;