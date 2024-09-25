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
  
  const [formData, setFormData] = useState({
    input: {
      img_path: '',
      box: [],
      point: [],
      mask: [],
      sliderValue: 0,
    },
  });
  const [images, setImages] = useState(null);
  
  const [sliderValue, setSliderValue] = useState(40);

  // Function to handle the slider value change
  const handleSliderChange = (event) => {
    setSliderValue(event.target.value); // Update the state with new value
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl +'?permit_key='+config.permit_key;
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
    
    let updatedFormData = {
      input: {
        ...formData.input,
        img_path: imageUrl,
      },
    };

    if (inpaintMode === "remove"){
      if (drawingMode === 'box'){
        const adjustedRectangles = rectangles.map(rect => ({
          x: rect.x / scaleX,
          y: rect.y / scaleY,
          width: rect.width / scaleX,
          height: rect.height / scaleY
        }));
        updatedFormData = {
          input: {
            ...updatedFormData.input,
            box: adjustedRectangles,
            sliderValue: sliderValue,
          },
        };
        console.log(updatedFormData)
        const res = await inPaintImage(updatedFormData, showErrorNotification, showSuccessNotification)
        console.log(res)
        if (res !== undefined){
          setImages(res.img_base64s)
        }
      } else if (drawingMode === 'point'){
        const adjustedPoints = points.map(point => ({
          x: point.x / scaleX,
          y: point.y / scaleY
        }));
        updatedFormData = {
          input: {
            ...updatedFormData.input,
            point: adjustedPoints,
            sliderValue: sliderValue,
          },
        };
        console.log(updatedFormData)
        const res = await inPaintImage(updatedFormData, showErrorNotification, showSuccessNotification)
        console.log(res)
        if (res !== undefined){
          setImages(res.img_base64s)
        }
      } else if (drawingMode === 'mask'){

        const adjustedMasks = masks.map(mask => ({
          points: mask.map(point => ({
            x: point.x / scaleX,
            y: point.y / scaleY
          }))
        }));
        
        const adjustedSliderValue = sliderValue / ((scaleX + scaleY) / 2);
        updatedFormData = {
          input: {
            ...updatedFormData.input,
            mask: adjustedMasks,
            sliderValue: adjustedSliderValue,
          },
        };
        console.log(updatedFormData)
        const res = await inPaintImage(updatedFormData, showErrorNotification, showSuccessNotification)
        console.log(res)
        if(res !== undefined){
          setImages(res.img_base64s)
        }
      }
    }
  }

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
                  strokeWidth={sliderValue}
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
                <label className="cursor-pointer label w-48">
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
                <label className="cursor-pointer label w-48">
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
                <label className="cursor-pointer label w-48">
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
              <div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  className="range"
                  onChange={handleSliderChange} // Add onChange event handler
                />
                <p className="text-sm">Slider Value: {sliderValue}</p> {/* Display the current value */}
              </div>
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="">
              <div className="font-bold">Inpainting</div>
              <div className="form-control mt-2">
                <label className="cursor-pointer label w-48">
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
            </div>
          </div>
          <button type="submit" className="mt-5 btn btn-primary btn-sm">Submit</button>
        </form>
        
      </div>
      {
        images && 
        <ImageGallery images={images} />
      }
    </>
    
  );
};

export default Inpaint;
