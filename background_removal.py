# Use codes locally
from models.birefnet import BiRefNet
from PIL import Image
import matplotlib.pyplot as plt
import torch
from torchvision import transforms

# Load weights from Hugging Face Models
birefnet = BiRefNet.from_pretrained('ZhengPeng7/BiRefNet')

torch.set_float32_matmul_precision(['high', 'highest'][0])
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
birefnet.to(device)
birefnet.eval()

def extract_object(birefnet, imagepath):
    # Data settings
    image_size = (1024, 1024)
    transform_image = transforms.Compose([
        transforms.Resize(image_size),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    image = Image.open(imagepath).convert("RGB")

    input_images = transform_image(image).unsqueeze(0).to(device)

    # Prediction
    with torch.no_grad():
        preds = birefnet(input_images)[-1].sigmoid().cpu()
    pred = preds[0].squeeze()
    pred_pil = transforms.ToPILImage()(pred)
    mask = pred_pil.resize(image.size)
    image.putalpha(mask)
    return image, mask
