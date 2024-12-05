const requestLogger = (req, res, next) => {
  console.log("req.method ", req.method);
  console.log("req.url ", req.url);
  console.log("req.params ", req.params);
  console.log("req.query ", req.query);
  console.log("req.path ", req.path);
  console.log("req.body ", req.body);
  console.log("req.cookies ", req.cookies);
  next();
};

module.exports = requestLogger;
