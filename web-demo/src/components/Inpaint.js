import React, { useState, useEffect } from "react";
import { Stage, Layer, Image, Rect, Circle, Line } from "react-konva";
import { inPaintImage } from '../services/inpaintService'
import { useNotification } from '../contexts/NotificationContext';
import config from "../configs";
import ImageGallery from "../templates/ImageGallery";
const Inpaint = ({ imageUrl }) => {
  const [rectangles, setRectangles] = useState([]);
  const [shape, setShape] = useState([]);
  const [points, setPoints] = useState([]);
  const [masks, setMasks] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 600, height: 400 });
  const [drawingMode, setDrawingMode] = useState("box"); // New state for drawing mode
  const [history, setHistory] = useState([]);
  const [inpaintMode, setInpaintMode] = useState("remove");
  
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState(null);
  

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      setShape([originalWidth,originalHeight])
      const aspectRatio = originalWidth / originalHeight;

      let newWidth = 600;
      let newHeight = 400;

      if (originalWidth > originalHeight) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }

      setImageDimensions({ width: newWidth, height: newHeight });
      setImage(img);
    };
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const { x, y } = e.target.getStage().getPointerPosition();
    
    if (drawingMode === "box") {
      setRectangles([...rectangles, { x, y, width: 0, height: 0 }]);
      setHistory([...history, { type: "rectangles", action: [...rectangles] }]); // Save history for undo
    } else if (drawingMode === "point") {
      setPoints([...points, { x, y }]);
      setHistory([...history, { type: "points", action: [...points] }]); // Save history for undo
    } else if (drawingMode === "mask") {
      setMasks([...masks, [{ x, y }]]);
      setHistory([...history, { type: "masks", action: [...masks] }]); // Save history for undo
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = e.target.getStage().getPointerPosition();

    if (drawingMode === "box") {
      const lastRect = rectangles[rectangles.length - 1];
      lastRect.width = x - lastRect.x;
      lastRect.height = y - lastRect.y;
      rectangles.splice(rectangles.length - 1, 1, lastRect);
      setRectangles([...rectangles]);
    } else if (drawingMode === "mask") {
      const lastLine = masks[masks.length - 1];
      lastLine.push({ x, y });
      masks.splice(masks.length - 1, 1, lastLine);
      setMasks([...masks]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };
  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];

    if (lastAction.type === "rectangles") {
      setRectangles(lastAction.action); // Restore the previous rectangles state
    } else if (lastAction.type === "points") {
      setPoints(lastAction.action); // Restore the previous points state
    } else if (lastAction.type === "masks") {
      setMasks(lastAction.action); // Restore the previous masks state
    }

    setHistory(history.slice(0, history.length - 1)); // Remove the last action from history
  };


  const { showErrorNotification, showSuccessNotification } = useNotification();
  const handleSubmit = async (event) =>{
    event.preventDefault();
    setImages(null)
    const scaleX = imageDimensions.width / shape[0];
    const scaleY = imageDimensions.height / shape[1];
    if (inpaintMode === "remove"){
      // console.log(rectangles)
      // console.log(points)
      // console.log(masks)
      if (drawingMode === 'box'){
        formData['img_path'] = imageUrl;
        
        const adjustedRectangles = rectangles.map(rect => ({
          x: rect.x / scaleX,
          y: rect.y / scaleY,
          width: rect.width / scaleX,
          height: rect.height / scaleY
        }));
        formData['box'] = adjustedRectangles;
        console.log(formData)
        const res = await inPaintImage(formData, showErrorNotification, showSuccessNotification)
        console.log(res)
        if (res !== undefined){
          const folder = res.res;
          const length = res.length;
          const images = Array.from({ length }, (_, index) => `${config.apiMedia}/${folder}/inpainted_mask_${index}.png`);
          console.log(images);
          setImages(images)
        }
      } else if (drawingMode === 'point'){
        // Adjust the point coordinates
        formData['img_path'] = imageUrl;
        const adjustedPoints = points.map(point => ({
          x: point.x / scaleX,
          y: point.y / scaleY
        }));
        formData['point'] = adjustedPoints;
        console.log(formData)
        const res = await inPaintImage(formData, showErrorNotification, showSuccessNotification)
        console.log(res)
        if (res !== undefined){
          const folder = res.res;
          const length = res.length;
          const images = Array.from({ length }, (_, index) => `${config.apiMedia}/${folder}/inpainted_mask_${index}.png`);
          console.log(images);
          setImages(images)
        }
      } else if (drawingMode === 'mask'){
        const adjustedMasks = masks.map(mask => ({
          points: mask.points.map(point => ({
            x: point.x / scaleX,
            y: point.y / scaleY
          }))
        }));
        formData['mask'] = adjustedMasks;
        console.log(formData)
        const res = inPaintImage(formData, showErrorNotification, showSuccessNotification)
        console.log(res)
      }
      
    } else if (inpaintMode === "fill"){

    } else if (inpaintMode === "replace"){

    }
  }
  useEffect(() =>{

  },[images])
  return (
    <>
      <div className="mt-5 flex w-full flex-col lg:flex-row">
        <div className="relative flex flex-col items-center justify-center h-full border border-gray-300 max-w-2xl p-10 my-5">
          <Stage
            width={imageDimensions.width}
            height={imageDimensions.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <Layer>
              <Image image={image} width={imageDimensions.width} height={imageDimensions.height} />
              
              {rectangles.map((rect, i) => (
                <Rect
                  key={i}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  stroke="red"
                  strokeWidth={2}
                  fill="transparent"
                />
              ))}

              {points.map((point, i) => (
                <Circle key={i} x={point.x} y={point.y} radius={5} fill="blue" />
              ))}

              {masks.map((mask, i) => (
                <Line
                  key={i}
                  points={mask.flatMap((p) => [p.x, p.y])}
                  stroke="green"
                  strokeWidth={20}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </Layer>
          </Stage>
          <button className="absolute bottom-0 btn btn-primary btn-sm" onClick={handleUndo}>
            Undo
          </button>
        </div>
        <div className="divider divider-horizontal"></div>
        <form className="" onSubmit={handleSubmit}>
          <div className="flex">
            <div className="">
              <div className="font-bold">Select actions</div>
              <div className="form-control mt-2">
                <label className="cursor-pointer label w-32">
                  <span className="label-text">Draw Box</span>
                  <input type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={drawingMode === "box"}
                    onChange={() => {
                      setDrawingMode("box")
                      setFormData({})
                    }}
                  />
                </label>
              </div>   
              <div className="form-control mt-2">
                <label className="cursor-pointer label w-32">
                  <span className="label-text">Draw Point</span>
                  <input type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={drawingMode === "point"}
                    onChange={() => {
                      setDrawingMode("point")
                      setFormData({})
                    }}
                  />
                </label>
              </div>
              <div className="form-control mt-2">
                <label className="cursor-pointer label w-32">
                  <span className="label-text">Draw Mask</span>
                  <input type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={drawingMode === "mask"}
                    onChange={() => {
                      setDrawingMode("mask")
                      setFormData({})
                    }}
                  />
                </label>
              </div>  
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="">
              <div className="font-bold">Inpainting</div>
              <div className="form-control mt-2">
                <label className="cursor-pointer label">
                  <span className="label-text">Remove object</span>
                  <input type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={inpaintMode === "remove"}
                    onChange={() => {
                        setInpaintMode("remove")
                      }
                    }
                  />
                </label>
              </div>   
              <div className="form-control mt-2">
                <label className="cursor-pointer label">
                  <span className="label-text">Fill Object</span>
                  <input type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={inpaintMode === "fill"}
                    onChange={() => setInpaintMode("fill")}
                  />
                </label>
                <input type="text" placeholder="Type here" className="input input-bordered input-sm w-full max-w-sm" />
              </div>
              <div className="form-control mt-2">
                <label className="cursor-pointer label">
                  <span className="label-text">Replace Object</span>
                  <input type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={inpaintMode === "replace"}
                    onChange={() => setInpaintMode("replace")}
                  />
                </label>
                <input type="text" placeholder="Type here" className="input input-bordered input-sm w-full max-w-sm" />
              </div>  
            </div>
          </div>
          <button type="submit" className="mt-5 btn btn-primary btn-sm">Submit</button>
        </form>
        
      </div>
      <ImageGallery images={images} />
    </>
    
  );
};

export default Inpaint;
