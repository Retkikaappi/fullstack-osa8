import { useQuery } from '@apollo/client'
import { GENRE_BOOKS, USER } from '../queries'
import { useState } from 'react'
import Book from './Book'

const Recommendations = () => {
  const [genre, setGenre] = useState(null)
  const user = useQuery(USER, {
    onCompleted: (resp) => {
      setGenre(resp.me.favoriteGenre)
    },
  })

  const genreBooks = useQuery(GENRE_BOOKS, {
    variables: { genre },
    onCompleted: (resp) => {},
  })

  if (user.loading) {
    return <div>loading user...</div>
  }

  if (genreBooks.loading) {
    return <div>loading books...</div>
  }

  const books = genreBooks.data.allBooks

  return (
    <div>
      <h2>Recommendations</h2>
      <h3>Based on your favorite genre: {genre}</h3>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((e) => (
            <Book key={e.title} book={e} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
