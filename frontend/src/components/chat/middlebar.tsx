import { Text, Flex } from "@chakra-ui/layout"
import { MessageObject } from "src/types/chat";

const timestampToTime = (timestamp) => {
    const date = new Date(timestamp);
    const yyyy = `${date.getFullYear()}`;
    // .slice(-2)で文字列中の末尾の2文字を取得する
    // `0${date.getHoge()}`.slice(-2) と書くことで０埋めをする
    const MM = `0${date.getMonth() + 1}`.slice(-2); // getMonth()の返り値は0が基点
    const dd = `0${date.getDate()}`.slice(-2);
    const HH = `0${date.getHours()}`.slice(-2);
    const mm = `0${date.getMinutes()}`.slice(-2);
    const ss = `0${date.getSeconds()}`.slice(-2);

    return `${yyyy}/${MM}/${dd}`;
    // return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
}

const MiddleBar = ({chatLog}) => {
	return (
		<Flex direction="column" pt={4} mx={5} flex={1}  overflowX="scroll" sx={{scrollbarWidth: "none"}}>
		{chatLog.length
			? chatLog.map((message: MessageObject) => (
			  <Flex>
				<Flex bg="blue.100" w="fit-content" minWidth="100px" borderRadius="10px" p={3} m={1}>
				  <Text>{message.message}</Text>
				</Flex>
				<Flex>
				  <Text>{timestampToTime(message.timestamp)}</Text>
				</Flex>
			  </Flex>

			))
		  : null}
	  </Flex>
	)
}

export default MiddleBar
