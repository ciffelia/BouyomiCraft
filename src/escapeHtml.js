module.exports = function escapeHtml(content) {
  var escapeMap = {
    '&': '&amp;',
    '\x27': '&#39;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
  };
  return content.replace(/[&"<>]/g, function(match) {
    return escapeMap[match];
  });
};
