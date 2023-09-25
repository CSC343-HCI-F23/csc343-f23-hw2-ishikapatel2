export default class GraphClass {
    constructor() {
      this.graph = {
        nodes: [],
        edges: [],
        nodeDegrees: {}
      };
    }
    // Problem 6a) Compute average node degree
    computeAverageNodeDegree() {
      let sum = 0;
      let count = 0;
      for (const [key, value] of Object.entries(this.graph.nodeDegrees)) {
        sum += value;
        count += 1;
      }
      return sum/count;
    }

    // Problem 6b) Number of connected components
    computeConnectedComponents() {
      let sum = 0;
      for(const [key, value] of Object.entries(this.graph.nodeDegrees)) {
        if (value%2 == 0 && value !== 0) {
          sum += 1;
        }
      } 
      return sum;
    }

    // Problem 6c) Compute graph density
    computeGraphDensity() {
      const nodesCount = this.graph.nodes.length;
      const edgesCount = this.graph.edges.length;
      const graphDensity = (2 * edgesCount) / (nodesCount * (nodesCount - 1));
      return graphDensity;
    }
    
}
