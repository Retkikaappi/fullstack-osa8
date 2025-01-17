import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment bookDetails on Book {
    title
    published
    id
    genres
    author {
      name
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount {
        title
      }
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const GENRE_BOOKS = gql`
  query GenreBooks($genre: String) {
    allBooks(genre: $genre) {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const USER = gql`
  query Me {
    me {
      favoriteGenre
      id
      username
    }
  }
`

export const ADD_BOOK = gql`
  mutation AddBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
        id
        born
        bookCount {
          title
        }
      }
      genres
      id
      published
    }
  }
`

export const ADDED_BOOK = gql`
  subscription {
    addedBook {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      bookCount {
        title
      }
    }
  }
`

export const LOGIN = gql`
  mutation ($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
