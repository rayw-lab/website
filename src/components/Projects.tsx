import { projects } from '../data'

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="section__header">
        <span className="section__index">02.</span>
        <h2 className="section__title">Things I&apos;ve built</h2>
      </div>
      <div className="projects">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <div className="project-card__top">
              <span className="project-card__icon" aria-hidden="true">
                ◆
              </span>
              <a
                className="project-card__link"
                href={project.link}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title}`}
              >
                ↗
              </a>
            </div>
            <h3 className="project-card__title">{project.title}</h3>
            <p className="project-card__desc">{project.description}</p>
            <ul className="project-card__tags">
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
