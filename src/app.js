//Imports
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';

var cytoscape = require('cytoscape');
let cola = require('cytoscape-cola');

cytoscape.use( cola ); // register extension

// Construct
const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
const apiPromise = ApiPromise.create({ provider: wsProvider });

var cy = cytoscape({
  container: document.getElementById("cy"), // container to render in

  style: [
    // the stylesheet for the graph
    {
      selector: "node",
      style: {
        "background-color": "white",
        label: "data(username)",
        color: "white",
        "text-outline-color" : "white",
      }
    },

    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#c831ff",
        "target-arrow-color": "red",
        "target-arrow-shape": "vee",
        "curve-style": "bezier",
        "arrow-scale": 2,
        "control-point-step-size": 100,
        label: "data(label)",
        color: "white",
      }
    }
  ],

  layout: {
    name: "grid",
    rows: 1
  },
  wheelSensitivity: 0.2,
});

//Not sure what this is about, I think its to animate grabing nodes.
cy.on("tap", "node", function(evt) {
  const node = evt.target;
  const color =
    node.style().backgroundColor === "hotpink" ? "blue" : "hotpink";

  node.animate(
    {
      style: {
        backgroundColor: color
      }
    },
    {
      duration: 750
    }
  );
});

//------------------------------------------------------------------------------------------------------------------------------------------------------------//
/*
function rndInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}*/

async function checkID(node_point) {
  api = await apiPromise;
  //Checking if there are usernames to use the nodes

  const reg = /(^[0x])\w/g;
  users = api.query.identity.identityOf(node_point);
  
  try {
  return users.then(identity => {
    
    if (identity.toHuman() != null ) {
      if (identity.toHuman()["info"]["display"]["Raw"] != undefined){
        if (reg.test(identity.toHuman()["info"]["display"]["Raw"]) == true) {
          return hexToString(identity.toHuman()["info"]["display"]["Raw"]);

        }else{
          return identity.toHuman()["info"]["display"]["Raw"];

        }
      }
    }
  return node_point;
  })
  } catch (error) {
    console.log(error);
  }
  
}

async function nodesCreation(){
  api = await apiPromise;
  nodes = await api.query.proxy.proxies.entries();
  proxy_actions = await api.query.proxy.announcements.entries();

  addNodePromises = [];
  var i = 0;
  //cy.startBatch();
  for (nodevar in nodes) {
    
      addNodePromises.push(nodePromise = async() => {
          const node = nodevar
          const node_point = nodes[node][0].toHuman()[0]; //nodes in graph
          const edges = nodes[node][1][0].toHuman(); //node edges/graph connections
          const id = await checkID(node_point);
          console.log("here");
          //Adding node points    
          cy.add([{
              group: "nodes",
              data: {
                  id: id
              },
              position: {
                  x: 0,
                  y: 0
              }
          }, ]);

          //And here the deleates
          for (proxy of edges) {
              cy.add([{
                  group: "nodes",
                  data: {
                      id: await checkID(proxy.delegate)
                  },
                  position: {
                      x: 0,
                      y: 0
                  }
              }, ]);
          }
      } //end promise
      );
      
  } //end for loop

  await Promise.all(addNodePromises).then(()=> {
    console.log("Nodes added");
    //cy.endBatch();
  }).catch(()=> {
    console.log("Error")
  });
}
async function edgeCreation(){
  api = await apiPromise;
  nodes = await api.query.proxy.proxies.entries();
  proxy_actions = await api.query.proxy.announcements.entries();
  console.log( await api.query.identity.identityOf(nodes));
  addNodePromises = [];
  var i = 0;
  for (node in nodes) {

    addNodePromises.push(nodePromise = async() => {

        const node_point = nodes[node][0].toHuman()[0]; //nodes in graph
        const edges = nodes[node][1][0].toHuman(); //node edges/graph connections

        //Adding edges
        
        for (proxy of edges) {
          //console.log(await checkID(proxy.delegate));
            cy.add([{
                group: "edges",
                data: {
                    id: proxy.proxyType + i++ + "\n",
                    source: await checkID(node_point),
                    target: await checkID(proxy.delegate)
                }
            }, ]);
        }

    } //end promise
    );

  } //end for loop
  await Promise.all(addNodePromises).then(()=> {
    console.log("Edges added");
  }).catch(()=> {
    console.log("Error");
  });
}
////////////////////////////////////MAIN FUNCTION //////////////////////////////////
async function draw() {
  
  api = await apiPromise;
  nodes = await api.query.proxy.proxies.entries();
  proxy_actions = await api.query.proxy.announcements.entries();//Pending actions
  
  var arrNodes = [];//Nodes
  var arrDelegates = [];//Delegates

  var proxyType = [];

  var arrUsers = [];//Usernames for Nodes
  var arrProxies = [];//Usernames for Delegates

  
  for (node in nodes) {
    const node_point = nodes[node][0].toHuman()[0]; //nodes in graph
    const edges = nodes[node][1][0].toHuman(); //node edges/graph connections
    
    //Adding node points    
    arrNodes.push(node_point);

    //And here the deleates
    let arrTemp = [];
    for (proxy of edges) {
      
      arrTemp.push(proxy.delegate);
      proxyType.push(proxy.proxyType);
    }
    arrDelegates.push(arrTemp);//2D array that has the same length as ArrNode. Thus each array in arrDelegatres represents the delegates of the same inedex in arrNodes
  }

  //Checking for usernames and placing them into arrUsers & arrProxies
  const reg = /(^[0x])\w/g;
  idNodes = await api.query.identity.identityOf.multi(arrNodes);
  idDelegates = await api.query.identity.identityOf.multi(arrDelegates.flat()); ;

  var j = 0;
  for (U of idNodes) {
    
    if (U.toHuman() != null ) {;
      if (U.toHuman()["info"]["display"]["Raw"] != undefined){
        if (reg.test(U.toHuman()["info"]["display"]["Raw"]) == true) {
          arrUsers.push(hexToString(U.toHuman()["info"]["display"]["Raw"]));
          continue;
        }else{
          arrUsers.push(U.toHuman()["info"]["display"]["Raw"]);
          continue;
        }
      }
    }
    arrUsers.push(arrNodes[j++]);
  }

  arrProxies = JSON.parse(JSON.stringify(arrDelegates));//Copying arrDelegates into arrProxies

  for(let i = 0; i < arrDelegates.length; i++){//iterate into each array
    for(let j = 0; j < arrDelegates[i].length; j++){//and each value in that array

      //check if there is a encoded username linked to the acocunt
      if (idDelegates[j].toHuman() !== null ) {
        if (idDelegates[j].toHuman()["info"]["display"]["Raw"] !== undefined){
          
          //If yes then we test if there are emojis or not (defined by having a 0x at the start)
          if (reg.test(idDelegates[j].toHuman()["info"]["display"]["Raw"]) === true) {
            arrProxies[i][j] = hexToString(idDelegates[j].toHuman()["info"]["display"]["Raw"]);
          }else{
            arrProxies[i][j] = idDelegates[j].toHuman()["info"]["display"]["Raw"];
          }//Replace the values in arrProxies
        }
      }

      if (j == arrDelegates[i].length-1) {//Okay so here it might get wierd i have wierd logic... TLDR: shift deletes values it has iterated over
        for (let index = 0; index < j; index++) {
          idDelegates.shift();
        }
      }//My logic is that i'm too lazy to try and do math to keep track of the postion we are in (like Array[0][1] = 2nd user Array[1][0] = 3rd) 
      //so I'm deleting each user that has been iterated over so that in the next array idDelegates[0] will always be == to arrProxies[i][0]
    }
  }
  console.log(arrNodes.length + " vs " + arrUsers.length);
  console.log(arrDelegates.flat().length + " vs " + arrProxies.flat().length);

  var noDupes = [...new Set(JSON.parse(JSON.stringify(arrNodes.concat( arrDelegates.flat() ))))];//New array that will contain all the users without duplicates.
  var noDupesNamed = [...new Set(JSON.parse(JSON.stringify(arrUsers.concat( arrProxies.flat() ))))];//Same thing as noDupes but with usernames
  //Just in case cytoscape doesnt handle duplicate names well I decided to just remove duplicate names and try and use that to create the nodes then the normal method to create edges.
  console.log(noDupes);
  console.log(noDupesNamed);//wierd thing here, there are less values in usernames when there should be an equal ammount as normally if you dont have a username then you keep the given address name...
  for (var n = 0; n < noDupes.length; n++) {
    //Adding nodes  
    cy.add([{
        group: "nodes",
        data: {
            id: noDupes[n],
            username: noDupesNamed[n],
        },
        position: {
            x: 100,
            y: 100
        }
    }, ]);
  }
  /*
  for (var n = 0; n < arrNodes.length; n++) {
    //Adding node points    
    cy.add([{
        group: "nodes",
        data: {
            id: arrNodes[n],
            username: arrUsers[n],
        },
        position: {
            x: 100,
            y: 100
        }
    }, ]);
  }
  for (var n = 0; n < arrDelegates.flat().length; n++) {
    //Adding Delegates    
    cy.add([{
        group: "nodes",
        data: {
            id: arrDelegates.flat()[n],
            username: arrProxies.flat()[n],
        },
        position: {
            x: 100,
            y: 100
        }
    }, ]);
  }
*/
  
  var temp = 0;//varible to keep the id of each edge unique to each other, otherwise it wont render
  for (var n = 0; n < arrUsers.length; n++) {
    //Here the edges
    for (D of arrDelegates[n]) {
      //console.log("source : " + arrUsers[n] + " delegates : " + D + " proxyType :" + proxyType[n]);
      cy.add([{
        group: "edges",
        data: {
            id: temp.toString() ,
            label: proxyType[n],
            source: arrNodes[n],
            target: D
        }
      }, ]);
      temp++;
    }
  }

/*
  var i = 0;

  for (node in nodes) {
    const node_point = nodes[node][0].toHuman()[0]; //nodes in graph
    const edges = nodes[node][1][0].toHuman(); //node edges/graph connections

    //Adding node points    
    cy.add([{
        group: "nodes",
        data: {
            id: await checkID(node_point)
        },
        position: {
            x: 0,
            y: 0
        }
    }, ]);

    //And here the deleates
    for (proxy of edges) {
        cy.add([{
            group: "nodes",
            data: {
                id: await checkID(proxy.delegate)
            },
            position: {
                x: 0,
                y: 0
            }
        }, ]);
    }
    //Here the edges
    for (proxy of edges) {

                cy.add([{
                    group: "edges",
                    data: {
                        id: proxy.proxyType + i++ + "\n",
                        source: await checkID(node_point),
                        target: await checkID(proxy.delegate)
                    }
                }, ]);
    }

      }//end for loop


  //await nodesCreation();
  //await edgeCreation();

  */
  lay();
}

//Layout option "cola", thanks maxkfranz. https://github.com/cytoscape/cytoscape.js-cola
function lay() {
  var layout = cy.layout({
    name: 'cola',
    ungrabifyWhileSimulating: true,
    boundingBox: { x1:0, y1:0, x2:8000, y2:2000 },
    nodeDimensionsIncludeLabels: true,
    randomize: true,
    edgeLength: 1000, // sets edge length directly in simulation
    nodeSpacing: function( node ){ return 50; },
    maxSimulationTime: 6000,
  });

  layout.run();
  cy.center();
  cy.fit();
};

//Search function that uses searchbar input. Add reset of searchbar? Add choice between search for username or public address.
async function Search() {
  const searchTerm = document.getElementById("searchTerm").value;
  const id = await checkID(searchTerm);
  cy.fit(cy.$('#'+searchTerm), 200);
  /*cy.zoom({
    level: 0.5,
    position: cy.$('#'+ searchTerm).position()
  });*/
  console.log("search Attempt for " + searchTerm + " Found " + id );
}


// event listeners for functions
const Fdraw = document.getElementById("draw");
Fdraw.addEventListener("click", draw);
const Fcola = document.getElementById("cola");
Fcola.addEventListener("click", lay);
const FsearchTerm = document.getElementById("searchButton");
FsearchTerm.addEventListener("click", Search);

/*
line-style : The style of the edge’s line; may be solid, dotted, or dashed.
*/

/*proxies (“delegates”) should have an indication of pending announcements they’ve made on their proxied accounts (nodes)
Delegate actions? ie Action name + Delay

query api.query.proxy.announcement(address) for every delegate with a delay ***wdym with a delay?*** (if delay, query this) -
when a related edge or node is selected, display info (number of announcements, call hashes, permissions, time to the delay being executable) on the sidebar
external links

for each node, have links in the sidebar to chain explorers??? and other analytics platforms when they are selected -
when an edge is selected, we display those links and identity information for the nodes on both sides of the edge.
*/