import React, { useEffect, useState } from 'react';

const Base64Image = ({ base64String }) => {
  return <img src={base64String} alt="Base64" />;
};

export default Base64Image;
