import { Box, Flex } from "@chakra-ui/layout"
import { ChannelObject, MessageObject } from "src/types/chat"

const TopBar = ({currentRoom}) => {
	return (
		<Box borderBottom="1px solid" borderColor="gray.100" p={4}>Current Channel : {currentRoom.name}</Box>
	)
}

export default TopBar
