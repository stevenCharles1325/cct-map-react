var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');


// Paths
const data_path = path.join(__dirname, '../data/admin.json');
const graph_path = path.join(__dirname, '../data/records.json');
const scene_path = path.join(__dirname, '../data/scene.json');
const cpPos_path = path.join(__dirname, '../data/cp-position.json');
const models_path = path.join(__dirname, `../client/public/models`);
const admin_profile_path = path.join(__dirname, '../client/public/images/admin/profile-pics');



function authenticate( req, res, next ) {
  if( req.signedCookies.loggedIn && req.signedCookies.loggedIn === '1' ){
    next();
  }
  else{
    return res.sendStatus( 401 );
  }
}

router.get('/check', async (req, res, next) => {
  const adminExist = JSON.parse( fs.readFileSync( data_path ) ).exist;

  return res.status( 200 ).json( adminExist );
});


///////////////////// ADMIN-DATA  &  GRAPH-DATA ////////////////////////

// ADMIN-DATA route. 
router.get('/', authenticate, async (req, res, next) => {

  const admin_data = JSON.parse(fs.readFileSync( data_path ));

  return res.status( 200 ).json( admin_data );  
});

  
// GRAPH-DATA route.
router.get('/graph-data', authenticate, async (req, res, next) => {

  const graph_data = JSON.parse(fs.readFileSync( graph_path ));

  return res.status( 200 ).json( graph_data );  
});


// MAP-DATA route.
router.get('/map-data', authenticate, async (req, res, next) => {

  const map_data = JSON.parse(fs.readFileSync( scene_path ));

  return res.status( 200 ).json( map_data );  
});




///////////////////// UPLOAD 3D OBJECT ////////////////////////

// UPLOAD-3D route.
router.post('/obj-upload', authenticate, async (req, res, next) => {
  // clear all files in Models folder
  fs.readdir(models_path, (err, files) => {
    if( err ){
      console.log( err );
    }
    else {
      files.forEach(file => {
        
        if( file !== 'README.md' ){
          fs.unlink(path.join(models_path, file), (err) => {
            if (err) {
              console.error(err);
              return res.status( 503 ).json({ message: 'Something must have gone wrong'}); 
            }
          });
        }        
      });
    }
  });

  if( !req.files ) return res.status( 400 ).json({ message: 'There was no file with that name' });

  const object = req.files.object;
  const object_name = `object_${new Date().getTime()}.obj`;

  object.mv( models_path + `/${object_name}`, err => {

    if( err ) res.status( 500 ).send( err );

    res.status( 200 ).json({ fileName: object_name, filePath: `/models/${object_name}`});
  });
});





///////////////////// GET ADMIN PICTURE  ////////////////////////
router.get('/picture', authenticate, async (req, res, next) => {
  fs.readFile( data_path, (err, data) => {
    if( err ) return res.status( 503 ).json({message: `[READFILE]: Something went wrong, please try again`});

    return res.status( 200 ).json({ path: JSON.parse(data)?.image, message: 'Fetched successfully' });
  });
});





///////////////////// UPDATE ADMIN PICTURE  ////////////////////////
router.put('/upload-picture', authenticate, async (req, res, next) => {
  if( !req.files ) return res.status( 400 ).json({ message: 'No file found'});


  const image = req.files.adminImg;

  fs.readdir( admin_profile_path, (err, files) => {
    if( err ) return res.status( 503 ).json({message: `[READDIR]: Something went wrong, please try again`});

    files.forEach( async (file) => {
      await fs.unlink( path.join(admin_profile_path, `/${file}`), (err) => {
        if( err ) return res.status( 503 ).json({message: `[UNLINK]: Something went wrong, please try again`});
      });
    });

  });

  const image_name = `admin-pic-${new Date().getMilliseconds()}.png`
  const destination_path = path.join( admin_profile_path, image_name );

  image.mv( destination_path, async (err) => {
    if( err ) return res.status( 503 ).json({message: `[MOVING]: Something went wrong, please try again`});

    fs.readFile( data_path, async (err, data) => {
      if( err ) return res.status( 503 ).json({message: `[READFILE]: Something went wrong, please try again`});

      const parsedData = JSON.parse( data );
      parsedData.image = `/images/admin/profile-pics/${image_name}`;


      await fs.writeFile( data_path, JSON.stringify( parsedData, null, 4 ), (err) => {
        if( err ) return res.status( 503 ).json({message: `[WRITEFILE]: Something went wrong, please try again`});

      });

      return res.status( 200 ).json({path: parsedData.image, message: 'Uploaded successfully!' });
    });
  });
});


///////////////////// UPDATE MAP DATA  ////////////////////////
router.post('/update-map', authenticate, async (req, res, next) => {
  const { scene, cpPosition } = req.body;

  

  fs.writeFile(scene_path, JSON.stringify(scene, null, 4), (err) => {
    if( err ) return res.status(503).json({message: `Couldn't fulfill the request to save data`});

    fs.writeFile(cpPos_path, JSON.stringify(cpPosition, null, 4), (err) => {
      if( err ) return res.status(503).json({message: `Couldn't fulfill the request to save data`});

      return res.status(200).json({message: 'Map\'s been saved'});
    });
  });
});






///////////////////// SIGN-IN  &  SIGN-UP ////////////////////////////

// SIGN-IN route.
router.put('/sign-in', async (req, res, next) => {
  const { username, password } = req.body;
  const admin_data = JSON.parse(fs.readFileSync( data_path ));
  
  if(  username === admin_data.username ){
    if( password === admin_data.password ){
      res.cookie('loggedIn', '1', { signed: true });
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



// SIGN-UP route.
router.post('/sign-up', async(req, res, next) => {
  const { username, password, email, number } = req.body;
  const data = {
    exist: true,
    username : username,
    password : password,
    email : email,
    number : number
  };

  fs.writeFile( data_path, JSON.stringify(data, null, 4), err => {
    if( err ) return res.status(503).json({message: `Couldn't fulfill the request to save data`});
    
    res.cookie('loggedIn', '1', { signed: true });  
    return res.status(201).json({ message: "signed-up" });
  });

});








///////////////////// CHANGE-ADMIN-DATA  &  SET-ADMIN-STATUS ( ONLINE and OFFLINE )  ////////////////////////

// SET-ADMIN route.
router.put('/set-admin', authenticate, async(req, res, next) => {
  const { username, password, email, number } = req.body;
  const admin_data = JSON.parse( fs.readFileSync(data_path) );

  admin_data.username = username;
  admin_data.password = password;
  admin_data.email = email;
  admin_data.number = number;  

  fs.writeFile( data_path, JSON.stringify(admin_data, null, 4), (err) => {
    if( err ){
      return res.status(503).json({message: `Couldn't fulfill the request to change admin`});
    }
    return res.status(200).json({ message: "changes applied" });
  });
});


// ADMIN-STATUS route.
router.put('/sign-out', authenticate, async(req, res, next) => {
  res.clearCookie('loggedIn');

  return res.status( 200 );
});




module.exports = router;
