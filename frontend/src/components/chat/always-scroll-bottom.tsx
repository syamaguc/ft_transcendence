import { useEffect, useRef } from 'react'

// reference:
// https://ordinarycoders.com/blog/article/react-chakra-ui
// https://qiita.com/tonio0720/items/c265b9b65db3bb76f2d3
const AlwaysScrollToBottom = () => {
  const elementRef = useRef()
  useEffect(() => elementRef.current.scrollIntoView())
  return <dev ref={elementRef} />
}

export default AlwaysScrollToBottom
