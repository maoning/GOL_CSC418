3D Game Of Life
===============

#### Wooden Monkey Competition Submission by: ####
Ning Mao, Sherry Shi

This is a 3D interactive implementation of Conway's Game Of Life. 
To run the demo on localhost, run the following command:

$ python -m SimpleHTTPServer

Then go to [http://localhost:8000/gameOfLife.html](http://localhost:8000/gameOfLife.html).

A live demo is also available [here](http://neomorning.com/GOL_CSC418/gameOfLife.html).

The interactive controls include the following:
* Click and drag the screen to rotate the scene
* Map size - total number of cells on the screen
* Speed - Frame rate for the animation
* Lonely Count - A live cell with this many neighbours or less will die in the next frame due to loneliness.
* Breed Count - A dead cell with this many neighbours or more will be born in the next frame.
* Overcrowded Count - A live cell with this many neighbours or more will die in the next frame due to overcrowding.
* Virus Lifespan - The lifespan of a cell infected by a virus. Infected cells are marked with its black colour.
* Pause/Start - Pause/start the animation.
* Randomize/Reset - Reset the world with random cells.
* Inject Virus - Chooses a cell at random to infect with a virus. Infected cells turn black and will infect all its neighbours and children in the next frame.

This project is implemented using a Javascript 3D rendering framework - ThreeJS. It is a fork of [https://github.com/samlev/3DGameOfLife](https://github.com/samlev/3DGameOfLife).
Changes include:
* Added lighting and material properties using the Phong shading model
* Added shadows
* Added virus injection feature
* Added interactive user input
* Optimized backend for performance

Future developments include:
* Adding texture to cells
* Adding more motion to cells
* Adding a moving point light
* Adding physics model
