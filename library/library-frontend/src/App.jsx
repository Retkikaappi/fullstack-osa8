import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { Link, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import Recommendations from './components/Recommendations'

const App = () => {
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  useEffect(() => {
    const user = localStorage.getItem('library-activeUser')
    if (user) {
      setToken(user)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    client.resetStore()
    setToken(null)
  }

  return (
    <div>
      <div style={{ margin: '0.5em', padding: '0.5em' }}>
        <Link
          to='/authors'
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
          to='/books'
          style={{
            margin: '0.25em',
            padding: '0.25em',
            fontSize: '1.5em',
            border: '1px solid blue',
          }}
        >
          Books
        </Link>
        {token && (
          <>
            <Link
              to='/add'
              style={{
                margin: '0.25em',
                padding: '0.25em',
                fontSize: '1.5em',
                border: '1px solid blue',
              }}
            >
              Add
            </Link>
            <Link
              to='/recommendations'
              style={{
                margin: '0.25em',
                padding: '0.25em',
                fontSize: '1.5em',
                border: '1px solid blue',
              }}
            >
              Recommendations
            </Link>
          </>
        )}
        {token ? (
          <Link
            style={{
              margin: '0.25em',
              padding: '0.25em',
              fontSize: '1.5em',
              border: '1px solid blue',
            }}
            onClick={handleLogout}
          >
            Logout
          </Link>
        ) : (
          <Link
            to='/login'
            style={{
              margin: '0.25em',
              padding: '0.25em',
              fontSize: '1.5em',
              border: '1px solid blue',
            }}
          >
            Login
          </Link>
        )}
      </div>

      <Routes>
        <Route
          path='/'
          element={<div>Click one ^ of these -----^ ------------^</div>}
        />
        <Route path='/authors' element={<Authors token={token} />} />
        <Route path='/books' element={<Books />} />
        <Route path='/add' element={<NewBook token={token} />} />
        <Route
          path='/recommendations'
          element={<Recommendations token={token} />}
        />
        <Route
          path='/login'
          element={<Login token={token} setToken={setToken} />}
        />
      </Routes>
    </div>
  )
}

export default App
