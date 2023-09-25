// import the GraphClass definiton from GraphClass.js
import GraphClass from './GraphClass.js'; 

const newlyAddedNodes = [];
const selectedNodes = [];

/*
    Adds new node on double click
*/
function addNode(event) {
    const [x, y] = d3.pointer(event);
    const newNode = {
        id: `newNode${Date.now()}`,
        x: x,
        y: y,
        isNew: true
    };
    newlyAddedNodes.push(newNode); 
    graphObj.graph.nodes.push(newNode); 
    graphObj.graph.nodeDegrees[newNode.id] = 0;
    renderGraph(graphObj.graph); 
}

/*
    Updated new edge information to the graph object
*/
function addEdge(sourceNode, targetNode) {
    const newEdge = { source: sourceNode.id, target: targetNode.id };
    graphObj.graph.edges.push(newEdge);
    graphObj.graph.nodeDegrees[sourceNode.id] = (graphObj.graph.nodeDegrees[sourceNode.id] || 0) + 1;
    graphObj.graph.nodeDegrees[targetNode.id] = (graphObj.graph.nodeDegrees[targetNode.id] || 0) + 1;

    renderGraph(graphObj.graph);
}

/*
    Given some JSON data representing a graph, render it with D3
*/

function renderGraph(graphData) {
    d3.select("svg").remove();

    const width = screen.width;
    const height = screen.height;
  
    const svg = d3.select("#graphviz").append("svg")
        .attr("width", '100%')
        .attr("height", '100%')
        .attr("viewBox",'0 0 ' + width + " " + height);
 
        svg.on("dblclick", addNode);

    // takes care of the repulsion - utilized ChatGPT for this 
    const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.edges).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(node => {
            const nodeDegree = graphData.nodeDegrees[node.id];
            if (!nodeDegree || nodeDegree === 0) {
                return -10;
            } else {
                return -20;
            }
        }))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("boundary", boundingBoxForce(graphData, width, height));

    

    // creates edges (links) between nodes
    const link = svg.selectAll(".link")
        .data(graphData.edges)
        .enter().append("line")
        .attr("class", "link");
 
    // creates nodes
    const node = svg.selectAll(".node")
        .data(graphData.nodes.concat(newlyAddedNodes))  
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 9)
        .attr("fill", d => d.isNew ? "red" : "black")
        .on("click", (event, d) => {  // <-- Add this click event
            if (selectedNodes.length < 2) {
                selectedNodes.push(d);
                d3.select(event.currentTarget).attr("fill", "blue");
            }
            
            if (selectedNodes.length === 2) {
                addEdge(selectedNodes[0], selectedNodes[1]);
                selectedNodes.length = 0;  // Clear the array
                d3.selectAll(".node").attr("fill", d => d.isNew ? "red" : "black");  // Reset the node color
            }
        })
        .call(d3.drag()

            // utilized ChatGPT for this 
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }));


    
    simulation.nodes(graphData.nodes.concat(newlyAddedNodes)).on("tick", () => {
        link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

        node
        node.attr("cx", function (d) {
        return d.x = Math.max(20, Math.min(width - 20, d.x));
        })
        .attr("cy", function (d) {
            return d.y = Math.max(20, Math.min(height - 20, d.y));
        });
    });

  simulation.force("link").links(graphData.edges);
}

function boundingBoxForce(graphData,width,height) {
    for (let node of graphData.nodes) {
        node.x = Math.max(15, Math.min(width - 5, node.x));
        node.y = Math.max(15, Math.min(height - 5, node.y)); 
    }
}

/*
    Function to fetch the JSON data from output_graph.json & call the renderGraph() method
    to visualize this data
*/
function loadAndRenderGraph(fileName) {
    fetch(fileName)
    .then(response => response.json())
    .then(data => {
        graphObj.graph = data;

        // Combine the existing nodes with the newly added ones before rendering
        const combinedData = {
            nodes: graphObj.graph.nodes.concat(newlyAddedNodes),
            edges: graphObj.graph.edges,
            nodeDegrees: graphObj.graph.nodeDegrees  // You'll want to update this dynamically when you add nodes
        };

        renderGraph(data);
        document.getElementById("computeStats").addEventListener("click", function() {
            // compute and display simple statistics on the graph
            displayGraphStatistics(graphObj);
        });
 
        console.log("Fetched graphData:");
        console.log(graphObj.graph);
    })
    .catch(err => console.log("Error reading the file: ", err));
}

/*
    A method to compute simple statistics (Programming part Subproblem 6)
    on updated graph data
*/
function displayGraphStatistics(graphObj) {
    const avgDegree = graphObj.computeAverageNodeDegree();
    const numComponents = graphObj.computeConnectedComponents();
    const graphDensity = graphObj.computeGraphDensity();

    document.getElementById('avgDegree').textContent = avgDegree.toFixed(3);
    document.getElementById('numComponents').textContent = numComponents; 
    document.getElementById('graphDensity').textContent = graphDensity.toFixed(4);
}

// instantiate an object of GraphClass
let graphObj = new GraphClass();

// your saved graph file from Homework 1
let fileName="output_graph.json"

// render the graph in the browser
loadAndRenderGraph(fileName);

// compute and display simple statistics on the graph
displayGraphStatistics(graphObj);


