import { useQuery } from '@apollo/client'
import { GENRE_BOOKS } from '../queries'
import { useState } from 'react'
import Book from './Book'

const Books = () => {
  const [genre, setGenre] = useState(null)
  const resp = useQuery(GENRE_BOOKS, {
    variables: { genre },
  })

  if (resp.loading) {
    return <div>Loading...</div>
  }
  const books = resp.data.allBooks

  return (
    <div>
      <h2>books</h2>
      <h3>{genre}</h3>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <Book key={book.title} book={book} />
          ))}
        </tbody>
      </table>

      <button onClick={() => setGenre('agile')}>agile</button>
      <button onClick={() => setGenre('patterns')}>patterns</button>
      <button onClick={() => setGenre('refactoring')}>refactoring</button>
      <button onClick={() => setGenre('design')}>design</button>
      <button onClick={() => setGenre('crime')}>crime</button>
      <button onClick={() => setGenre('classic')}>classic</button>
      <button onClick={() => setGenre(null)}>all genres</button>
    </div>
  )
}

export default Books
