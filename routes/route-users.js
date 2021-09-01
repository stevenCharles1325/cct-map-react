var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

const scene_path = path.join(__dirname, '../data/scene.json');
const cpPos_path = path.join(__dirname, '../data/cp-position.json');



// Get map scene and checkpoints position
router.get('/map-data', function(req, res, next) {
  fs.readFile(scene_path, ( err, scene ) => {
    if( err ){
      console.log( err );
      return res.status( 400 ).json({ message: 'Resources not found' });
    }

    fs.readFile(cpPos_path, ( err, cpPos ) => {
      if( err ){
        console.log( err );
        return res.status( 400 ).json({ message: 'Resources not found' });
      }

      return res.status( 200 ).json({ data: { scene: JSON.parse(scene), cpPos: JSON.parse(cpPos) }, message: 'Data have been fetched successfully' });
    })
  })
});

module.exports = router;
