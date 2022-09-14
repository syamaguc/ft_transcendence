import { useRouter } from 'next/router'

function UserDetail() {
  const router = useRouter()
  const { username } = router.query

  return <p>{username}</p>
}

export default UserDetail
