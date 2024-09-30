import cv2
import glob
import os
import numpy as np
from basicsr.archs.rrdbnet_arch import RRDBNet
from basicsr.utils.download_util import load_file_from_url
from realesrgan import RealESRGANer
from realesrgan.archs.srvgg_arch import SRVGGNetCompact


class RealESRGANUpsampler:
    def __init__(self, model_name='RealESRGAN_x4plus', denoise_strength=0.5, outscale=4, model_path=None,
                 tile=0, tile_pad=10, pre_pad=0, fp32=True, gpu_id=None):
        """
        Initializes the Real-ESRGAN upsampler class and loads the model.
        """
        self.model_name = model_name.split('.')[0]
        self.denoise_strength = denoise_strength
        self.outscale = outscale
        self.model_path = model_path
        self.tile = tile
        self.tile_pad = tile_pad
        self.pre_pad = pre_pad
        self.fp32 = fp32
        self.gpu_id = gpu_id

        # Load the main model (Real-ESRGAN)
        self.upsampler = self.load_model()

        # Placeholder for face enhancer, it will be loaded only when needed
        self.face_enhancer = None

    def load_model(self):
        """
        Loads the Real-ESRGAN model based on the model_name.
        """
        if self.model_name == 'RealESRGAN_x4plus':  # x4 RRDBNet model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            netscale = 4
            file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth']
        elif self.model_name == 'RealESRNet_x4plus':  # x4 RRDBNet model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
            netscale = 4
            file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.1/RealESRNet_x4plus.pth']
        elif self.model_name == 'RealESRGAN_x4plus_anime_6B':  # x4 RRDBNet model with 6 blocks
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4)
            netscale = 4
            file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth']
        elif self.model_name == 'RealESRGAN_x2plus':  # x2 RRDBNet model
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=2)
            netscale = 2
            file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth']
        elif self.model_name == 'realesr-animevideov3':  # x4 VGG-style model (XS size)
            model = SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=16, upscale=4, act_type='prelu')
            netscale = 4
            file_url = ['https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-animevideov3.pth']
        elif self.model_name == 'realesr-general-x4v3':  # x4 VGG-style model (S size)
            model = SRVGGNetCompact(num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=32, upscale=4, act_type='prelu')
            netscale = 4
            file_url = [
                'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-wdn-x4v3.pth',
                'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth'
            ]

        # Determine model paths
        if self.model_path is None:
            self.model_path = os.path.join('weights', self.model_name + '.pth')
            if not os.path.isfile(self.model_path):
                ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
                for url in file_url:
                    self.model_path = load_file_from_url(
                        url=url, model_dir=os.path.join(ROOT_DIR, 'weights'), progress=True, file_name=None)

        # Use dni to control the denoise strength
        dni_weight = None
        if self.model_name == 'realesr-general-x4v3' and self.denoise_strength != 1:
            wdn_model_path = self.model_path.replace('realesr-general-x4v3', 'realesr-general-wdn-x4v3')
            self.model_path = [self.model_path, wdn_model_path]
            dni_weight = [self.denoise_strength, 1 - self.denoise_strength]

        # Load the RealESRGANer
        upsampler = RealESRGANer(
            scale=netscale,
            model_path=self.model_path,
            dni_weight=dni_weight,
            model=model,
            tile=self.tile,
            tile_pad=self.tile_pad,
            pre_pad=self.pre_pad,
            half=not self.fp32,
            gpu_id=self.gpu_id)

        return upsampler

    def load_face_enhancer(self):
        """
        Loads the face enhancement model (GFPGAN) when needed.
        """
        if self.face_enhancer is None:
            from gfpgan import GFPGANer
            self.face_enhancer = GFPGANer(
                model_path='https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.3.pth',
                upscale=self.outscale,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=self.upsampler)

    def enhance_image(self, img: np.ndarray, outscale=None, face_enhance=False) -> np.ndarray:
        """
        Enhances the input image using the loaded model, with an optional custom outscale.

        Args:
            img (np.ndarray): Input image as a NumPy array.
            outscale (float): Custom output scaling factor (optional).
            face_enhance (bool): Whether to use face enhancement (GFPGAN).

        Returns:
            np.ndarray: Enhanced image as a NumPy array.
        """
        if outscale is None:
            outscale = self.outscale  # Use the default outscale if not provided

        try:
            if face_enhance:
                self.load_face_enhancer()  # Load the face enhancer only if needed
                _, _, output = self.face_enhancer.enhance(img, has_aligned=False, only_center_face=False, paste_back=True)
            else:
                output, _ = self.upsampler.enhance(img, outscale=outscale)
            return output
        except RuntimeError as error:
            print('Error:', error)
            print('If you encounter CUDA out of memory, try setting tile to a smaller number.')
            return None


# Example usage of the class:
# if __name__ == '__main__':
#     # Create an instance of the class
#     upsampler = RealESRGANUpsampler(model_name='RealESRGAN_x4plus')

#     # Load an image (as NumPy array)
#     img = cv2.imread('inputs/00017_gray.png', cv2.IMREAD_COLOR)

#     # Enhance the image with custom outscale and face enhancement
#     output_img = upsampler.enhance_image(img, outscale=4, face_enhance=True)

#     # Save the output image
#     if output_img is not None:
#         cv2.imwrite('results/00017_gray1.png', output_img)
