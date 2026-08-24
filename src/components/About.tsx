import { skills } from '../data'

export default function About() {
  return (
    <section className="section" id="about">
      <div className="section__header">
        <span className="section__index">01.</span>
        <h2 className="section__title">About me</h2>
      </div>
      <div className="about">
        <div className="about__text">
          <p>
            I&apos;ve spent the last several years building products across the
            stack — from pixel-perfect interfaces to the services that power
            them. I care deeply about performance, accessibility, and the small
            details that make software feel effortless.
          </p>
          <p>
            When I&apos;m not shipping code, you&apos;ll find me hiking new
            trails, tinkering with side projects, or writing about what
            I&apos;ve learned.
          </p>
        </div>
        <div className="about__skills">
          {skills.map((group) => (
            <div className="skill-group" key={group.label}>
              <h3>{group.label}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
