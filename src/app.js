//Imports
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToString, hexToString } from '@polkadot/util';

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
        label: "data(id)",
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
        //label: "data(id)",
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
  users = api.query.identity.identityOf(node_point)
  
  return users.then(identity => {
    
    if (identity.toHuman() != null && identity.toHuman()["info"]["display"]["Raw"] != undefined) {
      if (reg.test(identity.toHuman()["info"]["display"]["Raw"]) == true) {
        return hexToString(identity.toHuman()["info"]["display"]["Raw"]);

      }else{
        return identity.toHuman()["info"]["display"]["Raw"];

      }
    }
  return node_point;
  })
}

async function draw() {

  api = await apiPromise;
  nodes = await api.query.proxy.proxies.entries();
  proxy_actions = await api.query.proxy.announcements.entries();

  addNodePromises = [];
  var i = 0;
  for (node in nodes) {

      nodePromise = async() => {

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

          //Adding edges
          
          for (proxy of edges) {
            //console.log(i);
              cy.add([{
                  group: "edges",
                  data: {
                      id: proxy.proxyType + i++ + "\n",
                      source: await checkID(node_point),
                      target: await checkID(proxy.delegate)
                  }
              }, ]);
          }

      }; //end promise
      addNodePromises.push(nodePromise());

  } //end for loop
  await Promise.all(addNodePromises);
  lay();
}

//Layout option "cola", thanks maxkfranz. https://github.com/cytoscape/cytoscape.js-cola
function lay() {
  var layout = cy.layout({
    name: 'cola',
    ungrabifyWhileSimulating: true,
    boundingBox: { x1:0, y1:0, x2:3000, y2:1500 },
    nodeDimensionsIncludeLabels: true,
    randomize: true,
    edgeLength: 100, // sets edge length directly in simulation
    nodeSpacing: function( node ){ return 100; },
    maxSimulationTime: 6000,
  });

  layout.run();
  cy.center();
  cy.fit();
};

//Search function that uses searchbar input. Add reset of searchbar? Add choice between search for username or public address.
function Search() {
  const searchTerm = document.getElementById("searchTerm").value;

  //cy.fit(cy.$('#'+searchTerm));
  cy.zoom({
    level: 0.5,
    position: cy.$('#'+searchTerm).position()
  });
  console.log("search Attempt");
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