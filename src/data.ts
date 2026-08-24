export interface Project {
  title: string
  description: string
  tags: string[]
  link: string
}

export const projects: Project[] = [
  {
    title: 'Aurora Dashboard',
    description:
      'A real-time analytics dashboard with streaming charts, custom widgets, and a plugin system.',
    tags: ['React', 'TypeScript', 'WebSockets'],
    link: 'https://github.com/rayw-lab',
  },
  {
    title: 'Trailhead',
    description:
      'A mobile-first trip planner that generates day-by-day itineraries from natural-language prompts.',
    tags: ['Next.js', 'LLM', 'Maps'],
    link: 'https://github.com/rayw-lab',
  },
  {
    title: 'Ledgerly',
    description:
      'A privacy-first personal finance tracker that runs entirely on-device with encrypted sync.',
    tags: ['Rust', 'WASM', 'SQLite'],
    link: 'https://github.com/rayw-lab',
  },
]

export interface SkillGroup {
  label: string
  items: string[]
}

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['TypeScript', 'Python', 'Rust', 'Go'] },
  { label: 'Frontend', items: ['React', 'Vite', 'CSS', 'Design Systems'] },
  { label: 'Backend', items: ['Node.js', 'PostgreSQL', 'Redis', 'gRPC'] },
  { label: 'Tooling', items: ['Docker', 'CI/CD', 'Testing', 'Observability'] },
]
