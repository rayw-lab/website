export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__content">
        <p className="hero__eyebrow">Hi, my name is</p>
        <h1 className="hero__title">Ray Wang.</h1>
        <h2 className="hero__subtitle">I build things for the web.</h2>
        <p className="hero__lead">
          I&apos;m a software engineer who loves turning hard problems into
          simple, delightful products. Currently focused on developer tooling
          and thoughtful user experiences.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#projects">
            View my work
          </a>
          <a className="btn btn--ghost" href="#contact">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
