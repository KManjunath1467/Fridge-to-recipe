import chef from "../images/chef.png";

export default function Header() {
  return (
    <header>
      <img
        src={chef}
        alt="AI Chef logo"
      />

      <h1>AI Chef</h1>
    </header>
  );
}