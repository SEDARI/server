var serios = require('serios');

function init(settings, security) {
    return serios.init(settings, security);
}

module.exports = {
    init: init
}
