from pydantic import BaseModel, Field
from typing import List, Union, Optional

class Upscale_Input(BaseModel):
    source: str
    input_type: str
    mode:str
class InputWrapper(BaseModel):
    input: Upscale_Input