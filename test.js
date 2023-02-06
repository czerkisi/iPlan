var express = require('express');
var router = express.Router();

router.use(express.json());

router.post('/', function(request, response){
    console.log(request.body);      // your JSON
    response.send(request.body);    // echo the result back
});

module.exports = router;

router.listen(3000, () => {
    console.log("Server is listening on port 3000");
});