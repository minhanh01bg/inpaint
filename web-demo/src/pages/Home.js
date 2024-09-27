import Title from '../templates/Title';
import ResetButton from '../redux/resetButton'
import useImageUpload from '../hooks/useImageUpload';
import { useNotification } from '../contexts/NotificationContext';
import Base64Image from '../templates/Base64Image';
function Home() {
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const {
    file,
    mask,
    isProcessing,
    handleFileChange,
    handleSubmit,
    setFormData
  } = useImageUpload(showErrorNotification, showSuccessNotification);

  return (
    <>
      {/* <ResetButton /> */}
      <Title title='Home' />
      <div className='p-5 max-w-xl mx-auto'>
        <form onSubmit={handleSubmit}>
          <input
              type="file"
              className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs mr-5" onChange={handleFileChange} />
          <button
            type="submit"
            className={`btn btn-primary btn-sm ${isProcessing ? 'loading loading-spinner' : ''}`} // Thêm class 'loading' khi đang xử lý
            disabled={isProcessing ? "disable":""} // Vô hiệu hóa nút khi đang gửi
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
        </form>
        {file && (
          <div className="diff aspect-[16/10] mt-5 border-2 rounded-box max-w-xl">
            <div className="diff-item-1">
                <Base64Image base64String={mask}/>
            </div>
            <div className="diff-item-2">
                <Base64Image base64String={file}/>
            </div>
            <div className="diff-resizer"></div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home;