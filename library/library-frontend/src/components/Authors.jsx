import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Authors = () => {
  const authors = useQuery(ALL_AUTHORS)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  //backend toimii samalla tavalla kuin esimerkissä mutta ei silti re-renderöi automaattisesti...

  if (authors.loading) {
    return <div>Loading...</div>
  }

  const handleChange = (e) => {
    e.preventDefault()
    const setBornTo = parseInt(e.target.year.value)
    editAuthor({ variables: { name: e.target.name.value, setBornTo } })
    e.target.year.value = ''
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={(e) => handleChange(e)}>
          <select name='name'>
            {authors.data.allAuthors.map((e) => (
              <option key={`opt_${e.name}`} value={e.name}>
                {e.name}
              </option>
            ))}
          </select>
          <br />
          born <input type='number' name='year' />
          <button>update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
