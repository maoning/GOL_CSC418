 Grid = function() {
    return {
        // map size
        x : 100,
        y : 100,
        z : 100,

        // block dimensions
        cube_w:Math.floor(WIDTH/this.x),
        cube_h:Math.floor(HEIGHT/this.y),
        cube_d:Math.floor(DEPTH/this.z),

        // thresholds
        th : {
            lonely: $('#lonely').val(),
            breed: $('#breed').val(),
            overcrowd: $('#overcrowd').val()
        },

        // the actual map
        map: [],

        // for keeping track of number of live neighbours of each cell
        n_live_neighbours: [],

        run:false,
        timeout:false,

        // functions!!!
        /** Initializes the map */
        init: function() {
            // clear the map
            this.map = [];
            this.n_live_neighbours = [];
            // set the new size
            var size = $('#size').val();
            this.x = size;
            this.y = size;
            this.z = size;

            // set the width and height of cubes
            this.cube_w=Math.floor(WIDTH/this.x);
            this.cube_h=Math.floor(HEIGHT/this.y);
            this.cube_d=Math.floor(DEPTH/this.z);

            var i = 0;
            var j = 0;
            var k = 0;

            // number of cells to generate in each direction
            this.pos_x = this.x;
            this.pos_y = this.y;
            this.pos_z = this.z;

            // build out the (empty) map
            for (i=0;i<this.pos_x;i++) {
                // add the sub array
                this.map[i] = [];
                this.n_live_neighbours[i] = [];
                for (j=0;j<this.pos_y;j++) {
                    // add the sub array
                    this.map[i][j] = [];
                    this.n_live_neighbours[i][j] = [];
                    for (k=0;k<this.pos_z;k++) {
                        // set the position to 0
                        this.map[i][j][k] = false;
                        this.n_live_neighbours[i][j][k] = 0;
                        // randomly decide if we should populate this cell (about 10% of cells will be populated)
                        if (Math.random() <= 0.1) {
                            this.map[i][j][k] = this.add_cell(i,j,k);
                            this.n_live_neighbours[i][j][k] = 0;
                        }
                    }
                }
          }
          // Update live neighbours.
          for (i=0;i<this.pos_x;i++) {
              for (j=0;j<this.pos_y;j++) {
                  for (k=0;k<this.pos_z;k++) {
                      if (this.is_alive(i, j, k)) {this.update_neighbours(this.n_live_neighbours, i, j, k, true); }
                  }
              }
          }

          // draw!
          renderer.render(scene, camera);

          // start the game
          this.start();
        },
        /** Gets the 'life' value of a position on the map
         * @param x The 'x' position
         * @param y The 'y' position
         * @param z The 'z' position
         * @returns {bool} true if alive, false if dead
         */
    is_alive : function(x, y, z) {
        return (this.map[x][y][z].state == 1) ? this.map[x][y][z] : false;
    },

    copy_array:
      function(array){
        var new_array = [];
          // Update live neighbours.
          for (i=0;i<this.pos_x;i++) {
              new_array[i] = [];
              for (j=0;j<this.pos_y;j++) {
                  new_array[i][j] = [];
                  for (k=0;k<this.pos_z;k++) {      
                      new_array[i][j][k] = array[i][j][k];
                  }
              }
          }
      return new_array;
    },

    update_neighbours:
        function(neighbours, x, y, z, alive) {
          // get the min and max to search, respecting the grid boundries
          var min_x = (x > 0 ? x - 1 : x);
          var max_x = (x < this.pos_x - 1 ? x + 1 : x);
          var min_y = (y > 0 ? y - 1 : y);
          var max_y = (y < this.pos_y - 1 ? y + 1 : y);
          var min_z = (z > 0 ? z - 1 : z);
          var max_z = (z < this.pos_z - 1 ? z + 1 : z);

          // the ijk vars
          var i = 0;
          var j = 0;
          var k = 0;

          // now perform the update
          for (i = min_x; i <= max_x; i++) {
            for (j = min_y; j <= max_y; j++) {
              for (k = min_z; k <= max_z; k++) {
                // ignore the item we're looking for neighbours for
                if (!(i == x && j == y && k == z)) {
                  if (alive){
                    neighbours[i][j][k]++;
                  }
                  else {
                    neighbours[i][j][k]--;
                  }
                }
              }
            }
          }
        },
       /** Gets the number of living neighbours
        * @param x The 'x' position
        * @param y The 'y' position
        * @param z The 'z' position
        * @returns {int} The count of living neighbours
        */
    living_neighbours :
        function(x, y, z) {
          // get the min and max to search, respecting the grid boundries
          var min_x = (x > 0 ? x - 1 : x);
          var max_x = (x < this.pos_x - 1 ? x + 1 : x);
          var min_y = (y > 0 ? y - 1 : y);
          var max_y = (y < this.pos_y - 1 ? y + 1 : y);
          var min_z = (z > 0 ? z - 1 : z);
          var max_z = (z < this.pos_z - 1 ? z + 1 : z);

          // initialise the number of neighbors
          var neighbours = 0;

          // the ijk vars
          var i = 0;
          var j = 0;
          var k = 0;

          // now perform the search
          for (i = min_x; i <= max_x; i++) {
            for (j = min_y; j <= max_y; j++) {
              for (k = min_z; k <= max_z; k++) {
                // ignore the item we're looking for neighbours for
                if (!(i == x && j == y && k == z)) {
                  if (this.is_alive(i, j, k)) {
                    neighbours++;
                  }
                }
              }
            }
          }

          // return however many we found
          return neighbours;
        },
        /** Gets the number of living neighbours
         * @param x The 'x' position
         * @param y The 'y' position
         * @param z The 'z' position
         * @returns {void}
         */
        infectNeighbours : function (x,y,z) {
            // get the min and max to search, respecting the grid boundries
            var min_x = (x > 0 ? x-1 : x);
            var max_x = (x < this.pos_x-1 ? x+1: x);
            var min_y = (y > 0 ? y-1 : y);
            var max_y = (y < this.pos_y-1 ? y+1: y);
            var min_z = (z > 0 ? z-1 : z);
            var max_z = (z < this.pos_z-1 ? z+1: z);

            // initialise the number of neighbors
            var neighbours = 0;

            // the ijk vars
            var i = 0;
            var j = 0;
            var k = 0;

            // now perform the search
            for (i=min_x;i<=max_x;i++) {
                for (j=min_y;j<=max_y;j++) {
                    for (k=min_z;k<=max_z;k++) {
                        // ignore the item we're looking for neighbours for
                        if (!(i==x && j==y && k==z)) {
                            var cell = this.is_alive(i,j,k);
                            if (cell) {
                                cell.infected = {lifespan: $('#lifespan').val()};
                                cell.material.color.setHex( 0x000000 );
                            }
                        }
                    }
                }
            }
        },
        /** Gets the number of living neighbours
         * @param x The 'x' position
         * @param y The 'y' position
         * @param z The 'z' position
         * @returns {boolean} true if at least one of the parents is infected
         */
        hasInfectedParent : function (x,y,z) {
            // get the min and max to search, respecting the grid boundries
            var min_x = (x > 0 ? x-1 : x);
            var max_x = (x < this.pos_x-1 ? x+1: x);
            var min_y = (y > 0 ? y-1 : y);
            var max_y = (y < this.pos_y-1 ? y+1: y);
            var min_z = (z > 0 ? z-1 : z);
            var max_z = (z < this.pos_z-1 ? z+1: z);

            // initialise the number of neighbors
            var neighbours = 0;

            // the ijk vars
            var i = 0;
            var j = 0;
            var k = 0;

            // now perform the search
            for (i=min_x;i<=max_x;i++) {
                for (j=min_y;j<=max_y;j++) {
                    for (k=min_z;k<=max_z;k++) {
                        // ignore the item we're looking for neighbours for
                        if (!(i==x && j==y && k==z)) {
                            var cell = this.is_alive(i,j,k);
                            if (cell) {
                                if (typeof cell.infected !== 'undefined' && cell.infected.lifespan >= 0) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            return false;
        },
        render: function() {
            if (this.run == false) return;

            var newmap = [];
            var new_neighbours = this.copy_array(this.n_live_neighbours);
            var i = 0;
            var j = 0;
            var k = 0;

            for (i=0;i<this.pos_x;i++) {
                // add the sub array
                newmap[i] = [];
                for (j=0;j<this.pos_y;j++) {
                    // add the sub array
                    newmap[i][j] = [];
                    for (k=0;k<this.pos_z;k++) {
                        // set the position to 0
                        newmap[i][j][k] = false;

                        var cell = this.is_alive(i,j,k);
                        //var n = this.living_neighbours(i,j,k);
                        var n = this.n_live_neighbours[i][j][k];

                        // transpose
                        if (cell && cell.state == 1) {
                            if (typeof cell.infected !== 'undefined') {
                                // console.log("this cell is infected [" + cell.infected.lifespan + "]");
                                if (cell.infected.lifespan > 0) {
                                    this.infectNeighbours(i,j,k);
                                }
                            }
                            // is the cell lonely or overcrowded?
                            if (n <= this.th.lonely || n >= this.th.overcrowd) {
                                // kill the cell off
                                // Add free fall effect to 5% of the cube
                                if (Math.random() <= 0.1) {
                                    cell.state = 0;
                                    deadCells.push(cell);
                                } else {
                                    scene.remove(cell);
                                }

                                this.update_neighbours(new_neighbours, i, j, k, false);
                            } else if (typeof cell.infected !== 'undefined' && cell.infected.lifespan == 0) {
                                if (Math.random() <= 0.1) {
                                    cell.state = 0;
                                    deadCells.push(cell);
                                } else {
                                    scene.remove(cell);
                                }
                                this.update_neighbours(new_neighbours, i, j, k, false);
                            } else {
                                // if not, just copy it across
                                newmap[i][j][k] = cell;
                            }
                            if (typeof cell.infected !== 'undefined') {
                                cell.infected.lifespan = cell.infected.lifespan - 1;
                            }
                        } else {
                            // check if we're in the breed threshold
                            if (n == this.th.breed) {
                                var newcell;
                                if (this.hasInfectedParent(i,j,k)) {
                                    newcell = this.add_infectedcell(i,j,k);
                                } else {
                                    newcell = this.add_cell(i,j,k);
                                }

                                this.update_neighbours(new_neighbours, i, j, k, true);

                                if (newcell) {
                                    // add the cell to the new map
                                    newmap[i][j][k] = newcell;
                                }
                            }
                        }
                    }
                }
            }

          // replace the map
          delete this.map;
          this.map = newmap;
          // replace the neighbours matrix
          delete this.n_live_neighbours;
          this.n_live_neighbours = new_neighbours;
          // draw
          renderer.render(scene, camera);

           if (this.run === true) {
             // render again
             this.timeout = setTimeout('Grid.render();', $('#speed').val());
           }
        },
    add_cell :
        function(x, y, z) {
          if (!this.is_alive(x, y, z)) {
            var geometry = new THREE.BoxGeometry(this.cube_w, this.cube_h,
                                                  this.cube_d, 1, 1, 1);
            if (injectVirus){
              var color = 0x000000;
              var material = new THREE.MeshPhongMaterial({
                color : color,
                specular : 0xcccccc,
                shininess : 100,
                shading : THREE.FlatShading
              });
            }
            else if (texMap){
              var random = Math.floor(Math.random() * 6 + 1);
              switch (random){
                case 1:
                  var texture = THREE.ImageUtils.loadTexture('images/bricks.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0xcc0000,
                    shininess : 5,
                    shading : THREE.FlatShading
                  });
                  break;
                case 2:
                  var texture = THREE.ImageUtils.loadTexture('images/clouds.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0x888888,
                    shininess : 80,
                    shading : THREE.FlatShading
                  });
                  break;
                case 3:
                  var texture = THREE.ImageUtils.loadTexture('images/crate.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0xaa8800,
                    shininess : 5,
                    shading : THREE.FlatShading
                  });
                  break;
                case 4:
                  var texture = THREE.ImageUtils.loadTexture('images/stone-wall.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0x888888,
                    shininess : 50,
                    shading : THREE.FlatShading
                  });
                  break;
                case 5:
                  var texture = THREE.ImageUtils.loadTexture('images/water.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0xcccccc,
                    shininess : 90,
                    shading : THREE.FlatShading
                  });
                  break;
                case 6:
                  var texture = THREE.ImageUtils.loadTexture('images/wood-floor.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0xaaaaaa,
                    shininess : 100,
                    shading : THREE.FlatShading
                  });
                  break;
                default:
                  var texture = THREE.ImageUtils.loadTexture('images/bricks.jpg');
                  //Filters... to get rid of warnings.
                  texture.magFilter = THREE.NearestFilter;
                  texture.minFilter = THREE.NearestFilter;
                  var material = new THREE.MeshPhongMaterial({
                    map : texture,
                    specular : 0xcc0000,
                    shininess : 5,
                    shading : THREE.FlatShading
                  });
              }
            }
            else {
              var color = 0x000000;
              // set a base colour, which won't be black, and is somewhat based on
              // position
              var color_r = (Math.random() * x / this.x) * 0xf4 + 8;
              var color_g = (Math.random() * y / this.y) * 0xf4 + 8;
              var color_b = (Math.random() * z / this.z) * 0xf4 + 8;

              color = (color_r << 16) + (color_g << 8) + color_b;
              // var material = new THREE.MeshLambertMaterial( {color: color} );
              
              var material = new THREE.MeshPhongMaterial({
                color : color,
                specular : 0xcccccc,
                shininess : 100,
                shading : THREE.FlatShading
              });
            }
            var newcell = new THREE.Mesh(geometry, material);

            // Position the cube
            newcell.position.x = Math.round(x * this.cube_w);
            newcell.position.y = Math.round(y * this.cube_h);
            newcell.position.z = Math.round(z * this.cube_d);
            // console.log("Add cell, x: " + newcell.position.x + " y: " +
            // newcell.position.y + " z: " + newcell.position.z);
            if (injectVirus == true) {
                newcell.infected = {lifespan:  $('#lifespan').val()};
                injectVirus = false;
            };

            newcell.state = 1;
            // draw it
            newcell.overdraw = true;
            newcell.castShadow = true;
            newcell.receiveShadow = true;
            scene.add(newcell);
            return newcell;
          }

          return false;
        },
        add_infectedcell: function (x,y,z) {
            if (!this.is_alive(x,y,z)) {

                var color = 0x000000;

                var geometry = new THREE.BoxGeometry( this.cube_w, this.cube_h,
                                                      this.cube_d, 1, 1, 1 );
                var material = new THREE.MeshPhongMaterial({
                  color : color,
                  specular : 0xcccccc,
                  shininess : 100,
                  shading : THREE.FlatShading
                });
                var newcell = new THREE.Mesh(geometry, material);

                // Position the cube
                newcell.position.x = Math.round(x*this.cube_w);
                newcell.position.y = Math.round(y*this.cube_h);
                newcell.position.z = Math.round(z*this.cube_d);

                //console.log("Add cell, x: " + newcell.position.x + " y: " + newcell.position.y + " z: " + newcell.position.z);

                // draw it
                newcell.infected = {lifespan:  $('#lifespan').val()};
                newcell.overdraw = true
                newcell.castShadow = true;
                newcell.receiveShadow = true;
                scene.add( newcell );

                return newcell;
            }
            return false;
        },
    pause :
        function() {
          if (this.run === true) {
            this.run = false;
            if (this.timeout !== false) {
              clearTimeout(this.timeout);
              this.timeout = false;
            }
            pause.val('Start');

            pause.click(function() { Grid.start(); });
          }
        },
    start :
        function() {
          if (this.run === false) {
            this.run = true;
            pause.val('Pause');
            pause.click(function() { Grid.pause(); });

            // clear the timeout
            if (this.timeout !== false) {
              clearTimeout(this.timeout);
              this.timeout = false;
            }
            // start the game
            //Grid.render();
            this.timeout = setTimeout('Grid.render();', $('#speed').val());
          }
        },
    clear_grid: function() {
        var i = 0;
        var j = 0;
        var k = 0;

        // build out the (empty) map
        for (i=0;i<this.pos_x;i++) {
            for (j=0;j<this.pos_y;j++) {
                for (k=0;k<this.pos_z;k++) {
                    cell = this.is_alive(i,j,k);

                    if (cell) {
                        scene.remove(cell);
                    }
                    this.n_live_neighbours[i][j][k] = 0;
                }
            }
        }
    }
};
}();

var stage = $('#gameoflife');
var pause = $('#pause');
var effect = $('#effect').val();

var injectVirus = false;
var texMap = false;
// set the scene size
var WIDTH = 800,
    HEIGHT = 800,
    DEPTH = 800;

// set some camera attributes
var VIEW_ANGLE = 45,
    ASPECT = WIDTH*1.5 / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

var renderer;
var camera;
var scene;
var target;
var deadCells = [];
var parts = [];
var fallingParts = [];
var dirs = [];
var lastTime;
var lastGridUpdateTime;

function init() {
  // create a canvas renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

  scene = new THREE.Scene();

  target =
      new THREE.Vector3(Math.floor(WIDTH / 2), Math.floor(HEIGHT / 2), 200);
  target.normalize;

  // the camera starts at 0,0,0 so pull it back
  camera.position.y = Math.floor(HEIGHT / 2);
  camera.position.z = 2000;
  camera.lookAt(target);

  // start the renderer
  renderer.setSize(WIDTH*1.5, HEIGHT);
  renderer.setClearColor(0xEEEEEE);
  // document.body.appendChild( renderer.domElement );

  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  renderer.setClearColor( 0xffffff, 0);
  // attach the render-supplied DOM element
  stage.append(renderer.domElement);

  // create the ground plane
  var planeGeometry = new THREE.PlaneGeometry(5000, 2000, 1, 1);
  var planeMaterial = new THREE.MeshLambertMaterial({color : 0xc0c0c0});
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = -250;
  plane.position.z = 0;
  // add shadows
  plane.receiveShadow = true;
  // add the plane to the scene
  scene.add(plane);

  // add ambient light
  var light = new THREE.AmbientLight(0xcacaca); // soft white light
  scene.add(light);

  // add spotlight for the shadows
  var spotLight1 = new THREE.SpotLight(0xcccccc);
  spotLight1.position.set(2000, 2000, 2000);
  spotLight1.lookAt(plane);
  spotLight1.castShadow = true;
  spotLight1.shadowDarkness = 0.5;
  //spotLight1.shadowCameraVisible = true;
  spotLight1.shadowCameraNear = true;
  scene.add(spotLight1);

  // add spotlight for the shadows
  var spotLight2 = new THREE.SpotLight(0xcccccc);
  spotLight2.position.set(-1000, 1000, -1000);
  spotLight2.lookAt(plane);
  spotLight2.castShadow = true;
  spotLight2.shadowDarkness = 0.5;
  //spotLight2.shadowCameraVisible = true;
  spotLight2.shadowCameraNear = true;
  scene.add(spotLight2);
  Grid.init();

  lastTime = Date.now();
  lastGridUpdateTime = lastTime;

  animate();

  renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
  renderer.domElement.addEventListener('touchstart', onDocumentTouchStart,
                                       false);
  renderer.domElement.addEventListener('touchmove', onDocumentTouchMove, false);
}

$('#size').change(function() {
  // stop the game
  Grid.pause();

  // get rid of the old grid
  Grid.clear_grid();
  delete Grid.map;
  // render the empty grid
  renderer.render(scene, camera);

  // re-initialize
  Grid.init();
});

$('#lonely').change(function () {
    // stop the game
    Grid.pause();

    // get rid of the old grid
    Grid.clear_grid();
    delete Grid.map;
    // render the empty grid
    renderer.render(scene, camera);

    // re-initialize
    Grid.init();
});

$('#breed').change(function () {
    // stop the game
    Grid.pause();

    // get rid of the old grid
    Grid.clear_grid();
    delete Grid.map;
    // render the empty grid
    renderer.render(scene, camera);

    // re-initialize
    Grid.init();
});

$('#overcrowd').change(function () {
    // stop the game
    Grid.pause();

    // get rid of the old grid
    Grid.clear_grid();
    delete Grid.map;
    // render the empty grid
    renderer.render(scene, camera);

    // re-initialize
    Grid.init();
});

$('#effect').change(function () {
    // stop the game
    Grid.pause();
    effect = $('#effect').val();

    // get rid of the old grid
    Grid.clear_grid();
    delete Grid.map;

    clearParticles();
    clearDeadCells();

    // render the empty grid
    renderer.render(scene, camera);

    // re-initialize
    Grid.init();
});

$('#reset').click(function () {
    // stop the game
    Grid.pause();
  // get rid of the old grid
  Grid.clear_grid();
  delete Grid.map;
  delete Grid.n_live_neighbours;
  // render the empty grid
  renderer.render(scene, camera);

  // re-initialize
  Grid.init();
});

$('#injectVirus').click(function () {
    injectVirus = true;
});

var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var targetYRotation = 0;
var targetYRotationOnMouseDown = 0;
var mouseXOnMouseDown;
var mouseYOnMouseDown;
var windowHalfX = Math.floor(WIDTH);
var windowHalfY = Math.floor(HEIGHT);

// animation
function onDocumentMouseDown(event) {
  event.preventDefault();

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);

  mouseXOnMouseDown = event.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;
  mouseYOnMouseDown = event.clientY - windowHalfY;
  targetYRotationOnMouseDown = targetYRotation;
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  targetRotation =
      targetRotationOnMouseDown - (mouseX - mouseXOnMouseDown) * 0.5;

  mouseY = event.clientY - windowHalfY;
  targetYRotation =
      targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.3;
}

function onDocumentMouseUp(event) {
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentMouseOut(event) {
  document.removeEventListener('mousemove', onDocumentMouseMove, false);
  document.removeEventListener('mouseup', onDocumentMouseUp, false);
}

function onDocumentTouchStart(event) {
  if (event.touches.length == 1) {
    event.preventDefault();

    mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

    mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
    targetYRotationOnMouseDown = targetYRotation;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    targetRotation =
        targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.5;

    mouseY = event.touches[0].pageY - windowHalfY;
    targetYRotation =
        targetYRotationOnMouseDown - (mouseY - mouseYOnMouseDown) * 0.3;
  }
}

function animate() {
  var now = Date.now();

  var delta = (now - lastTime) / 1000.0;
  lastTime = now;

  var delta_gridupdate = now - lastGridUpdateTime;

  if (delta_gridupdate > $('#speed').val()) {
  //    Grid.render();
      lastGridUpdateTime = now;
  }

  requestAnimationFrame(animate);
  //
  if (effect == 0) {
      update_deadcells(delta);
      texMap = false;
  } else if (effect == 1) {
        createExplosions();
        updateExplosions(delta);
        updateFall(delta);
      texMap == false;
  } else if (effect == 2){
      texMap = true;
  } else {
      texMap = false;
  }

  renderAnim();

}

function renderAnim() {

    var t = targetRotation;
    var ty = targetYRotation;
    if (t!=0 && ty!= 0) {
        camera.position.x = WIDTH * Math.sin( t * Math.PI / 360 );
        camera.position.y = HEIGHT * Math.sin( ty * Math.PI / 360 );
        camera.position.z = (DEPTH*4) * Math.cos( t * Math.PI / 360 );
        camera.lookAt( target );
    } else if (t != 0) {
        camera.position.x = WIDTH * Math.sin( t * Math.PI / 360 );
        camera.position.z = (DEPTH*4) * Math.cos( t * Math.PI / 360 );
        camera.lookAt( target );
    } else if (ty != 0) {
        camera.position.y = HEIGHT * Math.sin( ty * Math.PI / 360 );
        camera.position.z = (DEPTH*4) * Math.cos( ty * Math.PI / 360 );
        camera.lookAt( target );
    }

	renderer.render( scene, camera );
}

function update_deadcells(dt) {
    var dy = dt*dt*9.8*2000;
    var direction = new THREE.Vector3(0, -dy, 0);
    // var axis = new THREE.Vector3(1, 0, 0);
    //console.log('delta distance ' + dy);
    var radians = dt * Math.PI/180 * 150;

    for (var i = 0; i < deadCells.length; i++) {
        var cell = deadCells[i];
        if (typeof(cell.axis) == 'undefined') {
            var x = Math.random();
            var y = Math.random();
            var z = Math.random();
            var scale = Math.sqrt(x*x + y*y + z*z);
            x = x/scale; y = y/scale; z = z/scale;
            cell.axis = new THREE.Vector3(x, y, z);
        }
        rotateAroundObjectAxis(cell, cell.axis, radians);
        cell.position.add(direction);
        // deadCells[i].geometry.verticesNeedUpdate = true;

        scene.updateMatrixWorld(true);
        var position = new THREE.Vector3();
        position.getPositionFromMatrix( cell.matrixWorld );
        //console.log("dead cell y pos " + position.y);

        if (position.y < -250) {
            scene.remove(cell);
            deadCells.splice(i, 1);
        }
    }
    renderer.render( scene, camera );
}
function clearDeadCells() {
    for (var i = 0; i < deadCells.length; i++) {
        scene.remove(deadCells[i]);
    }
    deadCells = [];
    renderer.render( scene, camera );
}

var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    object.matrix.multiply(rotObjectMatrix);

    object.rotation.setFromRotationMatrix(object.matrix);
}

function createExplosions()
{
    for (var i = 0; i < deadCells.length; i++) {
        var cell = deadCells[i];
        scene.remove(cell);
        deadCells.splice(i, 1);
        scene.updateMatrixWorld(true);
        var position = new THREE.Vector3();
        position.getPositionFromMatrix( cell.matrixWorld );
        parts.push(new ExplodeAnimation( position.x, position.y, position.z ));
    }
}

function updateExplosions(delta) {
    var pCount = parts.length;
      while(pCount--) {
        parts[pCount].update(delta);
        if (parts[pCount].checkForFall()) {
            fallingParts.push(parts[pCount]);
            parts.splice(pCount, 1);
        }
      }
      renderer.render( scene, camera );

}

function clearParticles() {
    var pCount = parts.length;
      while(pCount--) {
          parts[pCount].removeFromScene();
      }
    pCount = fallingParts.length;
      while(pCount--) {
          fallingParts[pCount].removeFromScene();
      }

      parts = [];
      fallingParts = []; // TODO: needed?
      renderer.render( scene, camera );
}

function updateFall(delta) {
    var pCount = fallingParts.length;
    while(pCount--) {
        fallingParts[pCount].updateFall(delta);
        if (fallingParts[pCount].checkForPlane()) {
            fallingParts.splice(pCount, 1);
        }
    }
    renderer.render( scene, camera );
}

//////////////settings/////////
var movementSpeed = 80;
var totalObjects = 3;
var objectSize = 30;
// var sizeRandomness = 4000;
var colors = [0xFF0FFF, 0xCCFF00, 0xFF000F, 0x996600, 0xFFFFFF];
/////////////////////////////////

function ExplodeAnimation(x,y, z)
{
  var geometry = new THREE.Geometry();

  for (i = 0; i < totalObjects; i ++)
  {
    var vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = z;

    geometry.vertices.push( vertex );
    dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
  }
  var material = new THREE.ParticleBasicMaterial( { size: objectSize,  color: colors[Math.round(Math.random() * colors.length)] });
  var particles = new THREE.ParticleSystem( geometry, material );

  this.object = particles;
  this.status = true;
  this.object.origVertex = vertex;

  this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);

  var x = Math.random();
  var y = Math.random();
  var z = Math.random();
  var scale = Math.sqrt(x*x + y*y + z*z);
  x = x/scale; y = y/scale; z = z/scale;
  this.axis = new THREE.Vector3(x, y, z);

  scene.add(this.object);

  this.update = function(dt){
    if (this.status == true){
      var pCount = totalObjects;
      while(pCount--) {
        var particle =  this.object.geometry.vertices[pCount]
        particle.y += dirs[pCount].y;
        particle.x += dirs[pCount].x;
        particle.z += dirs[pCount].z;
      }
      this.object.geometry.verticesNeedUpdate = true;
    }
  }

  this.checkForFall = function() {
    if (this.status == true){
        // Sample the first particle
        var particle =  this.object.geometry.vertices[0];
        if (Math.abs(particle.x - this.object.origVertex.x) > 1000) {
            return true;
        } else {
            return false;
        }
    }
  }

  this.updateFall = function(dt) {
      if (this.status == true){
        var pCount = totalObjects;
        var radians = dt * Math.PI/180 * 150;
        while(pCount--) {
          var particle =  this.object.geometry.vertices[pCount];
            // rotateAroundObjectAxis(this.object, this.axis, radians);
            particle.y -= dt*dt*9.8*100;
        }
        this.object.geometry.verticesNeedUpdate = true;
      }
  }

  this.checkForPlane = function() {
      if (this.status == true){
          // Sample the first particle
          var particle =  this.object.geometry.vertices[0];
          if (particle.y < -250) {
              scene.remove( this.object );
              return true;
          } else {
              return false;
          }
      }
  }

  this.removeFromScene = function() {
      scene.remove( this.object );
  }

}


$(document).ready(function() { init(); });
