import {
  Grid,
  Box,
  Button,
  TextField,
  Container,
  Typography,
} from '@mui/material';

interface props {
  val: string;
  endpoint: string;
  onInputChange: (input: string) => void;
  onButtonClick: (val: string) => void;
}

const APITest = ({ val, endpoint, onInputChange, onButtonClick }: props) => (
  <Grid container justifyContent="center">
    <Container maxWidth="sm">
      <Typography variant="h3">APIテスト</Typography>
      <Box>
        <Typography variant="h6">http://localhost:3000</Typography>
        <TextField
          id="filled-search"
          type="search"
          variant="filled"
          placeholder="users"
          value={val}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={() => {
            onButtonClick(val);
          }}
          type="button"
        >
          Send
        </Button>
      </Box>
      <iframe title="test" src={`http://localhost:3000/${endpoint}`} />
    </Container>
  </Grid>
);

export default APITest;
