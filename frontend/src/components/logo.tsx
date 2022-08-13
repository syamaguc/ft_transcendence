import { HTMLChakraProps, Heading } from '@chakra-ui/react'

export const Logo = (props: HTMLChakraProps<'h1'>) => {
  return (
    <Heading as='h1' size='md' display='block' {...props}>
      ft_transcendence
    </Heading>
  )
}
