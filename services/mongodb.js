const mongoose = require('mongoose');


module.exports = (config) => mongoose.connect(
  config.mongodb.url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
);
