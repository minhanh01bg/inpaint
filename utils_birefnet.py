import logging
import os
import torch
from torchvision import transforms
import numpy as np
import random
import cv2
from PIL import Image
import string 
import base64
from io import BytesIO
import requests

def path_to_image(path, size=(1024, 1024), color_type=['rgb', 'gray'][0]):
    if color_type.lower() == 'rgb':
        image = cv2.imread(path)
    elif color_type.lower() == 'gray':
        image = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    else:
        print('Select the color_type to return, either to RGB or gray image.')
        return
    if size:
        image = cv2.resize(image, size, interpolation=cv2.INTER_LINEAR)
    if color_type.lower() == 'rgb':
        image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB)).convert('RGB')
    else:
        image = Image.fromarray(image).convert('L')
    return image



def check_state_dict(state_dict, unwanted_prefix='_orig_mod.'):
    for k, v in list(state_dict.items()):
        if k.startswith(unwanted_prefix):
            state_dict[k[len(unwanted_prefix):]] = state_dict.pop(k)
    return state_dict


def generate_smoothed_gt(gts):
    epsilon = 0.001
    new_gts = (1-epsilon)*gts+epsilon/2
    return new_gts


class Logger():
    def __init__(self, path="log.txt"):
        self.logger = logging.getLogger('BiRefNet')
        self.file_handler = logging.FileHandler(path, "w")
        self.stdout_handler = logging.StreamHandler()
        self.stdout_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
        self.file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
        self.logger.addHandler(self.file_handler)
        self.logger.addHandler(self.stdout_handler)
        self.logger.setLevel(logging.INFO)
        self.logger.propagate = False
    
    def info(self, txt):
        self.logger.info(txt)
    
    def close(self):
        self.file_handler.close()
        self.stdout_handler.close()


class AverageMeter(object):
    """Computes and stores the average and current value"""
    def __init__(self):
        self.reset()

    def reset(self):
        self.val = 0.0
        self.avg = 0.0
        self.sum = 0.0
        self.count = 0.0

    def update(self, val, n=1):
        self.val = val
        self.sum += val * n
        self.count += n
        self.avg = self.sum / self.count


def save_checkpoint(state, path, filename="latest.pth"):
    torch.save(state, os.path.join(path, filename))


def save_tensor_img(tenor_im, path):
    im = tenor_im.cpu().clone()
    im = im.squeeze(0)
    tensor2pil = transforms.ToPILImage()
    im = tensor2pil(im)
    im.save(path)


def set_seed(seed):
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    np.random.seed(seed)
    random.seed(seed)
    torch.backends.cudnn.deterministic = True

def remove_file(save_path):
    if os.path.exists(save_path):
        os.remove(save_path)

def random_string(length):
    letters = string.ascii_lowercase + string.ascii_uppercase + string.digits
    return ''.join(random.choice(letters) for i in range(length))

# numpy image to base64
def numpy_to_base64(numpy_img, format='PNG'):
    pil_img = Image.fromarray(numpy_img)
    return pil_to_base64(pil_img, format)

# PIL image to base64
def pil_to_base64(pil_img, format='PNG'):
    buffered = BytesIO()
    pil_img.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return img_str

def prepare_image_input(job):
    """
    Prepares image data for processing from various input types.

    Args:
        job:
        - source (str): The image source (can be a URL, file path, or base64 string).
        - input_type (str): The type of input provided (options: 'url', 'file', 'base64').

    Returns:
    - dict: A job dictionary with the image encoded in base64.
    """
    source = job.get('source')
    input_type = job.get('input_type')
    image_data = None

    if input_type == 'url':
        # Load image from a URL
        response = requests.get(source)
        image_data = response.content
    
    elif input_type == 'file':
        # Load image from a local file path
        with open(source, 'rb') as image_file:
            image_data = image_file.read()
    
    elif input_type == 'base64':
        # The source is already a base64 string
        image_data = base64.b64decode(source)
        
    elif input_type == 'upload':

        image_data = source.read()
    # Convert the image data to base64 (for uniformity in job input)
    # image_base64 = base64.b64encode(image_data).decode('utf-8')
    return image_data

def file_to_base64(file):
    file_content = file.file.read()
    return base64.b64encode(file_content).decode('utf-8')