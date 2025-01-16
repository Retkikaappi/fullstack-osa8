import { useState } from 'react'
import { LOGIN } from '../queries'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

const Login = ({ token, setToken }) => {
  const [errorMsg, setErrorMsg] = useState(null)
  const nav = useNavigate()
  const [login] = useMutation(LOGIN, {
    onCompleted: (resp) => {
      console.log(resp.login.value)
      localStorage.setItem('library-activeUser', resp.login.value)
      setToken(resp.login.value)
      nav('/books')
    },
    onError: (err) => {
      console.log(err)
      setErrorMsg('Login failed')
    },
  })

  const handleLogin = (e) => {
    e.preventDefault()
    const { username, password } = e.target
    setErrorMsg(null)
    login({ variables: { username: username.value, password: password.value } })
    username.value = ''
    password.value = ''
  }

  if (token) {
    return <div>Already logged in</div>
  }

  return (
    <div>
      <form onSubmit={(e) => handleLogin(e)}>
        <input type='text' name='username' placeholder='username' />
        <br />
        <input type='password' name='password' placeholder='password' />
        <br />
        <button>login</button>
      </form>
      <p style={{ color: 'red' }}>{errorMsg}</p>
    </div>
  )
}

export default Login
