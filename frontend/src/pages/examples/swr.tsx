import React from 'react'
import useSWR from 'swr'

// a fake API that returns data or error randomly
const fetchCurrentTime = async () => {
  // wait for 1s
  await new Promise((res) => setTimeout(res, 1000))

  // error!
  if (Math.random() < 0.4) throw new Error('An error has occurred!')

  // return the data
  return new Date().toLocaleString()
}

function Example() {
  const { data, error, mutate, isValidating } = useSWR(
    '/api',
    fetchCurrentTime,
    { dedupingInterval: 0 }
  )

  return (
    <div className='App'>
      <h2>Current time: {data}</h2>
      <p>Loading: {isValidating ? 'true' : 'false'}</p>
      <button onClick={() => mutate()}>
        <span>Refresh</span>
      </button>
      {error ? <p style={{ color: 'red' }}>{error.message}</p> : null}
    </div>
  )
}

export default Example
