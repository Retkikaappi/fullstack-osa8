const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const typeDefs = require('./typedefs')

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
require('dotenv').config()
const Author = require('./models/author')
const Book = require('./models/book')
const author = require('./models/author')
const { GraphQLError } = require('graphql')

console.log('connecting to', process.env.MONGODB_URI)

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to DB')
  })
  .catch((e) => {
    console.log('error connecting to DB', e.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
    born: 1963,
  },
  {
    name: 'Fyodor Dostoevsky',
    id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
    born: 1821,
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
    genres: ['agile', 'patterns', 'design'],
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring'],
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'patterns'],
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
    genres: ['refactoring', 'design'],
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'crime'],
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
    genres: ['classic', 'revolution'],
  },
]

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!(args.author || args.genre)) {
        return Book.find({}).populate('author')
      }

      if (args.author && args.genre) {
        const booksByGenre = await Book.find({ genres: args.genre }).populate(
          'author'
        )
        const booksByBoth = booksByGenre.filter(
          (e) => e.author.name === args.author
        )
        return booksByBoth
      }

      if (args.author) {
        const booksByAuthor = await Book.find({}).populate('author')
        return booksByAuthor.filter((e) => e.author.name === args.author)
      }

      return Book.find({ genres: args.genre }).populate('author')
    },
    allAuthors: async () => Author.find({}),
  },
  Author: {
    bookCount: (args) => {
      const booksBy = books.filter((e) => e.author === args.name)
      return booksBy.length
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const authorInDb = await Author.findOne({ name: args.author })

      if (!authorInDb) {
        try {
          const newAuthor = new Author({ name: args.author })
          await newAuthor.save()
          const book = new Book({ ...args, author: newAuthor })
          return book.save()
        } catch (error) {
          throw new GraphQLError(
            'Failed to create a new book or a new author',
            {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args,
                error,
              },
            }
          )
        }
      }

      const book = new Book({ ...args, author: authorInDb })
      return book.save().catch((error) => {
        throw new GraphQLError('Failed to create a new book', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error,
          },
        })
      })
    },
    addAuthor: async (root, args) => {
      const author = new Author({ ...args })
      return author.save().catch((error) => {
        throw new GraphQLError('Failed to add new author', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      })
    },
    editAuthor: async (root, args) => {
      const author = Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo //pitäs olla pakollinen born kenttä, tai tehdä vaihtaa uuteen olioon
      try {
        await author.save()
      } catch (e) {
        throw new GraphQLError('birthyear edit error', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
            e,
          },
        })
      }
      return author
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
