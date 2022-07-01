interface props {
  val: string;
  endpoint: string;
  onInputChange: (input: string) => void;
  onButtonClick: (val: string) => void;
}

const APITest = ({ val, endpoint, onInputChange, onButtonClick }: props) => (
  <div className="App">
    <div>
      <h1>APIテスト</h1>
    </div>
    <div>
      <h3>http://localhost:3000</h3>
      <input
        placeholder="users"
        value={val}
        onChange={(e) => onInputChange(e.target.value)}
      />
    </div>
    <div>
      <button
        onClick={() => {
          onButtonClick(val);
        }}
        type="button"
      >
        <span className="">Send</span>
      </button>
    </div>
    <iframe title="test" src={`http://localhost:3000/${endpoint}`} />
  </div>
);

export default APITest;
