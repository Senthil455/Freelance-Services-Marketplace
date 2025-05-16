function Greeting(props) {
  return <h2>Hello, {props.name}</h2>;
}

function UserCard(props) {
  return (
    <div className="card">
      <Greeting name={props.name} />
      <p>{props.bio}</p>
    </div>
  );
}
