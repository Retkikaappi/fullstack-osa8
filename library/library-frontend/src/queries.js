import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query {
    allBooks {
      author {
        name
      }
      genres
      published
      title
    }
  }
`

export const GENRE_BOOKS = gql`
  query GenreBooks($genre: String) {
    allBooks(genre: $genre) {
      author {
        name
      }
      title
      published
      genres
    }
  }
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
        bookCount
      }
      genres
      id
      published
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      bookCount
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
