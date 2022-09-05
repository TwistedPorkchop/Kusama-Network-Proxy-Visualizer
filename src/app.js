//Imports
import { ApiPromise, WsProvider } from '@polkadot/api';
import { hexToString } from '@polkadot/util';

var cytoscape = require('cytoscape');
let fcose = require('cytoscape-fcose');

cytoscape.use( fcose ); // register extension

// Construct
const wsProvider = new WsProvider('wss://kusama-rpc.polkadot.io');
const apiPromise = ApiPromise.create({ provider: wsProvider });
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var preSearch = urlParams.get("s")?urlParams.get("s"):"";
const explorers = [
  "https://sub.id/",
  "https://kusama.subscan.io/account/",
  "https://explorer.polkascan.io/kusama/account/",
  "https://kusama.polkaholic.io/account/",
]
const explorerNames = [
  "Sub.ID (Multichain)",
  "Subscan (Kusama)",
  "Polkascan (Kusama)",
  "Polkaholic (Multichain)"
]

// main startup
async function main () {
  api = await apiPromise;
  autoupdate = api.query.proxy.proxies.entries(async (nodes) => {
    nodes.sort((a, b) => {
      return a[0].toHuman[0] - b[0].toHuman[0];
    });
    await draw(nodes);
  });
  autoannoncements = api.query.proxy.announcements.entries(async (announcements) => {
    console.log(announcements);
    await draw();
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
      selector: ".background",
      style: {
        "ghost": 'yes',
        "opacity": 0.1
      }
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "data(color)",
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
    name: "preset",
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
  const related = node.openNeighborhood();
  const relrel = node.closedNeighborhood().closedNeighborhood();
  const notrelrel = cy.elements().not(relrel);
  notrelrel.addClass("background");
  relrel.removeClass("background");
  sidebar_display(node, related);
});

function sidebar_display(node, related){
  sidebar = document.getElementById("sidebar");
  sidebar.textContent = "";
  // populate sidebar with node data
  accountElement = document.createElement("account");
  relatedElement = document.createElement("related");
  lastElement = document.createElement("related");
  
  lastElement.style.float = "left";
  
  sidebar.appendChild(accountElement);
  sidebar.appendChild(relatedElement);
  sidebar.appendChild(lastElement);

  objectToDomElement(accountElement, node.data());
  related.map((x) => {
    if(!x.isEdge()){
        objectToDomElement(relatedElement, x.data());
      }
  });
  const allElements = document.getElementsByTagName("object");
  for (let i = 0; i < allElements.length; i++){
    const element = allElements.item(i);
    // each object should either represent an account/node OR
    // an "additional" identity value - we determine which we 
    // are looking at by checking the first subelement.
    firstChild = element.firstElementChild
    if (firstChild.tagName == "ID"){
      element.style.width = "inherit";
      const nodeAddress = firstChild.innerText;
      firstChild.innerText = '\n' + firstChild.innerText + '\n';
      firstChild.addEventListener("click", (evt) => {
        cy.$("*").unselect();
        const clickedNode = cy.$id(nodeAddress);
        clickedNode.select();
        cy.zoom({
          level: 0.4,
          position: clickedNode.position()
        });
        const existingLinks = document.getElementById("links");
        linksDiv = existingLinks?existingLinks:document.createElement("div");
        linksDiv.innerHTML = "";
        linksDiv.id = "links";
        lastElement.appendChild(linksDiv);
        for (index in explorers){
          explorerLink = document.createElement("a");
          explorerLink.href = explorers[index] + nodeAddress;
          explorerLink.innerText = explorerNames[index];
          linksDiv.appendChild(explorerLink);
        }
      })
      identityElement = element.getElementsByTagName("identity").item(0);

    }
    if (firstChild.tagName == "OBJECT"){

    }
    if (firstChild.tagName == "RAW"){

    }
  };
  
}

// recursive function translates an object into a dom tree
// { key: "value" } == "<key>value</key>"
// we can create CSS styles for these individual key/components
// recursive logic looks redundant but look, it seems to break
// if I don't do it this way so...
function objectToDomElement(parent, object, objectTag=false){
  var documentObject = document.createElement(objectTag?objectTag:typeof object);
  if(object instanceof Object){
    if(object instanceof Array){
      for( element of object ){
        documentObject.append(objectToDomElement(documentObject, element));
      }
    } else {
      for( [key, element] of Object.entries(object)){
        documentObject.append(objectToDomElement(documentObject, element, key));
      }
    }
  } else {
    objectText = object?object.toString():"";
    documentObject.innerText = objectText;
  }
  parent.append(documentObject);
  return documentObject;
}


//------------------------------------------------------------------------------------------------------------------------------------------------------------//

function onCirc(seedAngle=null) {
  var angle = seedAngle*Math.PI?seedAngle:Math.random()*Math.PI*2;
  return [Math.cos(angle), Math.sin(angle)]; //The maximum is exclusive and the minimum is inclusive
}

function procColor(seed) {
  return "#" +
    ("00000" + Math.floor(onCirc(seedAngle=seed)[0] * Math.pow(16, 6))
      .toString(16))
      .slice(-6);
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
      [newX, newY] = onCirc(seedAngle=idRequests.length);
      cy.add(
        {
          group: "nodes",
          data: { 
            id: node_point,
            label: node_point
          },
          position: {
            x: 10*newX*(cy.width()/5+idRequests.length)+cy.width(),
            y: 10*newY*(cy.height()/5+idRequests.length)+cy.height(),
          }
        }
      );
      idRequests.push(node_point);
    };
    for ([index, delegate] of delegates.entries()) {
      if(cy.$id(delegate.delegate).length == 0){
        [newX, newY] = onCirc(seedAngle=index);
        cy.add(
          {
            group: "nodes",
            data: { 
              id: delegate.delegate,
              label: delegate.delegate,
            },
            position: {
              x: cy.$id(node_point).position("x")+newX*(cy.width()/4+index),
              y: cy.$id(node_point).position("y")+newY*(cy.height()/4+index)
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
          delay: delegate.delay,
          color: procColor(index)
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
            [newX, newY] = onCirc(seedAngle=index);
            cy.add([
              {
                group: "nodes",
                data: { 
                  id: superId[0],
                  label: superId[0]
                },
                position: {
                  x:  cy.$id(idRequests[index]).position("x")+newX*(cy.width()/4+index),
                  y:  cy.$id(idRequests[index]).position("y")+newY*(cy.height()/4+index)
                },
              }
            ]);
            //if superId is not in graph, after we add it to graph, 
            //we add it to the next round for identification, 
            //followed by it's child
            pendingIdRequests.push(superId[0]);
            pendingIdRequests.push(idRequests[index]);
            // add edge to superID
            superEdgeId = idRequests[index]+superId[0]+"superidentity";
            existingNode = cy.$id(superEdgeId);
            if(existingNode.length == 0)cy.add({
              group: "edges",
              data: {
                id: idRequests[index]+superId[0]+"superidentity",
                label: "Super Identity",
                source: idRequests[index],
                target: superId[0],
                color: procColor(index)
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
  cy.$("*").unselect();
  elem.select();
  //cy.fit(cy.$('#'+searchTerm));
  cy.zoom({
    level: 1.5,
    position: elem.position()
  });
  console.log("search Attempt for " + searchTerm + " Found " + label );
}

// event listeners for functions
const FsearchTerm = document.getElementById("searchButton");
FsearchTerm.addEventListener("click", Search);


function lay() { 
  var layout = cy.layout({
    name: 'fcose',
    quality: "default",
    randomize: false,
    animate: true,
    animationDuration: 2000,
    ungrabifyWhileSimulating: true,
    packComponents: false,
    nodeRepulsion: function( node ){ 
      const repulsionVal = 10000 / node.closedNeighborhood().size();
      return repulsionVal; 
    },
    samplingType: true,
    sampleSize: 10,
    nodeSeparation: 100,
    idealEdgeLength: function(edge){ 
      lengthval =  500 / edge.source().closedNeighborhood().size();
      return lengthval;
    },
    edgeElasticity: edge => 0.4,
    gravity: 0.05,
    gravityRange: 3,
    boundingBox: { x1:0, y1:0, w:cy.width(), h:cy.height() },
    nodeDimensionsIncludeLabels: true,
    // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
    numIter: 6500,
    // For enabling tiling
    tile: false,
    // Initial cooling factor for incremental layout  
    initialEnergyOnIncremental: 0.4,
    stop: () => {
      if(preSearch){
        document.getElementById("searchTerm").value = preSearch;
        preSearch = false;
        Search();
      } else {
        cy.$(':selected').select();
      }
    },
  });

  layout.run(); 
  cy.fit();
  cy.center();
};
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
