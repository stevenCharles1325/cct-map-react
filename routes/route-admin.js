require('dotenv').config();

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var jwt = require('jsonwebtoken');
var BSON = require('bson');

// Paths
const temp_path = path.join(__dirname, '../data/temp.json');
const data_path = path.join(__dirname, '../data/admin.json');
const scene_path = path.join(__dirname, '../data/scene.json');
const tokens_path = path.join(__dirname, '../data/tokens.json');
const graph_path = path.join(__dirname, '../data/records.json');
const cpPos_path = path.join(__dirname, '../data/cp-position.json');
const models_path = path.join(__dirname, `../client/public/models`);
const admin_profile_path = path.join(__dirname, '../client/public/images/admin/profile-pics');


function authentication ( req, res, next ) {
  const authenHeader = req.headers['authentication'];
  const token = authenHeader && authenHeader.split(' ')[ 1 ];

  if( !token ) return res.sendStatus( 401 );

  jwt.verify( token, process.env.ACCESS_TOKEN_SECRET, ( err, user ) => {
    if( err ) return res.sendStatus( 403 );

    req.user = user;
    next();
  });
}

router.get('/check-existence', async (req, res, next) => {
  const adminExist = JSON.parse( fs.readFileSync( data_path ) ).exist;

  return res.status( 200 ).json({ adminExist });
});


router.get('/check-status', authentication, async (req, res, next) => {
  return res.sendStatus( 200 );
})


///////////////////// ADMIN-DATA  &  GRAPH-DATA ////////////////////////
// ADMIN-DATA route. 
router.get('/', authentication, async (req, res, next) => {
  const admin_data = JSON.parse(fs.readFileSync( data_path ));

  return res.status( 200 ).json( admin_data );  
});


// GRAPH-DATA route.
router.get('/graph-data', authentication, async (req, res, next) => {
  fs.readFile(graph_path, (err, records) => {
    if( err ) return res.sendStatus( 503 );

    const date = new Date().toString();

    const currentYear = date.split(' ')[ 3 ];
    const currentDay = date.split(' ')[ 2 ];
    const currentMonth = date.split(' ')[ 1 ];

    let numberTime = Number(date.split(' ')[ 4 ].split(':')[0]);
    let currentTime = numberTime > 12 ? `${numberTime - 12} PM` : `${numberTime} AM`

    let convertedRecords = JSON.parse( records );

    // convertedRecords.currRate.forEach((rate, index) => {
    //   if( index > numberTime - 12 + 5 ){
    //     convertedRecords.currRate[ index ] = 0;
    //   }
    // }); 

    if( convertedRecords.day !== currentDay ){
      convertedRecords.currRate.forEach((rate, index) => {
        convertedRecords.currRate[ index ] = 0;
      });

      convertedRecords.day = currentDay;
    }

    if( convertedRecords.year !== currentYear ){
      convertedRecords.year = currentYear;

      Object.keys( convertedRecords.annRate ).forEach( key => {
        convertedRecords.annRate[ key ] = 0;
      });      
    }

    // if( numberTime < 7 || numberTime > 18 ){
    //   convertedRecords.currRate.forEach((rate, index) => {
    //     convertedRecords.currRate[ index ] = 0;
    //   }); 
    // }

    fs.writeFile(graph_path, JSON.stringify( convertedRecords, null, 4 ), async (err) => {
        if( err ) console.log( err );

        return res.status( 200 ).json( convertedRecords );
    });
  });
});



// MAP-DATA route.
router.get('/map-data', authentication, async (req, res, next) => {
  // Changes hereee
  fs.readFile( scene_path, ( err, data ) => {
    if( err ) return res.sendStatus( 503 );

    const map_data = JSON.parse( data );
    return res.status( 200 ).json( map_data );  
  });
});




///////////////////// UPLOAD 3D OBJECT ////////////////////////

// UPLOAD-3D route.
router.post('/obj-upload', authentication, async (req, res, next) => {
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
router.get('/picture', authentication, async (req, res, next) => {
  fs.readFile( data_path, (err, data) => {
    if( err ) return res.status( 503 ).json({message: `[READFILE]: Something went wrong, please try again`});

    return res.status( 200 ).json({ path: JSON.parse(data)?.image, message: 'Fetched successfully' });
  });
});





///////////////////// UPDATE ADMIN PICTURE  ////////////////////////
router.put('/upload-picture', authentication, async (req, res, next) => {
  if( !req.files ) return res.status( 400 ).json({ message: 'No file found'});


  const image = req.files.adminImg;

  fs.readdir( admin_profile_path, (err, files) => {
    if( err ) return res.status( 503 ).json({message: `[READDIR]: Something went wrong, please try again`});

    fs.unlink( path.join(admin_profile_path, `/${files[0]}`), (err) => {
      if( err ) return res.status( 503 ).json({message: `[UNLINK]: Something went wrong, please try again`});

      const image_name = `admin-pic-${new Date().getTime()}.png`
      const destination_path = path.join( admin_profile_path, image_name );

      image.mv( destination_path, err => {
        if( err ) return res.status( 503 ).json({message: `[MOVING]: Something went wrong, please try again`});

        fs.readFile( data_path, (err, data) => {
          if( err ) return res.status( 503 ).json({message: `[READFILE]: Something went wrong, please try again`});

          const parsedData = JSON.parse( data );
          parsedData.image = `/images/admin/profile-pics/${image_name}`;

          fs.writeFile( data_path, JSON.stringify( parsedData, null, 4 ), (err) => {
            if( err ) return res.status( 503 ).json({message: `[WRITEFILE]: Something went wrong, please try again`});

            return res.status( 200 ).json({path: parsedData.image, message: 'Uploaded successfully!' });
          });
        });
      });
    });
  });
});



///////////////////// UPDATE MAP DATA  ////////////////////////
router.post('/update-map', authentication, async (req, res, next) => {  
  let { scene, cpPos } = req.body;

  scene = Object.values(BSON.deserialize( new Uint8Array( scene.data ) ));
  cpPos = Object.values(BSON.deserialize( new Uint8Array( cpPos.data ) ));

  fs.readFile( scene_path, (err, stringData) => {
    if( err ) return res.status( 503 ).json({ message: `Couldn't fulfill the request to save data` });

    if( JSON.stringify( scene ) === JSON.stringify(JSON.parse( stringData )) ){
      return res.json({ isDiffer: false });
    }
    else{
      fs.writeFile(scene_path, JSON.stringify(scene, null, 4), (err) => {
        if( err ) return res.status( 503 ).json({ message: `Couldn't fulfill the request to save data` });

        fs.writeFile(cpPos_path, JSON.stringify(cpPos, null, 4), (err) => {
          if( err ) return res.status( 503 ).json({ message: `Couldn't fulfill the request to save data` });

          return res.status( 200 ).json({ isDiffer: true, message: 'Map\'s been saved' });
        });
      });
    }
  });
});



///////////////////// CHANGE-ADMIN-DATA  &  SET-ADMIN-STATUS ( ONLINE and OFFLINE )  ////////////////////////
// SET-ADMIN route.
router.put('/set-admin', authentication, async(req, res, next) => {
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
router.delete('/sign-out/token/:token', authentication, async ( req, res ) => {
  fs.readFile( tokens_path, ( err, tokens ) => {
    if( err ) return res.sendStatus( 500 );

    const parsedTokens = JSON.parse( tokens ).filter( token => token !== req.params.token );

    fs.writeFile( tokens_path, JSON.stringify( parsedTokens, null, 4 ), ( err ) => {
      if( err ) return res.sendStatus( 500 );

        return res.sendStatus( 200 );
    }); 
  });
});




module.exports = router;
