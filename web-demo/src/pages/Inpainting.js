import Title from '../templates/Title';
import ResetButton from '../redux/resetButton'
import useImageInpainting from '../hooks/useImageInpainting';
import { useNotification } from '../contexts/NotificationContext';
import { useState } from 'react'
import config from '../configs';
import Inpaint from '../components/Inpaint'
function Inpainting() {
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const {
    file,
    handleFileChange,
  } = useImageInpainting(showErrorNotification, showSuccessNotification);

  return (
    <>
      {/* <ResetButton /> */}
      <Title title='Inpainting' />
      <div className='p-5'>
        <input
          type="file"
          className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs mr-5" onChange={handleFileChange} />
          
        {file && (
            <Inpaint imageUrl={file} />
        )}
      </div>
    </>
  )
}

export default Inpainting;