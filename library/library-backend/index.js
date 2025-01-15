const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const typeDefs = require('./typedefs')

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
require('dotenv').config()
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
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
    me: async (root, args, { activeUser }) => {
      return activeUser
    },
  },
  Author: {
    bookCount: async (args) => {
      const books = await Book.find({}).populate('author')
      const booksBy = books.filter((e) => e.author.name === args.name)
      return booksBy.length
    },
  },

  Mutation: {
    addBook: async (root, args, { activeUser }) => {
      if (!activeUser) {
        throw new GraphQLError('bad authentication', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

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
    editAuthor: async (root, args, { activeUser }) => {
      if (!activeUser) {
        throw new GraphQLError('bad authentication', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      const author = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      )
      if (!author) {
        throw new GraphQLError('user not found', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }
      // palauttaa null vaikka ei päästäkkään tänne...
      return author
    },
    createUser: async (root, args) => {
      const user = new User(args)
      return user.save().catch((error) => {
        throw new GraphQLError('Failed to add new user', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error,
          },
        })
      })
    },
    login: async (root, { username, password }) => {
      const user = await User.findOne({ username })

      if (!user || password !== 'testpass') {
        throw new GraphQLError('Invalid login credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const token = {
        value: jwt.sign(
          { username: user.username, id: user._id },
          process.env.SECRET
        ),
      }
      return token
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, resp }) => {
    const token = req ? req.headers.authorization : null
    if (token && token.startsWith('Bearer ')) {
      const decoToken = jwt.verify(token.substring(7), process.env.SECRET)
      const activeUser = await User.findById(decoToken.id)
      return { activeUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
