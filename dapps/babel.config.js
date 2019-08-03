module.exports = function (api) {
  api.cache(true);
  
  const presets = [ "react-app" ];
  const plugins = [ "@babel/plugin-proposal-class-properties" ];
  
  return {
    presets,
    plugins
  };
}