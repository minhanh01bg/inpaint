import React, { useState, useEffect } from "react";
import { Stage, Layer, Image, Rect, Circle, Line } from "react-konva";
import { inPaintImage } from '../services/inpaintService'
import { useNotification } from '../contexts/NotificationContext';
import config from "../configs";
import ImageGallery from "../templates/ImageGallery";
import { checkImageInpaintStatus, inPaintImage2, segmentImage, removeObject } from '../services/inpaintService'
import useInpaintAction from "../hooks/useInpaintAction";
const Inpaint_v2 = ({ imageUrl }) => {
  const [rectangles, setRectangles] = useState([]);
  const [shape, setShape] = useState([]);
  const [points, setPoints] = useState([]);
  const [masks, setMasks] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 600, height: 400 });
  const [drawingMode, setDrawingMode] = useState("box"); // New state for drawing mode
  const [history, setHistory] = useState([]);
  // const [inpaintMode, setInpaintMode] = useState("remove");
  const [isProcessing, setIsProcessing] = useState(false);
  const { showErrorNotification, showSuccessNotification } = useNotification();

  const {
    labels,
    labelLs,
    maskAction,
    setMaskAction,
    setLabels,
    setLabelsList,
    onClickActionTrue,
    onClickActionFalse
  } = useInpaintAction(showErrorNotification,showSuccessNotification);

  const [formData, setFormData] = useState({
    input: {
      source: '',
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
    const base64Image = imageUrl.startsWith('data:image/')
      ? imageUrl
      : `data:image/jpeg;base64,${imageUrl}`;
    img.src = base64Image;
    img.onload = () => {
      const originalWidth = img.width;
      const originalHeight = img.height;
      setShape([originalWidth, originalHeight])
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
      if (labels == true){
        setLabelsList([...labelLs, 1]);
      } else{
        setLabelsList([...labelLs, 0]);
      }
      setHistory([...history, { type: "points", action: [...points], labels:[...labelLs] }]); // Save history for undo
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
      setLabelsList(lastAction.labels);
    } else if (lastAction.type === "masks") {
      setMasks(lastAction.action); // Restore the previous masks state
    }
    setHistory(history.slice(0, history.length - 1)); // Remove the last action from history
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setImages(null)
    setIsProcessing(true);
    const scaleX = imageDimensions.width / shape[0];
    const scaleY = imageDimensions.height / shape[1];

    let updatedFormData = {
      input: {
        ...formData.input,
        source: imageUrl,
      },
    };

      if (drawingMode === 'box') {
        const adjustedRectangles = rectangles.map(rect => ({
          x: rect.x / scaleX,
          y: rect.y / scaleY,
          width: rect.width / scaleX,
          height: rect.height / scaleY
        }));
        updatedFormData = {
          input: {
            box: adjustedRectangles,          
            source: imageUrl,
          },
        };
        setIsProcessing(false);
        console.log(updatedFormData)
        const test = await segmentImage(updatedFormData, showErrorNotification, showSuccessNotification);
        if(test) {
          setImages(test.output.result_base64)
        }
      } else if (drawingMode === 'point') {
        const adjustedPoints = points.map(point => ({
          x: point.x / scaleX,
          y: point.y / scaleY
        }));
        
        updatedFormData = {
          input: {
            pals:{
              points: adjustedPoints,
              labels: labelLs
            },
            source: imageUrl,
          },
        };
        setIsProcessing(false);
        const test = await segmentImage(updatedFormData, showErrorNotification, showSuccessNotification);
        if(test) {
          setImages(test.output.result_base64);
          setMaskAction(test.output.mask_base64);
        }
      } 
  }

  const handleRemoveBackground = async() =>{
    const scaleX = imageDimensions.width / shape[0];
    const scaleY = imageDimensions.height / shape[1];
    let updatedFormData = {
      input: {
        ...formData.input,
        source: imageUrl,
      },
    };
    if (drawingMode === 'mask') {

      const adjustedMasks = masks.map(mask => ({
        points: mask.map(point => ({
          x: point.x / scaleX,
          y: point.y / scaleY
        }))
      }));

      const adjustedSliderValue = sliderValue / ((scaleX + scaleY) / 2);
      updatedFormData = {
        input: {
          mask: adjustedMasks,
          sliderValue: adjustedSliderValue,
          source: imageUrl,
        },
      };
      const res = await inPaintImage2(updatedFormData, showErrorNotification, showSuccessNotification);
      if (res && res.id) {
        const taskId = res.id;
        // Step 2: Poll the status using checkImageInpaintStatus
        const pollInterval = 2000;
        const intervalId = setInterval(async () => {
          const statusRes = await checkImageInpaintStatus(taskId);
          console.log(statusRes)
          if (statusRes && statusRes.status === 'COMPLETED') {
            console.log(statusRes);
            setIsProcessing(false);
            if (statusRes.output.result_base64 === undefined) {
              showErrorNotification("You need to paint a box, mask, or point.");
            } else {
              setImages(statusRes.output.result_base64);
              showSuccessNotification("Image inpaint successfully!");
            }
            clearInterval(intervalId);
          } else if (statusRes && statusRes.status !== 'IN_QUEUE' && statusRes.status !== "IN_PROGRESS") {
            clearInterval(intervalId);
            showErrorNotification("Error in processing the image.");
            setIsProcessing(false);
          }
        }, pollInterval); // Poll every 2 seconds
      }
    } else if(drawingMode === 'point'){
      if(maskAction !== undefined){
        updatedFormData = {
          input:{
            source:imageUrl,
            mask: maskAction
          }
        }
        console.log(updatedFormData)
        const test = await removeObject(updatedFormData, showErrorNotification, showSuccessNotification);
        if(test){
          setImages(test.output.result_base64)
        }
      }
    } else if (drawingMode === 'box') {
      
    }
  }
  return (
    <>
      <div className="mt-5 flex w-full flex-col lg:flex-row">
        <div className="relative flex flex-col items-center justify-center h-full border border-gray-300 max-w-2xl p-10 my-5">
          {
            drawingMode === 'point' && 
            <>
              <div className="absolute top-1">
                <button className={`btn btn-sm mr-3 ${labels ? "btn-primary":"btn-base"}`} onClick={onClickActionTrue}>add</button>
                <button className={`btn btn-sm ${labels ? "btn-base":"btn-primary"}`} onClick={onClickActionFalse}>remove</button>
              </div>  
            </>
          }
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
                labelLs[i]==1 ? <Circle key={i} x={point.x} y={point.y} radius={5} fill="blue" /> : <Circle key={i} x={point.x} y={point.y} radius={5} fill="red" />
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
          <button className="absolute bottom-1 btn btn-primary btn-sm" onClick={handleUndo}>
            Undo
          </button>
        </div>
        <div className="divider divider-horizontal"></div>
        <form className="" onSubmit={handleSubmit}>
          <div className="flex">
            <div className="">
              <div className="font-bold">Select actions</div>
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

          </div>
          <button
            type="submit"
            className={`btn btn-primary btn-sm mt-3 ${isProcessing ? 'loading loading-spinner' : ''}`}
            disabled={isProcessing ? "disable" : ""}
          >            
            {isProcessing ? 'Processing...' : 'Segment'}
          </button>
          <button type="button" className="btn btn-primary btn-sm ml-3" onClick={()=> {handleRemoveBackground()}}>Remove</button>
        </form>
        
      </div>
      {
        images &&
        <ImageGallery images={images} />
      }
    </>

  );
};

export default Inpaint_v2;
