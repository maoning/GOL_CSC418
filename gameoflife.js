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
            this.pos_x = this.x * 2;
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
                      if (this.is_alive(i, j, k)) {this.update_neighbours(i, j, k, true); }
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
    is_alive : function(x, y, z) { return this.map[x][y][z]; },
    update_neighbours:
        function(x, y, z, alive) {
          // get the min and max to search, respecting the grid boundries
          var min_x = (x > 0 ? x - 1 : x);
          var max_x = (x < this.x - 1 ? x + 1 : x);
          var min_y = (y > 0 ? y - 1 : y);
          var max_y = (y < this.y - 1 ? y + 1 : y);
          var min_z = (z > 0 ? z - 1 : z);
          var max_z = (z < this.z - 1 ? z + 1 : z);

          // initialise the number of neighbors
          var neighbours = 0;

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
                    this.n_live_neighbours[i][j][k]++;
                  }
                  else {
                    this.n_live_neighbours[i][j][k]--;
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
          var max_x = (x < this.x - 1 ? x + 1 : x);
          var min_y = (y > 0 ? y - 1 : y);
          var max_y = (y < this.y - 1 ? y + 1 : y);
          var min_z = (z > 0 ? z - 1 : z);
          var max_z = (z < this.z - 1 ? z + 1 : z);

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
            var max_x = (x < this.x-1 ? x+1: x);
            var min_y = (y > 0 ? y-1 : y);
            var max_y = (y < this.y-1 ? y+1: y);
            var min_z = (z > 0 ? z-1 : z);
            var max_z = (z < this.z-1 ? z+1: z);

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
            var max_x = (x < this.x-1 ? x+1: x);
            var min_y = (y > 0 ? y-1 : y);
            var max_y = (y < this.y-1 ? y+1: y);
            var min_z = (z > 0 ? z-1 : z);
            var max_z = (z < this.z-1 ? z+1: z);

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
            var newmap = [];

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
                        if (cell) {
                            if (typeof cell.infected !== 'undefined') {
                                // console.log("this cell is infected [" + cell.infected.lifespan + "]");
                                if (cell.infected.lifespan > 0) {
                                    this.infectNeighbours(i,j,k);
                                }
                            }
                            // is the cell lonely or overcrowded?
                            if (n <= this.th.lonely || n >= this.th.overcrowd) {
                                // kill the cell off
                                scene.remove(cell);
                                this.update_neighbours(i, j, k, false);
                            } else if (typeof cell.infected !== 'undefined' && cell.infected.lifespan == 0) {
                                scene.remove(cell);
                                this.update_neighbours(i, j, k, false);
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

                                this.update_neighbours(i, j, k, true);

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
            if (injectVirus == false) {
                var color = 0x000000;
                // set a base colour, which won't be black, and is somewhat based on
                // position
                var color_r = (Math.random() * x / this.x) * 0xf4 + 8;
                var color_g = (Math.random() * y / this.y) * 0xf4 + 8;
                var color_b = (Math.random() * z / this.z) * 0xf4 + 8;

                color = (color_r << 16) + (color_g << 8) + color_b;
            } else {
                var color = 0x000000;
            }
            var geometry = new THREE.BoxGeometry(this.cube_w, this.cube_h,
                                                 this.cube_d, 1, 1, 1);
            // var material = new THREE.MeshLambertMaterial( {color: color} );
            var material = new THREE.MeshPhongMaterial({
              color : color,
              specular : 0xcccccc,
              shininess : 100,
              shading : THREE.FlatShading
            });
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
                  ambient : color,
                  diffuse : 0xcccccc,
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
var injectVirus = false;

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

$('#reset').click(function () {
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
  requestAnimationFrame(animate);
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

$(document).ready(function() { init(); });
