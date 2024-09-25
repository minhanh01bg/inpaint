from pydantic import BaseModel, Field
from typing import List, Union, Optional

class Rembg_Input(BaseModel):
    source: str
    input_type: str

class InputWrapper(BaseModel):
    input: Rembg_Input