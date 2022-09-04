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
console.log(urlParams);


// main startup
async function main () {
  api = await apiPromise;
  autoupdate = api.query.proxy.proxies.entries(async (nodes) => {
    nodes.sort((a, b) => {
      return a[0].toHuman[0] - b[0].toHuman[0];
    });
    await draw(nodes);
    console.log(preSearch);
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
  
  sidebar.appendChild(accountElement);
  sidebar.appendChild(relatedElement);

  objectToDomElement(accountElement, node.data());
  related.map((x) => {
    if(!x.isEdge()){
        objectToDomElement(relatedElement, x.data());
      }
    });
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
  var idRequests = pendingIdRequests
  pendingIdRequests = []
  cy.startBatch();
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
        console.log(superId);
        if(superId){
          var parsedSuperId = 
            reg.test(superId[1]["Raw"])?
            hexToString(superId[1]["Raw"]):
            superId[1]["Raw"];
          if(!cy.$id(superId[0]).length == 0){
            nametext = cy.$id(superId[0]).data("label")+"/"+parsedSuperId;
            superEdgeId = idRequests[index]+superId[0]+"superidentity";
            existingNode = cy.$id(superEdgeId);
            if(existingNode.length == 0)cy.add({
              group: "edges",
              data: {
                id: superEdgeId,
                label: "Super Identity",
                source: idRequests[index],
                target: superId[0],
                color: procColor(index)
              },
            });
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
  cy.endBatch();
  //console.log("executing layout");
  lay();
}

//Search function that uses searchbar input. Add reset of searchbar? Add choice between search for username or public address.
async function Search() {
  const searchTerm = document.getElementById("searchTerm").value;
  const elem = cy.$('#'+ searchTerm);
  const label = elem.data("label");
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
