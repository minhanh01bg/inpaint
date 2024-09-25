import Title from '../templates/Title';
import ResetButton from '../redux/resetButton'
import useImageUpscaler from '../hooks/useImageUpscaler';
import { useNotification } from '../contexts/NotificationContext';
import { useState } from 'react'
import config from '../configs';
import Base64Image from '../templates/Base64Image';
function Upscaler() {
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const {
    file,
    upscaled,
    handleFileChange,
    handleSubmit,
    clearForm,
    
  } = useImageUpscaler(showErrorNotification, showSuccessNotification);

  return (
    <>
      {/* <ResetButton /> */}
      <Title title='Home' />
      <div className='p-5 max-w-2xl mx-auto'>
        <form onSubmit={handleSubmit}>
          <input
              type="file"
              className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs mr-5" onChange={handleFileChange} />
          
          <button
              type="submit"
              className="btn btn-primary btn-sm">
              Submit
          </button>
          <button  type='button' className='btn border-base-300 bg-base-100 btn-sm mr-3' onClick={clearForm}>Clear</button>
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