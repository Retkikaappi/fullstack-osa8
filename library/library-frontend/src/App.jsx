import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { Link, Routes, Route } from 'react-router-dom'

const App = () => {
  return (
    <div>
      <div style={{ margin: '0.5em', padding: '0.5em' }}>
        <Link
          to='authors'
          style={{
            margin: '0.25em',
            padding: '0.25em',
            fontSize: '1.5em',
            border: '1px solid blue',
          }}
        >
          Authors
        </Link>
        <Link
          to='books'
          style={{
            margin: '0.25em',
            padding: '0.25em',
            fontSize: '1.5em',
            border: '1px solid blue',
          }}
        >
          Books
        </Link>
        <Link
          to='add'
          style={{
            margin: '0.25em',
            padding: '0.25em',
            fontSize: '1.5em',
            border: '1px solid blue',
          }}
        >
          Add
        </Link>
      </div>

      <Routes>
        <Route path='/authors' element={<Authors />} />
        <Route path='/books' element={<Books />} />
        <Route path='/add' element={<NewBook />} />
      </Routes>
    </div>
  )
}

export default App
