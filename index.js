const { ApolloServer, gql } = require('apollo-server');
const { RESTDataSource } = require('apollo-datasource-rest');

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

const libraries = [
  {
    branch: 'downtown'
  },
  {
    branch: 'riverside'
  },
];

// The branch field of a book indicates which library has it in stock
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
    branch: 'riverside'
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
    branch: 'downtown'
  },
];

const authors = [
  {
    name: 'Kate Chopin',
    favorite_pie: 'lemon',
  },
  {
    name: 'Paul Auster',
    favorite_pie: 'cherry',
  }
]

const titles = [
  {
    name: 'City of Glass',
    pages: 452,
    ebook: false
  },
  {
    name: 'The Awakening',
    pages: 451,
    ebook: true
  }
]

// Schema definition
const typeDefs = gql`

# A library has a branch and books
  type Library {
    branch: String!
    books: [Book!]
  }

  # A book has a title and author
  type Book {
    title: Title!
    author: Author!
  }

  # An author has a name
  type Author {
    name: String!
    favorite_pie: String!
  }
  
  type Title {
    name: String!
    pages: Int!
    ebook: Boolean!
  }

  # Queries can fetch a list of libraries
  type Query {
    libraries: [Library]
    satellites: [Satellite]
    locations: [Location]
  }
  
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
  }
`;

// Resolver map
const resolvers = {
  Query: {
    libraries() {
      // Return our hardcoded array of libraries
      return libraries;
    },
    async satellites(_, __, { dataSources }) {
      return dataSources.issAPI.getSatellites();
    },
    async locations(_, __, { dataSources }) {
      return dataSources.issAPI.getLocations();
    }
  },
  Library: {
    books(parent) {

      // Filter the hardcoded array of books to only include
      // books that are located at the correct branch
      return books.filter(book => book.branch === parent.branch);
    }
  },
  Book: {
    author(parent) {
      return authors.filter(author => author.name === parent.author)[0];
    },
    title(parent) {
      return titles.filter(title => title.name === parent.title)[0];
    }
  }


  // Because Book.author returns an object with a "name" field,
  // Apollo Server's default resolver for Author.name will work.
  // We don't need to define one.
};

// Pass schema definition and resolvers to the
// ApolloServer constructor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    issAPI: new ISSAPI()
  }) });

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
