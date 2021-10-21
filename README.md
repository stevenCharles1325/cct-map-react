# 3D VIRTUAL LOCATOR FOR CITY COLLEGE OF TAGAYTAY


### `TECH-STACK`

- Mongo DB
- Express
- React JS
- Node JS


### `PURPOSE`

This web-application is devised for City College of Tagaytay,
and is called the "**3D VIRTUAL LOCATOR FOR CITY COLLEGE OF TAGAYTAY**"


### `INTRODUCTION`

This application has two sides; The first side is the "_USER-SIDE_" and
the "_ADMINISTRATOR-SIDE_". The **USER-SIDE**, which contains the _path-finding_
algorithm, only allows normal users (Students, Visitors, School personnel, Enrollees, etc.) 
to see the 3D virtual locator and search for pre-defined location inside 
the building. The **ADMINISTRATOR-SIDE** automatically detects if there is an
existing admin, and if there is then it will prompt the sign-in view, 
otherwise the sign-up view will be prompted. The administrator-side will
allow its user to modify some information like the Checkpoint's properties,
and import 3D building's properties, and his/her information. The administrator 
can also import a 3D object.

The algorithm used for Path-finding is the [_Breadth-first search algorithm_](https://en.wikipedia.org/wiki/Breadth-first_search), which is the easiest way to obtain the shortest path 
between point-a and point-b. Data-structures like Graphs and Trees uses nodes,
but for this web-application we call [_Node_](https://en.wikipedia.org/wiki/Node_(computer_science)) a _Checkpoint_. A _Checkpoint_ is very similar to a Node, but the only difference is that Checkpoint
has two types. The two types of Checkpoint are the _Connector_ and _Non-connector_ checkpoint.
A _Non-connector_ checkpoints serves as a named space inside our 3D world and
automatically links itself to the nearest connector, while a _Connector_ 
checkpoint serves as a link between two non-connector checkpoints. 

The way to tell this application that a checkpoint is a connector type is by
naming it as a connector

> Example: connector

But a connector must always have a unique number by the end of it, and with no spaces.

> Example: connector1

And to tell a connector which to connect itself is by following the example below.

> Example: connector-\[2,3\]

The example above says that **CONNECTOR1** is connected to **CONNECTOR2**, and **CONNECTOR3**, thus
**CONNECTOR2** and **CONNECTOR3** are connected to **CONNECTOR1**, but that does not mean **CONNECTOR2**
is connected to **CONNECTOR3**. 


### `TAKE A LOOK`

###### `USER-SIDE`

![User-side](https://drive.google.com/uc?export=view&id=1Waea1Yv2EElZfF7omssMmG2_kFBVnkLE)


###### `ADMINISTRATOR-SIDE`

![Administrator-side](https://drive.google.com/uc?export=view&id=1hox7fQwbXyNM6RLUEoOVjNuNdz6-LKGg)


### `HOW TO DOWNLOAD THIS APPLICATION?`

This assumes that you already have installed [_Nodejs_](https://nodejs.org/en/) and [_Git cli_](https://git-scm.com/downloads).


#### Follow me!

On your terminal type these commands.
```

git clone https://github.com/stevenCharles1325/cct-map-react.git

cd cct-map-react

npm install

```

After the installation, follow the next step.

```

cd client 

npm install

```

And Viola, 3d virtual locator for City College of Tagaytay is now downloaded!


For personal questions please contact me on my email address: stevencharles1325@gmail.com 






