export default function plugin (md) {
  var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If the link starts with '/', assume it is to another page on this site
    // And allow it to open in the same tab by default
    if (tokens[idx].attrGet('href')[0] !== '/') {
      var aIndex = tokens[idx].attrIndex('target');
    
      if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']); // add new attribute
      } else {
        tokens[idx].attrs[aIndex][1] = '_blank'; // replace value of existing attr
      }
    }
  
    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
  };
};