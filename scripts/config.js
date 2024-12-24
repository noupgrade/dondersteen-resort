const config = {
    prod: false,
    ENV_FILE_NAME: '.env.local',
};

const getConfig = () => config
const setConfig = (key, value) => config[key] = value

module.exports = {
    getConfig,
    setConfig,
};
