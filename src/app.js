//Imports
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';

var cytoscape = require('cytoscape');
let cola = require('cytoscape-cola');

cytoscape.use( cola ); // register extension

// Construct
const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
const apiPromise = ApiPromise.create({ provider: wsProvider });

// main startup
async function main () {
  api = await apiPromise;
  pre_nodes = await api.query.proxy.proxies.entries();
  await draw(pre_nodes);
  autoupdate = api.query.proxy.proxies.entries(async (nodes) => {
    await draw(nodes);
  });
};

window.addEventListener('load', async (event) => {
  await main();
});

var cy = cytoscape({
  container: document.getElementById("cy"), // container to render in

  style: [
    // the stylesheet for the graph
    {
      selector: "node",
      style: {
        "background-color": "white",
        label: "data(label)",
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
    name: "cola",
  },
  wheelSensitivity: 0.2,
});

console.log("hello");
//Layout option "cola", thanks maxkfranz. https://github.com/cytoscape/cytoscape.js-cola
function layJ() {
  var layout = cy.layout({
    name: "cola",
    animate: true, // whether to show the layout as it's running
    refresh: 10, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 6000, // max length in ms to run the layout
    ungrabifyWhileSimulating: true, // so you can't drag nodes during layout
    fit: true, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    boundingBox: {x1: 0, x2: 0, w: cy.width(), h: cy.height()}, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
  
    // layout event callbacks
    ready: function(){}, // on layoutready
    stop: function(){}, // on layoutstop
  
    // positioning options
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    convergenceThreshold: 0.03, // when the alpha value (system energy) falls below this value, the layout stops
    nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
    flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
    gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
    centerGraph: false, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)
  
    // different methods of specifying edge length
    // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: function( edge ){ return cy.width()/5; }, // sets edge length directly in simulation
    edgeSymDiffLength: function( edge ){ return cy.width()/3; }, // symmetric diff edge length in simulation
    edgeJaccardLength: undefined, // jaccard edge length in simulation
  
    // iterations of cola algorithm; uses default values on undefined
    unconstrIter: undefined, // unconstrained initial layout iterations
    userConstIter: undefined, // initial layout iterations with user-specified constraints
    allConstIter: undefined, // initial layout 
  });
  layout.run();
  cy.center();
  cy.fit();
}

function lay() {
  var layout = cy.layout({
    name: 'cola',
    ungrabifyWhileSimulating: true,
    boundingBox: { x1:0, y1:0, x2:8000, y2:2000 },
    nodeDimensionsIncludeLabels: true,
    randomize: false,
    edgeLength: 1000, // sets edge length directly in simulation
    nodeSpacing: function( node ){ return 50; },
    maxSimulationTime: 6000,
  });

  layout.run();
  cy.center();
  cy.fit();
};

/*
cy.on("layoutstop", async (event) => {
    await draw();
});
*/

//Node selection logic
cy.on("select", "node", function(evt) {
  const node = evt.target;
  sidebar_display(node.data());
});

function sidebar_display(node_data){
  document.getElementById("sidebar");
  console.log(node_data);
  // populate sidebar with node data
}


//------------------------------------------------------------------------------------------------------------------------------------------------------------//

function rndInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function onCirc(rad, seedAngle=null) {
  var angle = seedAngle?seedAngle:Math.random()*Math.PI*2;
  return [Math.cos(angle)*rad, Math.sin(angle)*rad]; //The maximum is exclusive and the minimum is inclusive
}

////////////////////////////////////MAIN FUNCTION //////////////////////////////////
// refactored to be an async generator function that can be called repeatedly to add
// or remove nodes from the graph
var pendingIdRequests = [] // universal scope pending ids (previous round supers and manually requested)
async function draw(nodes, nodes_remove=[]){
  
  const api = await apiPromise;
  proxy_actions = await api.query.proxy.announcements.entries();//Pending actions
  var idRequests = pendingIdRequests;
  pendingIdRequests = [];

  for (const node in nodes) {
    const node_point = nodes[node][0].toHuman()[0]; //nodes in graph
    const delegates = nodes[node][1][0].toHuman(); //node edges/graph connections

    if(cy.$id(node_point).length == 0){
      // I want node positions to be mostly deterministic so that people can
      // look in roughly the same spot for the same thing across reloads
      [newX, newY] = onCirc(cy.height(), seedAngle=idRequests.length);
      cy.add(
        {
          group: "nodes",
          data: { 
            id: node_point,
            label: node_point
          },
          position: {
            x: newX-rndInt(50,100),
            y: newY-rndInt(50,100),
          }
        }
      );
      idRequests.push(node_point);
    };
    for (delegate of delegates) {
      if(cy.$id(delegate.delegate).length == 0){
        cy.add(
          {
            group: "nodes",
            data: { 
              id: delegate.delegate,
              label: delegate.delegate,
            },
            position: {
              x: cy.$id(node_point).position("x")+rndInt(-100,100),
              y: cy.$id(node_point).position("y")+rndInt(-100,100)
            }
          }
        );
        idRequests.push(delegate.delegate);
      };
      edgeId = delegate.delegate+node_point+delegate.proxyType;
      if(cy.$id(edgeId).length == 0)cy.add({
        group: "edges",
        data: {
          id: edgeId,
          label: delegate.proxyType,
          source: delegate.delegate,
          target: node_point,
        },
      });
    }
  }
  
  const reg = /(^[0x][0-9a-fA-F]*)\w/g;

  //check for pending idRequests (added to graph global data in cy.on for adding nodes)
  api.query.identity.identityOf.multi(idRequests).then(async (results) => {
    var superIds = await api.query.identity.superOf.multi(idRequests);
    var output = [];

    for(const [index, identity] of results.entries()){
      output.push([index, identity, superIds[index]])
    }

    return output;
  }).then(async (results) => {

    for (const [index, identity, superIdResponse] of results) {

      if(identity.toHuman()){
        identityJson = identity.toHuman();
        nametext = 
          reg.test(identityJson["info"]["display"]["Raw"])?
          hexToString(identityJson["info"]["display"]["Raw"]):
          identityJson["info"]["display"]["Raw"];

        cy.$id(idRequests[index]).data("label", nametext);
        cy.$id(idRequests[index]).data("identity", identityJson);
      } else {

        superId = superIdResponse.toHuman();
        if(superId){
          var parsedSuperId = 
            reg.test(superId[1]["Raw"])?
            hexToString(superId[1]["Raw"]):
            superId[1]["Raw"];

          if(cy.$id(superId[0])){
            nametext = cy.$id(superId[0]).data("label")+"/"+parsedSuperId;

          } else {
            nametext = idRequests[index];
            cy.add(
              {
                group: "nodes",
                data: { 
                  id: superId[0],
                  label: superId[0]
                },
                position: {
                  x: rndInt(0, 2000),
                  y: rndInt(0, 2000)
                },
              }
            );
            //if superId is not in graph, after we add it to graph, 
            //we add it to the next round for identification, 
            //followed by it's child
            pendingIdRequests.push(superId[0]);
            pendingIdRequests.push(idRequests[index]);
            cy.add({
              group: "edges",
              data: {
                id: idRequests[index]+superId[0]+"superidentity",
                label: "Super Identity",
                source: idRequests[index],
                target: superId[0],
              },
            });
          }
        } else {
          nametext = idRequests[index];
        }
    }
        cy.$id(idRequests[index]).data("label", nametext);
    }
  });

  //lay();
}

//Search function that uses searchbar input. Add reset of searchbar? Add choice between search for username or public address.
async function Search() {
  const searchTerm = document.getElementById("searchTerm").value;
  const elem = cy.$('#'+ searchTerm);
  const label = elem.data("label");
  //cy.fit(cy.$('#'+searchTerm));
  cy.zoom({
    level: 0.5,
    position: elem.position()
  });
  console.log("search Attempt for " + searchTerm + " Found " + label );
}

// event listeners for functions
const FsearchTerm = document.getElementById("searchButton");
FsearchTerm.addEventListener("click", Search);
const Freset = document.getElementById("reset");
Freset.addEventListener("click", lay);

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