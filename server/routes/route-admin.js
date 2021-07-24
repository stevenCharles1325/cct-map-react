var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const data_path = path.join(__dirname, '../data/admin.json');

/* GET home page. */
router.get('/', async (req, res, next) => {

  const admin_data = JSON.parse(fs.readFileSync( data_path ));

  return res.status(200).json( admin_data );  
});

router.post('/sign-up', async(req, res, next) => {
  const { username, password, email, number } = req.body;
  const data = {
    status : {
      exist: true,
      loggedIn: true
    },
    username : username,
    password : password,
    email : email,
    number : number
  };

  
  fs.writeFile( data_path, JSON.stringify(data, null, 4), (err) => {
    console.log( `Error: ${err}` );
  });
  
  return res.status(201);
});

router.put('/log-out', async(req, res, next) => {
  const admin_data = JSON.parse(fs.readFileSync( data_path ));
  const { loggedIn } = req.body;

  admin_data.status.loggedIn = loggedIn;

  fs.writeFile( data_path, JSON.stringify(admin_data, null, 4), (err) => {
    console.log( `Error: ${err}` );
  });
  
  return res.status(200).json({ message: "Logging out" });
});

module.exports = router;
