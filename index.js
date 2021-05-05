const { ApolloServer, gql } = require('apollo-server');

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
  }
`;

// Resolver map
const resolvers = {
  Query: {
    libraries() {

      // Return our hardcoded array of libraries
      return libraries;
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
const server = new ApolloServer({ typeDefs, resolvers });

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
