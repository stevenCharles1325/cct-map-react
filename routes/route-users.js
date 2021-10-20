var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var BSON = require('bson');

const rec_path = path.join(__dirname, '../data/records.json');
const scene_path = path.join(__dirname, '../data/scene.json');
const cpPos_path = path.join(__dirname, '../data/cp-position.json');


// Get map scene and checkpoints position
router.get('/map-data', async (req, res, next) => {
  fs.readFile(scene_path, ( err, scene ) => {
    if( err ) return res.status( 400 ).json({ message: 'Resources not found' });

    fs.readFile(cpPos_path, ( err, cpPos ) => {
      if( err ) return res.status( 400 ).json({ message: 'Resources not found' });

      return res.status( 200 ).json({ 
        data: { 
          scene: JSON.parse(scene), 
          cpPos: JSON.parse(cpPos) 
        }, 
        message: 'Data have been fetched successfully' 
      });
    });
  });
});


router.get('/update-records', async (req, res) => {
  fs.readFile(rec_path, (err, records) => {
    if( err ) return res.sendStatus( 503 );

    const date = new Date().toString();
    const currentYear = date.split(' ')[ 3 ];
    const currentMonth = date.split(' ')[ 1 ];
    let numberTime = Number(date.split(' ')[ 4 ].split(':')[0]);
    let currentTime = numberTime > 12 ? `${numberTime - 12} PM` : `${numberTime} AM`

    let convertedRecords = JSON.parse( records );

    if( convertedRecords.year === currentYear ){
      if( !isNaN(convertedRecords.annRate[ currentMonth ]) ){
        convertedRecords.annRate[ currentMonth ] += 1;
      }

      if( !isNaN(convertedRecords.currRate[ numberTime - 12 + 5 ]) ){
        convertedRecords.currRate[ numberTime - 12 + 5 ] += 1;
      }
    }

    fs.writeFile(rec_path, JSON.stringify( convertedRecords, null, 4 ), async (err) => {
        if( err ) console.log( err );

        return res.sendStatus( 200 );
    });
  });
});

module.exports = router;
