import { Helmet, HelmetProvider } from 'react-helmet-async';
import React from 'react';

function Title({title}) {
    return (
      
      <HelmetProvider>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content="Mô tả trang của tôi" />
        </Helmet>
      </HelmetProvider>
    );
  }
  
  export default Title;