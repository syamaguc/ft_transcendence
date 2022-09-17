export async function setIsFirstTime(toggle: boolean) {
  const res = await fetch(`/api/session/is-first-time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isFirstTime: toggle }),
  })

  if (!res.ok) {
    console.error('Failed to set isFirstTime')
  }
}

export async function getIsFirstTime() {
  const res = await fetch(`/api/session/is-first-time`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (res.ok) {
    const data = await res.json()
    if (typeof data.isFirstTime === 'boolean') {
      return data.isFirstTime
    }
  }
  console.error(
    'Failed to get isFirstTime. This should not be called before session cookie is set'
  )
  return false
}
