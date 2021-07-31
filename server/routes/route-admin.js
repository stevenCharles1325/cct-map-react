var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const data_path = path.join(__dirname, '../data/admin.json');
const graph_path = path.join(__dirname, '../data/records.json');




// GET home page. 
router.get('/', async (req, res, next) => {

  const admin_data = JSON.parse(fs.readFileSync( data_path ));

  return res.status(200).json( admin_data );  
});




// GET data for graph
router.get('/graph-data', async (req, res, next) => {

  const graph_data = JSON.parse(fs.readFileSync( graph_path ));

  return res.status(200).json( graph_data );  
});




// PUT or set log-status to online or offline
router.put('/log-status', async(req, res, next) => {
  const admin_data = JSON.parse( fs.readFileSync(data_path) );

  admin_data.status.loggedIn = req.body.status; 

  try{
    fs.writeFileSync( data_path, JSON.stringify(admin_data, null, 4));
  }
  catch( err ){
    console.log( err );
  }

  return res.status(200).json({message: 'online'});
})



// PUT admin to sign-in
router.put('/sign-in', async (req, res, next) => {
  const { username, password } = req.body;
  const admin_data = JSON.parse(fs.readFileSync( data_path ));
  
  if(  username === admin_data.username ){
    if( password === admin_data.password ){
      admin_data.status.loggedIn = true;
      try{
        fs.writeFileSync( data_path, JSON.stringify(admin_data, null, 4));
      }
      catch( err ){
        console.log( err );
      }
      return res.status( 200 ).json({ message: 'signed-in' });
    }
    else{
      return res.status( 401 ).json({ which: 'password' });
    }
  }
  else{
    return res.status( 401 ).json({ which: 'username' });
  }

});




// PUT or create the admin
router.put('/set-admin', async(req, res, next) => {
  const { username, password, email, number } = req.body;
  const admin_data = JSON.parse( fs.readFileSync(data_path) );

  admin_data.username = username;
  admin_data.password = password;
  admin_data.email = email;
  admin_data.number = number;  

  try{
    fs.writeFileSync( data_path, JSON.stringify(admin_data, null, 4));
  }
  catch( err ){
    console.log( err );
  }
  
  return res.status(200).json({ message: "changes applied" });
});




// POST sign-up for admin
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

  try{
    fs.writeFileSync( data_path, JSON.stringify(data, null, 4));
  }
  catch( err ){
    console.log( err );
  }
  
  return res.status(201).json({ message: "signed-up" });
});




// POST for uploading 3d objects
router.post('/obj-upload', (req, res, next) => {

  if( !req.files ) return res.status( 400 ).json({ message: 'There was no file with that name' });

  const object = req.files.object;

  const path_to_frontend_public = path.join(__dirname, `../../front-end/public/models/${file.name}`);

  object.mv( path_to_frontend_public, err => {

    if( err ){
      res.status( 500 ).send( err );
    }

    res.status( 200 ).json({ fileName: file.name, filePath: `/models/${file.name}`});
  });

});




module.exports = router;
