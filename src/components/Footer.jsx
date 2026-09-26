export default function Footer() {
  return (
    <footer>
      <p>
        © {new Date().getFullYear()} Manjunath K
        <span className="separator"> | </span>

        <a
          href="https://github.com/KManjunath1467"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}