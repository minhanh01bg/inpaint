const config = {
    apiUrl: process.env.REACT_APP_API_URL,
    apiMedia: process.env.REACT_APP_API_MEDIA,
    apiWebsocket:process.env.REACT_APP_API_WEBSOCKET,
    port: process.env.PORT,
    permit_key: process.env.REACT_APP_PERMIT_KEY,
    check_server: process.env.REACT_APP_CHECK_SERVER,
    apiRemBg: process.env.REACT_APP_API_REMOVE_BACKGROUND,
    apiInpainting: process.env.REACT_APP_API_INPAINTING,
    apiUpscaling: process.env.REACT_APP_API_UPSCALING,
    apiKeyRunpod: process.env.REACT_APP_API_KEY
};

export default config;