import Title from '../templates/Title';
import useImageInpainting from '../hooks/useImageInpainting';
import { useNotification } from '../contexts/NotificationContext';
import Inpaint_v2 from '../components/Inpaint_v2'
function Inpainting_v2() {
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
            <Inpaint_v2 imageUrl={file} />
        )}
      </div>
    </>
  )
}

export default Inpainting_v2;