const publicProjects = [
  {
    name: 'springBootProject',
    url: 'https://github.com/amaranth92/springBootProject',
    role: 'Java/Spring 백엔드 초기 구성',
    scenario: '서비스 뼈대를 안전하게 시작할 수 있는 구조 정리',
    proof: '의존성, 실행/빌드 라인, 코드 정합성이 어떻게 맞물리는지 확인',
  },
  {
    name: 'freelec-springboot2-webservice',
    url: 'https://github.com/amaranth92/freelec-springboot2-webservice',
    role: '웹서비스 베이스 정비',
    scenario: '확장 가능한 백엔드 베이스 구성과 유지보수 흐름 점검',
    proof: '설정 정리 방식과 구조 기준으로 판단 근거가 남는지 확인',
  },
  {
    name: 'portfolio-town',
    url: 'https://github.com/amaranth92/portfolio-town',
    role: '개발 환경/배포 흐름 정리',
    scenario: 'React + Vite 기반 정적 전달 구조 정리',
    proof: '프론트엔드 전달 포인트를 함께 관리할 수 있는지 확인',
  },
  {
    name: 'posture-debt-cam',
    url: 'https://github.com/amaranth92/posture-debt-cam',
    role: '패키징·릴리즈 흐름 정돈',
    scenario: '배포·정리 루틴의 일관성을 보여주는 산출물',
    proof: '최종 결과보다 전달/운영 루틴이 남는지 확인',
  },
];

const privateProjects = [
  {
    name: '직무형 운영 서비스 리팩터링',
    period: '2022.01 ~ 2022.12',
    scope: '비공개',
    role: '백엔드 운영/개선',
    summary:
      'C# 중심의 내부 시스템 환경에서 Java를 함께 운영하며, 유지보수 이슈가 반복되는 기능을 선별해 안정성 기준으로 분리·재설계했습니다.',
  },
  {
    name: '운영 서버 안정화 프로젝트',
    period: '2023.02 ~ 2024.05',
    scope: '비공개',
    role: '배포·장애 대응',
    summary:
      '개발/운영 서버 배포 흐름을 정리하고, 배포 전 체크리스트·로그 점검·후속 정리 루틴을 실제 업무로 정착시켰습니다.',
  },
  {
    name: '문서·정합성 개선 작업',
    period: '2024.06 ~ 2025.01',
    scope: '비공개',
    role: '백엔드 연동/협업',
    summary:
      '문서 기반 흐름을 개선해 현업 전달 속도와 문제 재발 방지 기준을 맞췄습니다.',
  },
];

const principles = [
  '설명보다 설득: 어떤 문제를 어떻게 풀었는지 중심으로 구성',
  '간결함: 한 화면에 한 번에 판단 가능한 핵심만 표시',
  '링크 관리: 상태가 불명확한 링크는 제외',
  '회사 맞춤: 지원하는 직무의 역량 순서대로 강조점 조정',
];

function ProjectCard({ project }: { project: (typeof publicProjects)[number] }) {
  return (
    <article className="card">
      <h3>{project.name}</h3>
      <p>
        <strong>역할</strong> {project.role}
      </p>
      <p>
        <strong>상황</strong> {project.scenario}
      </p>
      <p>
        <strong>확인 근거</strong> {project.proof}
      </p>
      <a href={project.url} target="_blank" rel="noreferrer">
        저장소 보기
      </a>
    </article>
  );
}

function PrivateCard({
  project,
}: {
  project: (typeof privateProjects)[number];
}) {
  return (
    <article className="card card--private">
      <div className="private-badge">Private</div>
      <h3>{project.name}</h3>
      <p>
        <strong>기간</strong> {project.period}
      </p>
      <p>
        <strong>범위</strong> {project.scope}
      </p>
      <p>
        <strong>역할</strong> {project.role}
      </p>
      <p>{project.summary}</p>
    </article>
  );
}

function App() {
  return (
    <main className="portfolio-page">
      <section className="hero">
        <p className="eyebrow">Java/Spring Backend Developer</p>
        <h1>실서비스 운영을 끝까지 보는 Java 웹 개발자 포트폴리오</h1>
        <p className="hero-copy">
          개발·배포·운영·장애 정리까지 한 흐름으로 보여주는 형태로 다시 구성했습니다.
          공개 저장소뿐 아니라 비공개 실무 프로젝트도 함께 공개 가능한 범위 안에서 정리했습니다.
        </p>
      </section>

      <section className="card-band">
        <h2>포트폴리오 설계 기준</h2>
        <ul>
          {principles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="grid">
        <h2>Public Project Evidence (검증 가능한 링크)</h2>
        <div className="card-grid">
          {publicProjects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </section>

      <section className="grid">
        <h2>Private Projects (비공개 실무 프로젝트)</h2>
        <p className="section-note">
          비공개 저장소는 링크를 공개하지 않고, 수행 범위와 판단 근거 중심으로 정리했습니다.
        </p>
        <div className="card-grid">
          {privateProjects.map((project) => (
            <PrivateCard key={`${project.name}-${project.period}`} project={project} />
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>
          GitHub: <a href="https://github.com/amaranth92">https://github.com/amaranth92</a>
        </p>
        <p>Target: Australia (Perth)</p>
      </footer>
    </main>
  );
}

export default App;
