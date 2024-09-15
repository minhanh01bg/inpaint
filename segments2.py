from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from ultralytics import YOLO
import cv2
import random 
import torch 
from PIL import Image
import numpy as np
from utils import  dilate_mask
import matplotlib.pyplot as plt
from utils_birefnet import random_string
from ultralytics import SAM
from pathlib import Path
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point

class SegmentAnything:
    def __init__(self, yolov8_model_path, sam2_checkpoint):
        # Load YOLO model
        self.model = YOLO(yolov8_model_path)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Load SAM2 model
        # self.sam2_model = SAM("sam2_l.pt")
        self.sam2_model = SAM(sam2_checkpoint)

    def put_image(self, img):
        self.cv_image = img
        self.pil_image = Image.fromarray(img)

    def load_image(self, img_path):
        """Loads an image from the given path."""
        
        self.cv_image = cv2.imread(img_path)
        
        self.pil_image = Image.open(img_path)  # To use with PIL functions

    def get_mask(self):
        """Generates the mask using YOLO and SAM2."""
        results = self.model.predict(self.cv_image, verbose=False)
        input_boxes = results[0].boxes.xyxy.cpu().numpy()

        results = self.sam2_model.predict(self.cv_image,bboxes=input_boxes)
        # print(results[0])
        masks = results[0].masks.data.cpu().numpy()
        return masks
    

    def xywh2xyxy(self, boxs):
        """Convert x1, y1, w, h to x1, y1, x2, y2"""
        box_n = []

        # Convert Box to np[] (x, y, w, h)
        for box in boxs:
            x, y, w, h = box.x, box.y, box.width, box.height
            box_n.append([x, y, w, h])

        # Convert to numpy array for vectorized operations
        box_n = np.array(box_n)

        if box_n.size == 0:  # Check if box_n is empty
            return np.array([])

        # Calculate x1, y1, x2, y2
        ret = np.zeros_like(box_n)
        ret[:, 0] = box_n[:, 0]  # x1 remains the same
        ret[:, 1] = box_n[:, 1]  # y1 remains the same
        ret[:, 2] = box_n[:, 0] + (box_n[:, 2])  # x2 = x1 + w
        ret[:, 3] = box_n[:, 1] + (box_n[:, 3])  # y2 = y1 + h

        return ret

    def point2np(self, points):
        ret = []
        for p  in points:
            ret.append([p.x,p.y])
        return np.array(ret)

    def get_labels(self, points):
        s = len(points)
        return [1 for i in range(s)]
    
    def get_mask2action(self, box=None, points=None, dilate_kernel_size=None):
        """Generates the mask using YOLO and SAM2."""
        boxs = self.xywh2xyxy(box) if box is not None else None         
        points = self.point2np(points) if points is not None else None
        labels = self.get_labels(points=points) if points is not None else None
        
        results = self.sam2_model.predict(self.cv_image,bboxes=boxs)
        masks = results[0]
        masks = masks.data.cpu().numpy()
        print(mask.ndim)
        return masks
    
    def remove_background(self, masks):
        """Applies the mask to remove the background using PIL's putalpha."""
        for mask in masks:
            # Convert mask to binary (0 or 255)
            mask_image = Image.fromarray((mask * 255).astype(np.uint8))
            mask_image = mask_image.resize(self.pil_image.size)
            
            # Ensure the image has an alpha channel
            self.pil_image.putalpha(mask_image)

    def to_cv2(self):
        """Converts the PIL image with alpha to OpenCV format."""
        # To visualize transparent background, use the bg_color
        cv_image = cv2.cvtColor(np.array(self.pil_image), cv2.COLOR_RGBA2BGRA)
        bg_color = (255, 255, 255)  # White background (can be changed)
        h, w, _ = cv_image.shape
        background = np.full((h, w, 3), bg_color, dtype=np.uint8)  # Background with chosen color

        # Split the image into its BGRA channels
        b, g, r, a = cv2.split(cv_image)

        # Create an inverse alpha mask (for the transparent areas)
        alpha_inv = cv2.bitwise_not(a)

        # Add the background where the alpha is zero (transparent)
        foreground = cv2.merge([b, g, r])
        bg = cv2.bitwise_and(background, background, mask=alpha_inv)
        fg = cv2.bitwise_and(foreground, foreground, mask=a)

        # Combine the foreground with the background
        return cv2.add(bg, fg)

    def convert_img2array(self):
        img = self.pil_image
        if img.mode == "RGBA":
            img = img.convert("RGB")
        return np.array(img)
        
    def show_matplotlib(self):
        """Displays the image using matplotlib (handles alpha transparency)."""
        plt.axis("off")
        plt.imshow(self.pil_image)
        plt.show()
    
    def show_opencv(self, window_name='Image with Alpha Channel'):
        """Displays the image using OpenCV."""
        cv_image = self.to_cv2()
        cv2.imshow(window_name, cv_image)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    def save_opencv(self, save_path):
        """Saves the image in OpenCV format with alpha transparency."""
        cv_image = self.to_cv2()
        cv2.imwrite(save_path, cv_image)

    def plot_box(self, folder, boxs=None, points=None):
        cv_image = self.cv_image
        if boxs is not None:
            boxs = self.xywh2xyxy(boxs)
            for box in boxs:
                x1, y1, x2, y2 = box[0], box[1], box[2], box[3]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                box_color = (0, 255, 0)  # Green box
                thickness = 2  # Thickness of the box
                # Draw the rectangle (box) on the image
                cv2.rectangle(cv_image, (x1,y1), (x2,y2), box_color, thickness)

        if points is not None:
            for p in points:
                x,y = int(p.x), int(p.y)
                point_color = (0, 255, 0)  # Green color
                radius = 3  # Radius for the point, can be small like 1-3 for a point effect
                thickness = -1  # Thickness -1 will fill the circle
                cv2.circle(cv_image,(x,y),radius, point_color,thickness)
            
        cv2.imwrite(f"{folder}/cv_box.png", cv_image)

yolov8_model_path = './weights/yolov8n.pt'
sam2_checkpoint = './sam2/checkpoints/sam2_l.pt'
sam2_model_config = 'sam2_hiera_l.yaml'
lama_ckpt = "./pretrained_models/big-lama"
lama_config = "./lama/configs/prediction/default.yaml"

seg = SegmentAnything(yolov8_model_path=yolov8_model_path,sam2_checkpoint=sam2_checkpoint)
img_path = "./example/remove-anything/dog.jpg"
seg.load_image(img_path=img_path)
masks = seg.get_mask()
img_stem = Path(img_path).stem
out_dir = Path("./results") / img_stem
out_dir.mkdir(parents=True, exist_ok=True)
# print(out_dir)
img = seg.convert_img2array()

for idx, mask in enumerate(masks):
    mask_p = out_dir / f"mask_{idx}.png"
    img_points_p = out_dir / f"with_points.png"
    img_mask_p = out_dir / f"with_{Path(mask_p).name}"

    save_array_to_img(mask, mask_p)
    dpi = plt.rcParams['figure.dpi']
    
    height, width = img.shape[:2]

    plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
    plt.imshow(img)
    plt.axis('off')
    plt.savefig(img_points_p, bbox_inches='tight', pad_inches=0)
    show_mask(plt.gca(), mask, random_color=False)
    plt.savefig(img_mask_p, bbox_inches='tight', pad_inches=0)
    plt.close()