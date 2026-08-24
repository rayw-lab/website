const socials = [
  { label: 'GitHub', href: 'https://github.com/rayw-lab' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Email', href: 'mailto:hello@example.com' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__socials">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
          >
            {social.label}
          </a>
        ))}
      </div>
      <p className="footer__note">
        Designed &amp; built by Ray Wang · © {new Date().getFullYear()}
      </p>
    </footer>
  )
}
