import {
  AspectRatio,
  Button,
  InputGroup,
  InputLeftAddon,
  Input,
  HStack,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'

const API_URL = 'http://localhost:3000'

function ApiTester() {
  const [endpoint, setEndpoint] = useState('/api/user/currentUser')
  const [val, setVal] = useState(endpoint)

  return (
    <>
      <HStack spacing='1' justify='center' mb='4'>
        <InputGroup>
          <InputLeftAddon>{API_URL}</InputLeftAddon>
          <Input
            placeholder=''
            width='auto'
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </InputGroup>
        <Button onClick={() => setEndpoint(val)}>Execute</Button>
      </HStack>
      <AspectRatio ratio={16 / 9}>
        <iframe src={`${API_URL}${endpoint}`} />
      </AspectRatio>
    </>
  )
}

export default ApiTester
