const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');

class NASAAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.nasa.gov'
  }

  async getApod() {
    return await this.get(
        `planetary/apod?api_key=${process.env.NASA}`);
  }

  async getNEOs() {
    return await this.get(
        `neo/rest/v1/feed/today?detailed=false&api_key=${process.env.NASA}`
    );
  }
}

class ISSAPI extends RESTDataSource {
  constructor() {
    // Always call super()
    super();
    // Sets the base URL for the REST API
    this.baseURL = 'https://api.wheretheiss.at/v1/satellites';
  }

  async getSatellites() {
    // Send a GET request to the specified endpoint
    return this.get(`/`);
  }

  async getLocations() {
    return this.get('/25544/positions?timestamps=1436029892,1436029902&units=miles')
  }
}

// Schema definition
const typeDefs = gql`
  type Satellite {
    name: String!
    id: Int!
  }
  
  type Location {
    name: String!
    id: Int!
    latitude: Float!
    longitude: Float!
    altitude: Float!
    velocity: Float!
    visibility: String!
    timestamp: Int!
  }
  
  type APOD {
    copyright: String!
    date: String!
    explanation: String!
    hdurl: String!
    media_type: String!
    service_version: String!
    title: String!
    url: String!
  }
  
  type NEO_BODY {
    id: String!
    name: String!
    is_potentially_hazardous_asteroid: Boolean!
  }

  # Queries can fetch a list of libraries
  type Query {
    satellites: [Satellite]
    locations: [Location]
    neos: [NEO_BODY]
    apod: APOD
  }
`;

// Resolver map
const resolvers = {
  Query: {
    async satellites(_, __, { dataSources }) {
      return dataSources.issAPI.getSatellites();
    },
    async locations(_, __, { dataSources }) {
      return dataSources.issAPI.getLocations();
    },
    async apod(_, __, { dataSources }) {
      return dataSources.nasaAPI.getApod();
    },
    async neos(_, __, { dataSources }) {
      return dataSources.nasaAPI.getNEOs().then(data => {
        return data["near_earth_objects"][new Date().toISOString().substr(0,10)];
      })
    }
  },
};

// Pass schema definition and resolvers to the
// ApolloServer constructor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    issAPI: new ISSAPI(),
    nasaAPI: new NASAAPI()
  }) });

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
