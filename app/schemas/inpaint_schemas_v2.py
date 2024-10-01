
from pydantic import BaseModel, Field
from typing import List, Union, Optional


# Define models for user inputs
class Box(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Point(BaseModel):
    x: float
    y: float

class PointAndLabel(BaseModel):
    points: Optional[List[Point]] = None
    labels: Optional[List[int]] = None

# Model to accept the user input for the request
class RemoveAnythingRequest(BaseModel):
    source: str = Field(..., description="The URL or path to the image")
    box: Optional[List[Box]] = None  # Optional, only one should be sent at a time
    pals: PointAndLabel = None

    @property
    def is_valid_request(self):
        # Ensure only one of box, point, or mask is provided
        return sum([self.box is not None, self.pals is not None]) == 1
    
# Wrapper model to encapsulate RemoveAnythingRequest under 'input' key
class InputWrapper(BaseModel):
    input: RemoveAnythingRequest
    
class InputRemoveMask(BaseModel):
    mask: List[str]
    source: str

class RemoveMask(BaseModel):
    input:InputRemoveMask