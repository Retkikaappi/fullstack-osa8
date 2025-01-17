const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { GraphQLError, subscribe } = require('graphql')
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

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
    //populoidaan 1. kerros syvemmälle, jotta voitaisiin katsoa allAuthors -> bookCount -> author { name }
    allAuthors: async () =>
      Author.find({}).populate({
        path: 'bookCount',
        populate: { path: 'author' },
      }),
    me: async (root, args, { activeUser }) => {
      return activeUser
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

      const authorInDb = await Author.findOne({ name: args.author }).populate(
        'bookCount'
      )

      if (!authorInDb) {
        try {
          const newAuthor = new Author({ name: args.author })
          const book = new Book({ ...args, author: newAuthor })
          //n+1 ongelman ratkaisu
          newAuthor.bookCount = newAuthor.bookCount.concat(book)
          await newAuthor.save()
          pubsub.publish('ADDED_BOOK', { addedBook: book })
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
      //n+1 ongelman ratkaisu
      authorInDb.bookCount = authorInDb.bookCount.concat(book)
      authorInDb.save()

      pubsub.publish('ADDED_BOOK', { addedBook: book })

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
      //olisi voinut poistaa bookCountin palautuksesta, mutta käy näinkin
      const author = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      ).populate('bookCount')
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
  Subscription: {
    addedBook: {
      subscribe: () => pubsub.asyncIterableIterator('ADDED_BOOK'),
    },
  },
}

module.exports = resolvers
