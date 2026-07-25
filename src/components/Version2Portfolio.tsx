import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { personalProjects, portfolioTimeline, profile, type PersonalProject, type PortfolioMilestone } from '../data/portfolioTimeline';
import type { Locale } from '../game/gameEvents';

type Props = {
  locale: Locale;
  onToggleLocale?: () => void;
};

type Topic = 'about' | 'career' | 'side' | 'skills' | 'fun' | 'contact';

type TopicCopy = {
  label: string;
  question: string;
  title: string;
  answer: string;
  bullets: string[];
};

type Copy = {
  greeting: string;
  role: string;
  watermark: string;
  searchPlaceholder: string;
  cta: string;
  back: string;
  portfolioTitle: string;
  projectsTitle: string;
  viewProcess: string;
  hideQuick: string;
  showQuick: string;
  infoTitle: string;
  infoWhat: string;
  infoWhatBody: string;
  infoWhy: string;
  infoWhyBody: string;
  topics: Record<Topic, TopicCopy>;
};

type FluidParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  age: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
};

const assetBaseUrl = window.location.pathname.startsWith('/portfolio-town/') ? '/portfolio-town/' : '/';
const avatarUrl = `${assetBaseUrl}assets/github-avatar.jpg`;
const travelPhotoUrl = `${assetBaseUrl}assets/patagonia-wallpaper.jpg`;
const topicOrder: Topic[] = ['about', 'career', 'side', 'skills', 'fun', 'contact'];
const careerMilestones = portfolioTimeline
  .filter((milestone) => milestone.category === 'company')
  .sort((a, b) => Number(b.year.slice(0, 4)) - Number(a.year.slice(0, 4)));
const aussieProductIcons = [
  { title: 'Neon Tower', src: 'https://aussie-pus.pages.dev/neonTower.png' },
  { title: 'Neon Bricks', src: 'https://aussie-pus.pages.dev/neonBricks.png' },
  { title: 'Neon Drift: Arcflare', src: 'https://aussie-pus.pages.dev/arcflare_logo.png' },
  { title: 'Car Out Puzzle', src: 'https://aussie-pus.pages.dev/carOutPuzzle.png' },
  { title: 'Decernum', src: 'https://aussie-pus.pages.dev/decernum/assets/icon.png' }
];
const skillGroups = [
  {
    title: 'Frontend',
    koTitle: '프론트엔드',
    skills: ['React', 'JavaScript', 'jQuery', 'Ajax', 'Thymeleaf', 'WebSquare']
  },
  {
    title: 'Backend & Systems',
    koTitle: '백엔드 & 시스템',
    skills: ['Java', 'Spring Boot', 'JSP', 'Servlet', 'MyBatis', 'C#', '.NET']
  },
  {
    title: 'Database & Infra',
    koTitle: '데이터베이스 & 인프라',
    skills: ['MSSQL', 'Oracle', 'PostgreSQL', 'AWS', 'Jenkins', 'GitHub', 'Jira']
  },
  {
    title: 'Automation & AI Tools',
    koTitle: '자동화 & AI 도구',
    skills: ['Python', 'Linux', 'ffmpeg', 'Selenium', 'Gemini API', 'Codex', 'Agent Workflows']
  }
];

const copy: Record<Locale, Copy> = {
  en: {
    greeting: "Hey, I'm a developer",
    role: 'Web Programmer',
    watermark: 'Developer',
    searchPlaceholder: 'Ask me anything…',
    cta: 'View Portfolio',
    back: 'Home',
    portfolioTitle: 'Portfolio Assistant',
    projectsTitle: 'Side Projects',
    viewProcess: 'View process',
    hideQuick: 'Hide quick questions',
    showQuick: 'Show quick questions',
    infoTitle: 'Welcome to AI Portfolio',
    infoWhat: "What's this?",
    infoWhatBody:
      'I am excited to present my portfolio in a chat-first format. Whether you are a recruiter, teammate, or just curious, feel free to ask about my experience, projects, skills, and contact details.',
    infoWhy: 'Why this format?',
    infoWhyBody:
      'Traditional resumes can be limiting. This portfolio adapts to what you want to know about my Java backend work, enterprise systems, automation projects, and career story.',
    topics: {
      about: {
        label: 'Me',
        question: 'Who are you?',
        title: 'Stability-minded developer who keeps learning current tools',
        answer:
          "Hi, I am Kim Seongkyung, a Java web developer based in Seoul with 6 years 8 months of commercial experience. I majored in Computer Information Engineering at Korea National University of Transportation, worked on projects for LG U+, SK hynix, and the Korea Institute of Drug Safety & Risk Management, and managed/developed systems at CareerCare's IT Research Institute.",
        bullets: [
          'What about you? What brings you here?'
        ]
      },
      career: {
        label: 'Career',
        question: 'Show me your career',
        title: 'Enterprise web systems across LG U+, CareerCare, SK hynix, and KIDS',
        answer:
          'My commercial work has focused on Java-centered enterprise web systems, database-backed workflows, stable operations, and practical maintenance. The timeline below moves from application development to senior web/system work.',
        bullets: [
          '2017-2019: Bogo Information System, LG U+ shared modules and WebSquare screens.',
          '2019-2023: CareerCare, CANDI maintenance, Java migration, BusinessPeople web/app and AWS deployment.',
          '2025: Ourcom, SK hynix ethics management backend and multilingual web screens.',
          '2026: InhouseSoft, Korea Institute of Drug Safety & Risk Management project with Spring Boot + React platform improvements.'
        ]
      },
      side: {
        label: 'Side',
        question: 'Show me your side projects',
        title: 'Automation, game, and AI app side projects',
        answer:
          'Outside work, I keep side projects that can be explained with clear public material or real working context: Aussie Pus game production, Nagalttae for the Toss In-App environment, the Photo EXIF Sorter automation tool, and Decody, an AI app for pet behavior translation and short clip subtitles/dubbing.',
        bullets: [
          'Aussie Pus Studio games: https://aussie-pus.pages.dev/',
          'Nagalttae: Toss In-App mobile flow project.',
          'Photo EXIF Sorter: Python automation for travel photo organization.',
          'Decody: AI app for translating pet behavior from photos, videos, and audio, with subtitle and voice dubbing support for short clips.'
        ]
      },
      skills: {
        label: 'Skills',
        question: 'What can you build with?',
        title: 'Backend, web, database, automation, and deployment stack',
        answer:
          'My strongest stack is Java-centered backend development with practical web UI, database, cloud, and automation experience.',
        bullets: [
          'Backend: Java, Spring Boot, JSP, Servlet, MyBatis, C#, .NET.',
          'Frontend: React, JavaScript, jQuery, Ajax, Thymeleaf, WebSquare.',
          'Database & Infra: MSSQL, Oracle, PostgreSQL, AWS, Git, GitHub, Jenkins, Jira, IntelliJ, SVN.',
          'Automation: Python, Linux shell, ffmpeg, Selenium, API integrations.'
        ]
      },
      fun: {
        label: 'Fun',
        question: 'What makes your journey different?',
        title: 'Australia, automation, and practical side experiments',
        answer:
          'Outside the office, I worked independently as an Uber Eats and Uber Driver in Perth, traveled around the world for about a year including Patagonia, and kept building small tools for annoying repetitive tasks with Python, Linux, ffmpeg, Selenium, and AI APIs.',
        bullets: [
          'Want to talk about travel, automation, or side projects?'
        ]
      },
      contact: {
        label: 'Contact',
        question: 'How can recruiters contact you?',
        title: 'Open to backend, web, system, and network roles',
        answer:
          "Here are my contact details. I am open to backend, web, system, and network roles in Seoul, and I would be happy to chat.",
        bullets: ["What's on your mind?"]
      }
    }
  },
  ko: {
    greeting: "Hey, I'm a developer",
    role: 'Web Programmer',
    watermark: 'Developer',
    searchPlaceholder: '무엇이든 물어보세요…',
    cta: '포트폴리오 보기',
    back: '처음으로',
    portfolioTitle: '포트폴리오 어시스턴트',
    projectsTitle: '사이드 프로젝트',
    viewProcess: '과정 보기',
    hideQuick: '빠른 질문 숨기기',
    showQuick: '빠른 질문 보기',
    infoTitle: 'AI 포트폴리오 안내',
    infoWhat: '무엇을 볼 수 있나요?',
    infoWhatBody:
      '제 포트폴리오를 대화형 구조로 소개합니다. 채용 담당자, 동료, 방문자가 경력, 프로젝트, 기술, 연락처를 원하는 주제별로 빠르게 확인할 수 있습니다.',
    infoWhy: '왜 이런 형식인가요?',
    infoWhyBody:
      '일반 이력서는 모든 방문자의 관심사에 맞춰 달라지기 어렵습니다. Java 백엔드 업무, 기업 시스템 운영, 자동화 프로젝트, 커리어 흐름 중 궁금한 부분으로 바로 이동할 수 있게 구성했습니다.',
    topics: {
      about: {
        label: '소개',
        question: '어떤 개발자인가요?',
        title: '안정성을 중요시하며 최신 기술을 꾸준히 학습하는 개발자',
        answer:
          '안녕하세요. 저는 서울에서 일하는 Java 웹개발자 김성경입니다. 총 6년 8개월의 실무 경험을 가지고 있고, 한국교통대학교 컴퓨터정보공학과를 전공했습니다. LG U+, SK하이닉스, 한국의약품안전관리원 프로젝트를 수행했고, 커리어케어 정보기술연구소에서는 사내 시스템을 관리·개발했습니다.',
        bullets: [
          '어떤 점이 궁금해서 오셨나요?'
        ]
      },
      career: {
        label: '경력',
        question: '경력을 보여주세요',
        title: 'LG U+, 커리어케어, SK하이닉스, 한국의약품안전관리원으로 이어지는 기업 웹 시스템 경험',
        answer:
          '실무에서는 Java 중심의 기업 웹 시스템, 데이터베이스 기반 업무 흐름, 안정적인 운영, 유지보수와 개선 업무를 주로 맡았습니다. 아래 타임라인에서 응용 개발부터 웹/시스템 개발 경험까지 순서대로 볼 수 있습니다.',
        bullets: [
          '2017-2019: 보고정보시스템, LG U+ 공통 모듈과 WebSquare 화면 개발.',
          '2019-2023: 커리어케어, CANDI 유지보수, Java 전환, 비즈니스피플 웹/앱 및 AWS 배포.',
          '2025: 아워콤, SK하이닉스 윤리경영 시스템 백엔드와 다국어 화면 개발.',
          '2026: 인하우스소프트, 한국의약품안전관리원 프로젝트의 Spring Boot + React 플랫폼 개선.'
        ]
      },
      side: {
        label: '사이드',
        question: '사이드 프로젝트를 보여주세요',
        title: '자동화, 게임, AI 앱 사이드 프로젝트',
        answer:
          '업무 외 프로젝트 중 실제로 설명 가능한 작업 맥락이나 공개 자료가 있는 항목을 중심으로 정리했습니다. Aussie Pus 게임 제작, 토스 인앱 환경의 나갈때, 여행 사진 정리 자동화 도구, 반려동물 행동 번역과 숏폼 자막/더빙을 돕는 Decody AI 앱을 담았습니다.',
        bullets: [
          'Aussie Pus Studio 게임: https://aussie-pus.pages.dev/',
          '나갈때: 토스 인앱 환경에서 만든 모바일 흐름 프로젝트.',
          'Photo EXIF Sorter: 여행 사진 정리를 위한 Python 자동화 도구.',
          'Decody: 사진, 영상, 오디오 속 반려동물 행동을 번역하고 짧은 클립용 자막과 음성 더빙을 만드는 AI 앱.'
        ]
      },
      skills: {
        label: '기술',
        question: '어떤 기술을 다룰 수 있나요?',
        title: '백엔드, 웹, 데이터베이스, 자동화, 배포 스택',
        answer:
          'Java 중심의 백엔드 개발이 가장 강점이며, 웹 UI, 데이터베이스, 클라우드, 자동화까지 실무 기반으로 다뤄왔습니다.',
        bullets: [
          'Backend: Java, Spring Boot, JSP, Servlet, MyBatis, C#, .NET.',
          'Frontend: React, JavaScript, jQuery, Ajax, Thymeleaf, WebSquare.',
          'Database & Infra: MSSQL, Oracle, PostgreSQL, AWS, Git, GitHub, Jenkins, Jira, IntelliJ, SVN.',
          'Automation: Python, Linux shell, ffmpeg, Selenium, API 연동.'
        ]
      },
      fun: {
        label: '기타',
        question: '어떤 경험이 특별한가요?',
        title: '호주 경험, 자동화, 실험적인 사이드 프로젝트',
        answer:
          '회사 밖에서는 호주 퍼스에서 Uber Eats와 Uber Driver로 일했고, 파타고니아를 포함해 약 1년간 세계여행을 했습니다. 그 과정에서 반복되는 불편함을 Python, Linux, ffmpeg, Selenium, AI API 같은 도구로 해결하는 실험을 계속했습니다.',
        bullets: [
          '여행, 자동화, 사이드 프로젝트 중 어떤 이야기가 궁금하신가요?'
        ]
      },
      contact: {
        label: '연락',
        question: '어떻게 연락하면 되나요?',
        title: '백엔드, 웹, 시스템, 네트워크 직무를 희망합니다',
        answer:
          '연락 가능한 정보는 위 카드에 정리했습니다. 서울 전지역의 백엔드, 웹, 시스템, 네트워크 직무 기회를 열어두고 있으며 편하게 이야기 나누고 싶습니다.',
        bullets: ['어떤 이야기가 궁금하신가요?']
      }
    }
  }
};

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useFluidCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
    if (!canvas || !gl) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (reduceMotion || coarsePointer) return undefined;

    let animationId = 0;
    let width = 0;
    let height = 0;
    let renderRatio = 1;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let hue = 195;
    const particles: FluidParticle[] = [];

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute float a_size;
      attribute vec4 a_color;
      uniform vec2 u_resolution;
      varying vec4 v_color;
      void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 clipSpace = zeroToOne * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        gl_PointSize = a_size;
        v_color = a_color;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        vec2 point = gl_PointCoord - vec2(0.5);
        float distanceFromCenter = length(point) * 2.0;
        float body = smoothstep(1.0, 0.05, distanceFromCenter);
        float rim = smoothstep(0.98, 0.72, distanceFromCenter) * smoothstep(0.38, 0.82, distanceFromCenter);
        float core = smoothstep(0.42, 0.0, distanceFromCenter);
        float alpha = v_color.a * (body * 0.34 + rim * 0.72 + core * 0.12);
        gl_FragColor = vec4(v_color.rgb, alpha);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    if (!program) return undefined;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const sizeLocation = gl.getAttribLocation(program, 'a_size');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    if (!positionBuffer || !sizeBuffer || !colorBuffer || !resolutionLocation) return undefined;

    const hueToRgb = (hueValue: number) => {
      const chroma = 0.42;
      const x = chroma * (1 - Math.abs(((hueValue / 60) % 2) - 1));
      const match = 0.46;
      const sector = Math.floor(hueValue / 60) % 6;
      const [r, g, b] =
        sector === 0 ? [chroma, x, 0] :
        sector === 1 ? [x, chroma, 0] :
        sector === 2 ? [0, chroma, x] :
        sector === 3 ? [0, x, chroma] :
        sector === 4 ? [x, 0, chroma] :
        [chroma, 0, x];
      return [r + match, g + match, b + match] as const;
    };

    const resize = () => {
      renderRatio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * renderRatio);
      canvas.height = Math.floor(height * renderRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const addSplat = (x: number, y: number, dx: number, dy: number, intensity = 1) => {
      const speed = Math.min(Math.hypot(dx, dy), 110);
      hue = (hue + 17) % 360;

      for (let index = 0; index < 5 * intensity; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const flowAngle = Math.atan2(dy || 1, dx || 1) + (Math.random() - 0.5) * 2.8;
        const spread = 0.35 + Math.random() * 1.55;
        const [r, g, b] = hueToRgb((hue + index * 14 + Math.random() * 22) % 360);
        particles.push({
          x: x + (Math.random() - 0.5) * 32,
          y: y + (Math.random() - 0.5) * 32,
          vx: dx * 0.01 + Math.cos(flowAngle) * spread + Math.cos(angle) * 0.22,
          vy: dy * 0.01 + Math.sin(flowAngle) * spread + Math.sin(angle) * 0.22,
          radius: (92 + speed * 0.72 + Math.random() * 86) * renderRatio,
          age: 0,
          maxLife: 96 + Math.random() * 62,
          r,
          g,
          b
        });
      }

      if (particles.length > 420) particles.splice(0, particles.length - 420);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const distance = Math.hypot(dx, dy);
      lastX = event.clientX;
      lastY = event.clientY;
      if (distance < 5) return;
      addSplat(event.clientX, event.clientY, dx, dy);
    };

    const handlePointerDown = (event: PointerEvent) => {
      addSplat(event.clientX, event.clientY, 72 * (Math.random() - 0.5), 72 * (Math.random() - 0.5), 1.8);
    };

    const render = () => {
      const positions: number[] = [];
      const sizes: number[] = [];
      const colors: number[] = [];
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += 1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        const curl = Math.sin((particle.age + particle.x * 0.012 + particle.y * 0.009) * 0.08) * 0.045;
        const nextVx = particle.vx * Math.cos(curl) - particle.vy * Math.sin(curl);
        const nextVy = particle.vx * Math.sin(curl) + particle.vy * Math.cos(curl);
        particle.vx = nextVx * 0.986;
        particle.vy = nextVy * 0.986;
        particle.radius *= 0.996;

        const progress = particle.age / particle.maxLife;
        if (progress >= 1 || particle.radius < 3) {
          particles.splice(index, 1);
          continue;
        }

        const alpha = Math.sin((1 - progress) * Math.PI * 0.5) * 0.28;
        positions.push(particle.x, particle.y);
        sizes.push(particle.radius);
        colors.push(particle.r, particle.g, particle.b, alpha);
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, width, height);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(sizeLocation);
      gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(colorLocation);
      gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, sizes.length);
      animationId = window.requestAnimationFrame(render);
    };

    resize();
    addSplat(width * 0.5, height * 0.38, 0, 0);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    animationId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [canvasRef]);
}

function TopicIcon({ topic }: { topic: Topic }) {
  const paths: Record<Topic, string[]> = {
    about: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 22a8 8 0 0 1 16 0'],
    career: ['M4 7h16', 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M5 7v12h14V7', 'M9 13h6'],
    side: ['M7 4h10l3 5-8 11L4 9l3-5Z', 'M4 9h16', 'M12 4v16'],
    skills: ['M12 3 4 7v10l8 4 8-4V7l-8-4Z', 'M4 7l8 4 8-4', 'M12 11v10'],
    fun: ['M5.8 11.3 2 22l10.7-3.8', 'M4 3h.01', 'M22 8h.01', 'M15 2h.01', 'M11 13c1.9 1.9 2.8 4.2 2 5-.8.8-3.1-.1-5-2s-2.8-4.2-2-5c.8-.8 3.1.1 5 2Z'],
    contact: ['M4 6h16v12H4z', 'm4 7 8 6 8-6']
  };

  return (
    <svg className="v2-topic-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[topic].map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

function TypewriterText({
  text,
  className,
  as = 'p',
  delay = 0,
  start = true,
  onDone
}: {
  text: string;
  className?: string;
  as?: 'p' | 'span' | 'strong';
  delay?: number;
  start?: boolean;
  onDone?: () => void;
}) {
  const [visibleText, setVisibleText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const Component = as;
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!start) return undefined;
    let index = 0;
    let intervalId = 0;
    const timeoutId = window.setTimeout(() => {
      setVisibleText('');
      setIsDone(false);
      intervalId = window.setInterval(() => {
        index += 1;
        setVisibleText(text.slice(0, index));
        if (index >= text.length) {
          window.clearInterval(intervalId);
          setIsDone(true);
          window.setTimeout(() => onDoneRef.current?.(), 90);
        }
      }, 12);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [text, delay, start]);

  return <Component className={`v2-typewriter ${isDone ? 'is-complete' : ''} ${className ?? ''}`.trim()}>{visibleText}</Component>;
}

function SequentialTextBlock({
  items,
  className
}: {
  items: Array<{ text: string; className?: string; as?: 'p' | 'span' | 'strong' }>;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={className}>
      {items.slice(0, activeIndex + 1).map((item, index) => (
        <TypewriterText
          key={`${item.text}-${index}`}
          text={item.text}
          className={item.className}
          as={item.as}
          start={index === activeIndex}
          onDone={() => setActiveIndex((value) => Math.max(value, index + 1))}
        />
      ))}
    </div>
  );
}

const projectGroupCopy = {
  'mobile-games': { en: 'WEB', ko: 'WEB' },
  apps: { en: 'Apps', ko: '앱' },
  toss: { en: 'Toss In-App', ko: '앱인토스' }
} as const;

function getProjectCopy(project: PersonalProject, locale: Locale) {
  if (locale === 'ko') {
    return {
      title: project.ko.title,
      category: project.ko.category,
      shortDesc: project.ko.shortDesc,
      process: project.ko.process
    };
  }

  return {
    title: project.title,
    category: project.category,
    shortDesc: project.shortDesc,
    process: project.process
  };
}

function getProjectCardCopy(project: PersonalProject, locale: Locale) {
  const cardCopy: Record<string, { en: { title: string; category: string }; ko: { title: string; category: string } }> = {
    'aussie-pus': {
      en: { title: 'Aussie Pus', category: 'Side Project' },
      ko: { title: 'Aussie Pus', category: '사이드 프로젝트' }
    },
    'photo-sorter': {
      en: { title: 'Photo Sorter', category: 'Automation' },
      ko: { title: '사진 분류', category: '자동화' }
    },
    'photo-weave': {
      en: { title: 'PhotoWeave Resize Stitch', category: 'Mac App' },
      ko: { title: 'PhotoWeave Resize Stitch', category: 'Mac 앱' }
    },
    'premium-qr-generator': {
      en: { title: 'Premium QR Generator', category: 'Web App' },
      ko: { title: 'Premium QR Generator', category: '웹 앱' }
    },
    'smart-text-analyzer': {
      en: { title: 'Smart Text Analyzer', category: 'Web App' },
      ko: { title: 'Smart Text Analyzer', category: '웹 앱' }
    },
    nagalttae: {
      en: { title: 'Nagalttae', category: 'Weather Mate' },
      ko: { title: '나갈때', category: '날씨 준비' }
    },
    'salt-bread-tycoon': {
      en: { title: 'Salt Bread Tycoon', category: 'Toss In-App Game' },
      ko: { title: '소금빵 키우기', category: '토스 인앱 게임' }
    },
    'summer-sound': {
      en: { title: 'Summer Sound', category: 'Toss In-App' },
      ko: { title: '여름소리', category: '토스 인앱' }
    },
    'blackbox-ffmpeg': {
      en: { title: 'Video Repair', category: 'Linux Tool' },
      ko: { title: '영상 복구', category: 'Linux 도구' }
    },
    'ai-posting': {
      en: { title: 'AI Posting', category: 'API Tool' },
      ko: { title: 'AI 포스팅', category: 'API 도구' }
    },
    decody: {
      en: { title: 'Decody', category: 'AI App' },
      ko: { title: 'Decody', category: 'AI 앱' }
    }
  };

  return cardCopy[project.id]?.[locale] ?? getProjectCopy(project, locale);
}

function getLocaleBasePath(locale: Locale) {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const localeIndex = segments.findIndex((segment) => segment === 'en' || segment === 'ko');

  if (localeIndex >= 0) {
    segments[localeIndex] = locale;
    return `/${segments.slice(0, localeIndex + 1).join('/')}`;
  }

  const chatIndex = segments.findIndex((segment) => segment === 'chat');
  if (chatIndex >= 0) {
    return `/${segments.slice(0, chatIndex).concat(locale).join('/')}`;
  }

  return `/${segments.concat(locale).join('/')}`;
}

function isChatPath() {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const localeIndex = segments.findIndex((segment) => segment === 'en' || segment === 'ko');
  return localeIndex >= 0 ? segments[localeIndex + 1] === 'chat' : segments.at(-1) === 'chat';
}

export function Version2Portfolio({ locale, onToggleLocale }: Props) {
  const t = copy[locale];
  const fluidCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PersonalProject | null>(null);
  const topic = activeTopic ? t.topics[activeTopic] : null;
  const inferTopicFromQuery = (rawQuery: string): Topic => {
    const normalized = rawQuery.toLowerCase();

    if (/career|company|work|job|experience|경력|회사|실무/.test(normalized)) return 'career';
    if (/side|project|app|game|프로젝트|게임|앱|사이드/.test(normalized)) return 'side';
    if (/skill|stack|tech|기술|스택/.test(normalized)) return 'skills';
    if (/fun|australia|global|automation|journey|travel|world|patagonia|호주|해외|자동화|여행|세계여행|파타고니아|기타/.test(normalized)) return 'fun';
    if (/contact|email|github|연락|메일|깃허브/.test(normalized)) return 'contact';
    return 'about';
  };

  const openTopic = (nextTopic: Topic, replace = false, questionOverride?: string) => {
    const nextQuestion = questionOverride?.trim() || copy[locale].topics[nextTopic].question;
    setActiveTopic(nextTopic);
    setActiveQuestion(nextQuestion);
    setIsAnswerLoading(true);
    setIsInfoOpen(false);
    setSelectedProject(null);
    setQuery('');
    const nextUrl = `${getLocaleBasePath(locale)}/chat?query=${encodeURIComponent(nextQuestion)}`;
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history[replace ? 'replaceState' : 'pushState']({ topic: nextTopic }, '', nextUrl);
    }
  };

  const closeChat = () => {
    setActiveTopic(null);
    setActiveQuestion('');
    setIsAnswerLoading(false);
    setIsInfoOpen(false);
    setQuery('');
    const nextUrl = getLocaleBasePath(locale);
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuestion = query.trim() || copy[locale].topics.about.question;
    openTopic(inferTopicFromQuery(nextQuestion), false, nextQuestion);
  };

  useEffect(() => {
    const syncFromUrl = () => {
      if (!isChatPath()) {
        setActiveTopic(null);
        setIsAnswerLoading(false);
        return;
      }

      const urlQuery = new URLSearchParams(window.location.search).get('query') ?? '';
      const nextTopic = inferTopicFromQuery(urlQuery);
      setActiveTopic(nextTopic);
      setActiveQuestion(urlQuery || copy[locale].topics[nextTopic].question);
      setIsAnswerLoading(true);
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [locale]);

  useEffect(() => {
    if (!activeTopic) return undefined;

    const timer = window.setTimeout(() => setIsAnswerLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, [activeTopic, activeQuestion, locale]);

  useFluidCanvas(fluidCanvasRef);

  return (
    <main className={`v2-aaabad ${activeTopic ? 'is-chat-open' : ''} ${activeTopic === 'side' ? 'is-side-open' : ''}`}>
      {!activeTopic && <canvas ref={fluidCanvasRef} className="v2-fluid-canvas" aria-hidden="true" />}
      {!activeTopic && (
        <section className="v2-landing" aria-label="Portfolio landing">
          <div className="v2-topbar">
            <button type="button" className="v2-pill-button" onClick={() => openTopic('about')}>
              <span className="v2-pill-label-long">{t.cta}</span>
              <span className="v2-pill-label-short">{t.back}</span>
              <ArrowIcon />
            </button>

            <div className="v2-actions">
              {onToggleLocale && (
                <button type="button" onClick={onToggleLocale} className="v2-ghost-button">
                  {locale === 'ko' ? 'English' : '한국어'}
                </button>
              )}
            </div>
          </div>

          <div className="v2-hero">
            <p className="v2-greeting">{t.greeting} 👋</p>
            <h1>{t.role}</h1>

            <button type="button" className="v2-avatar-button" onClick={() => openTopic('about')}>
              <img src={avatarUrl} alt="Developer avatar" />
            </button>

            <form className="v2-search" onSubmit={handleSubmit}>
              <input
                type="text"
                value={query}
                placeholder={t.searchPlaceholder}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t.searchPlaceholder}
              />
              <button type="submit" aria-label="Submit">
                <ArrowIcon />
              </button>
            </form>

            <div className="v2-topic-grid" aria-label="Portfolio topics">
              {topicOrder.map((key) => (
                <button key={key} type="button" className="v2-topic-card" onClick={() => openTopic(key)}>
                  <TopicIcon topic={key} />
                  <span>{t.topics[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="v2-watermark" aria-hidden="true">
            {t.watermark}
          </div>
        </section>
      )}

      {topic && activeTopic && (
        <section className="v2-chat" aria-label={t.portfolioTitle}>
          <header className="v2-chat-top">
            <button type="button" className="v2-build-yours" onClick={closeChat}>
              <span className="v2-pill-label-long">{t.cta}</span>
              <span className="v2-pill-label-short">{t.back}</span>
              <span className="v2-chat-build-arrow">
                <ArrowIcon />
              </span>
            </button>
            <img src={avatarUrl} alt="Developer avatar" />
            {onToggleLocale && (
              <button type="button" className="v2-chat-lang" onClick={onToggleLocale}>
                {locale === 'ko' ? 'English' : '한국어'}
              </button>
            )}
          </header>

          {isInfoOpen && (
            <div className="v2-info-backdrop" role="dialog" aria-modal="true" aria-label="Portfolio information">
              <section className="v2-info-panel">
                <button type="button" className="v2-info-close" onClick={() => setIsInfoOpen(false)}>
                  ×
                </button>
                <h2>{t.infoTitle}</h2>
                <div className="v2-info-copy-card">
                  <h3>{t.infoWhat}</h3>
                  <p>{t.infoWhatBody}</p>
                  <h3>{t.infoWhy}</h3>
                  <p>{t.infoWhyBody}</p>
                </div>
                <div className="v2-info-actions">
                  <button type="button" onClick={() => setIsInfoOpen(false)}>
                    Start Chatting
                  </button>
                  <p>
                    {locale === 'ko' ? '마음에 든다면 공유해주세요. 피드백은 언제나 환영합니다. ' : 'If you love it, please share it! Feedback is always welcome. '}
                    <a href={`mailto:${profile.contact.email}`}>{locale === 'ko' ? '연락하기.' : 'Contact me.'}</a>
                  </p>
                </div>
              </section>
            </div>
          )}

          <div className="v2-chat-body">
            {isAnswerLoading ? (
              <div className="v2-loading-dots" aria-label="Loading answer">
                <span />
                <span />
                <span />
              </div>
            ) : (
              <>
                {activeTopic === 'career' && <CareerBlock locale={locale} topic={topic} />}
                {activeTopic === 'side' && (
                  <SideProjectsBlock
                    locale={locale}
                    topic={topic}
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                    onCloseProject={() => setSelectedProject(null)}
                  />
                )}

                {activeTopic === 'skills' && <SkillsExpertiseBlock locale={locale} />}
                {activeTopic === 'contact' && <ContactBlock locale={locale} />}

                {activeTopic !== 'career' && activeTopic !== 'side' && (
                  <article className="v2-topic-note">
                    {activeTopic === 'about' && (
                      <img className="v2-about-avatar-square" src={avatarUrl} alt={locale === 'ko' ? '김성경 GitHub 프로필 사진' : 'Kim Seongkyung GitHub profile'} />
                    )}
                    <SequentialTextBlock
                      key={`${activeTopic}-${locale}`}
                      items={[
                        { text: topic.title, className: 'v2-message-title' },
                        { text: topic.answer },
                        { text: topic.bullets[0], className: 'v2-topic-question' }
                      ]}
                    />
                    {activeTopic === 'fun' && (
                      <figure className="v2-fun-photo">
                        <img src={travelPhotoUrl} alt={locale === 'ko' ? '파타고니아 세계여행 사진' : 'Patagonia world travel photo'} />
                        <figcaption>{locale === 'ko' ? '파타고니아에서 찍은 세계여행 사진' : 'A Patagonia moment from my one-year world travel'}</figcaption>
                      </figure>
                    )}
                  </article>
                )}
              </>
            )}

          </div>

          <div className="v2-chat-composer">
            <button type="button" className="v2-quick-toggle" onClick={() => setShowQuickQuestions((value) => !value)}>
              {showQuickQuestions ? t.hideQuick : t.showQuick}
            </button>
            {showQuickQuestions && (
              <nav className="v2-chat-nav" aria-label="Quick topics">
                {topicOrder.map((key) => (
                  <button key={key} type="button" className={activeTopic === key ? 'is-active' : ''} onClick={() => openTopic(key)}>
                    <TopicIcon topic={key} />
                    <span>{t.topics[key].label}</span>
                  </button>
                ))}
                <button type="button" className="v2-chat-more" onClick={closeChat} aria-label={t.back}>
                  ...
                </button>
              </nav>
            )}
            <form className="v2-chat-input" onSubmit={handleSubmit}>
              <input
                type="text"
                value={query}
                placeholder={locale === 'ko' ? '무엇이든 물어보세요' : 'Ask me anything'}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit" aria-label="Submit">
                <ArrowIcon />
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}

function getMilestoneCopy(milestone: PortfolioMilestone, locale: Locale) {
  if (locale === 'ko' && milestone.ko) {
    return {
      title: milestone.ko.title,
      subtitle: milestone.ko.subtitle,
      summary: milestone.ko.summary,
      details: milestone.ko.details
    };
  }

  return {
    title: milestone.title,
    subtitle: milestone.subtitle,
    summary: milestone.summary,
    details: milestone.details
  };
}

const careerResumeCopy: Record<
  string,
  {
    en: { summary: string; details: string[] };
    ko: { summary: string; details: string[] };
  }
> = {
  inhouse: {
    en: {
      summary: 'Manager / Web Developer / Feb 2026 - May 2026',
      details: [
        'Developed pharmaceutical safety card, archive, and electronic document integrated management system features.',
        'Operated and improved core functions in a Spring Boot + React(Vite) DSIMS platform, including pharmaceutical safety card issuance, search, management, document classification, document registration, disposal management, and external viewing.',
        'Improved Excel bulk upload processing for roughly 20,000 to 50,000 rows by parsing files with Apache POI and loading large data through PostgreSQL COPY.',
        'Organized permission and status-based screen flows and access control to improve user workflow consistency and operational efficiency.'
      ]
    },
    ko: {
      summary: '과장 / 웹개발자 / 2026.02 ~ 2026.05',
      details: [
        '의약품안전카드, 문서고, 전자문서 통합관리 시스템 개발',
        'Spring Boot + React(Vite) 기반 DSIMS 플랫폼(CD/DR)에서 의약품안전카드 발급·조회·관리와 문서고/전자문서의 문서분류·문서등록·파기관리·외부열람 핵심 기능을 운영·개선함.',
        'Excel 대량 업로드(건수 기준 2만~5만 건) 처리를 Apache POI로 업로드 파일을 파싱한 뒤 PostgreSQL COPY 기반으로 다량 데이터 적재 성능을 확보함.',
        '권한·상태 기반 화면 흐름과 접근 제어를 정리해 사용자 작업 동선 일관성과 운영 효율을 높임.'
      ]
    }
  },
  ourcom: {
    en: {
      summary: 'Manager / Web Developer / May 2025 - Dec 2025',
      details: [
        'Developed SK hynix ethics management work system features.',
        'Implemented report system backend logic with Java and Oracle.',
        'Developed report submission, approval process, and administration features.',
        'Designed database structures and wrote SQL for report data management.',
        'Implemented multilingual frontend screens with Thymeleaf and managed source control with SVN in IntelliJ.'
      ]
    },
    ko: {
      summary: '과장 / 웹개발자 / 2025.05 ~ 2025.12',
      details: [
        'SK하이닉스 윤리경영업무 시스템 개발',
        '제보 시스템 백엔드 로직 구현 (JAVA, Oracle)',
        '제보 접수, 승인 프로세스 및 관리 기능 개발',
        '제보 데이터 관리를 위한 DB 설계 및 SQL 작성',
        '다국어 지원 프론트엔드 구현 (Thymeleaf)',
        'IntelliJ 기반 개발 및 SVN을 활용한 소스 형상 관리'
      ]
    }
  },
  careercare: {
    en: {
      summary: 'IT Research Institute, Senior Researcher / Jun 2019 - Oct 2023',
      details: [
        'Developed and maintained the internal CANDI system.',
        'Maintained CANDI, converted .NET-based code to Java, and developed new features in Java. Used MSSQL for required database work and managed deployment processes to support stable system operation.',
        'Developed and maintained BusinessPeople web and app services mainly with Java. Connected services with MSSQL and deployed through AWS to provide an efficient and stable service environment.',
        'Handled SEO work such as meta tag updates, keyword optimization, traffic analysis, and sitemap management.',
        'Maintained the company official homepage based on PHP and handled simple updates and error response.'
      ]
    },
    ko: {
      summary: '정보기술연구소 책임연구원 / 2019.06 ~ 2023.10',
      details: [
        'CANDI 시스템 개발 및 유지보수',
        '사내 시스템인 CANDI를 개발 및 유지보수하며, 닷넷 기반 코드를 Java로 전환하거나 신규 기능을 Java로 개발함. MSSQL을 사용하여 필요한 데이터베이스 작업을 수행하며, 배포 프로세스 전반을 관리하여 안정적인 시스템 운영을 지원함.',
        '비즈니스피플 웹·앱 개발 및 AWS 배포',
        '비즈니스피플 웹페이지와 앱을 Java를 중심으로 개발하며, 신규 기능 구현 및 유지보수를 수행. MSSQL을 활용해 데이터베이스를 연동하여 개발 작업을 진행하였고, AWS를 활용해 서비스 배포를 진행하여 효율적이고 안정적인 서비스 환경을 제공함.',
        '검색 엔진 최적화를 위해 메타 태그 수정, 키워드 최적화, 트래픽 분석, 사이트맵 관리 등 SEO 작업을 수행함.',
        '회사 공식 홈페이지 관리',
        'PHP 기반의 회사 공식 홈페이지를 유지보수하며, 간단한 수정 작업 및 오류 대응을 수행함.'
      ]
    }
  },
  bogosys: {
    en: {
      summary: 'Application Development Team, Staff / Dec 2017 - Mar 2019',
      details: [
        'Worked on common module development for an LG U+ project.',
        'Analyzed and reflected requirements while collaborating with other teams and team members.',
        'Implemented screens with Java, JavaScript, and WebSquare.',
        'Used Sourcetree for Git source version control.'
      ]
    },
    ko: {
      summary: '응용개발팀 사원 / 2017.12 ~ 2019.03',
      details: [
        'LG U 프로젝트에서 공통 모듈 개발을 담당하며, 다른 팀, 팀원들과 협업하여 요구사항을 분석·반영함.',
        'Java와 JavaScript를 활용해 WebSquare 툴로 화면을 구현하고, Sourcetree를 사용해 Git 버전 관리를 수행함.'
      ]
    }
  }
};

function CareerBlock({ locale, topic }: { locale: Locale; topic: TopicCopy }) {
  const [selectedCareer, setSelectedCareer] = useState<PortfolioMilestone | null>(null);

  return (
    <section className="v2-career-block">
      {selectedCareer && <CareerDetailModal milestone={selectedCareer} locale={locale} onClose={() => setSelectedCareer(null)} />}
      <SequentialTextBlock
        key={`career-${locale}`}
        items={[
          { text: topic.title, className: 'v2-message-title' },
          { text: topic.answer }
        ]}
      />
      <div className="v2-career-timeline">
        {careerMilestones.map((milestone, index) => {
          const milestoneCopy = getMilestoneCopy(milestone, locale);
          const resumeCopy = careerResumeCopy[milestone.id]?.[locale];
          return (
            <button
              key={milestone.id}
              type="button"
              className="v2-career-item"
              style={{ animationDelay: `${index * 90 + 520}ms` }}
              onClick={() => setSelectedCareer(milestone)}
            >
              <span>{milestone.year}</span>
              <h2>{milestoneCopy.title}</h2>
              <strong>{milestoneCopy.subtitle}</strong>
              <p>{resumeCopy?.summary ?? milestoneCopy.summary}</p>
              <div>
                {milestone.skills.slice(0, 6).map((skill) => (
                  <em key={skill}>{skill}</em>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CareerDetailModal({ milestone, locale, onClose }: { milestone: PortfolioMilestone; locale: Locale; onClose: () => void }) {
  const milestoneCopy = getMilestoneCopy(milestone, locale);
  const resumeCopy = careerResumeCopy[milestone.id]?.[locale];
  const labels = locale === 'ko' ? { close: '닫기', detail: '상세 이력' } : { close: 'Close', detail: 'Resume Detail' };

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeWithEscape);
    return () => window.removeEventListener('keydown', closeWithEscape);
  }, [onClose]);

  return (
    <div className="v2-career-modal-backdrop" role="presentation" onClick={onClose}>
      <article className="v2-career-modal" role="dialog" aria-modal="true" aria-labelledby="career-detail-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="v2-career-modal-close" onClick={onClose}>
          {labels.close}
        </button>
        <span>{labels.detail}</span>
        <h2 id="career-detail-title">{milestoneCopy.title}</h2>
        <strong>{resumeCopy?.summary ?? milestoneCopy.subtitle}</strong>
        <div>
          {(resumeCopy?.details ?? milestoneCopy.details).map((detail) => (
            <p key={detail}>{detail}</p>
          ))}
        </div>
      </article>
    </div>
  );
}

function SideProjectsBlock({
  locale,
  topic,
  selectedProject,
  onSelectProject,
  onCloseProject
}: {
  locale: Locale;
  topic: TopicCopy;
  selectedProject: PersonalProject | null;
  onSelectProject: (project: PersonalProject) => void;
  onCloseProject: () => void;
}) {
  const isKorean = locale === 'ko';
  const projectDetailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    window.setTimeout(() => {
      projectDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      projectDetailRef.current?.focus({ preventScroll: true });
    }, 80);
  }, [selectedProject]);

  return (
    <div className="v2-projects v2-side-projects">
      <SequentialTextBlock
        key={`side-${locale}`}
        items={[
          { text: topic.title, className: 'v2-message-title' },
          { text: topic.answer }
        ]}
      />

      <div className="v2-aussie-strip" aria-label={isKorean ? 'Aussie Pus 게임 아이콘' : 'Aussie Pus game icons'}>
        {aussieProductIcons.map((product) => (
          <a key={product.title} href="https://aussie-pus.pages.dev/#games" target="_blank" rel="noreferrer">
            <img src={product.src} alt={product.title} />
            <span>{product.title}</span>
          </a>
        ))}
      </div>

      <h2>{isKorean ? '사이드 프로젝트' : 'Side Projects'}</h2>
      <div className="v2-project-groups">
        {(['apps', 'toss'] as const).map((group) => {
          const groupProjects = personalProjects.filter((project) => project.portfolioGroup === group);
          const groupLabel = projectGroupCopy[group][locale];
          return (
            <section key={group} className={`v2-project-group v2-project-group-${group}`} aria-labelledby={`project-group-${group}`}>
              <h3 id={`project-group-${group}`}>{groupLabel}</h3>
              <div className="v2-project-group-grid">
                {groupProjects.map((project) => {
                  const projectCopy = getProjectCopy(project, locale);
                  const cardCopy = getProjectCardCopy(project, locale);
                  return (
                    <button
                      key={project.id}
                      type="button"
                      className={`v2-project-card is-${project.id}`}
                      onClick={() => onSelectProject(project)}
                      aria-label={`${cardCopy.title}: ${projectCopy.shortDesc}`}
                    >
                      <ProjectGlyph projectId={project.id} />
                      <span>{cardCopy.category}</span>
                      <strong>{cardCopy.title}</strong>
                      <p>{projectCopy.shortDesc}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {selectedProject && (
        <div ref={projectDetailRef} className="v2-project-detail-focus" tabIndex={-1}>
          <ProjectDetail project={selectedProject} locale={locale} onClose={onCloseProject} />
        </div>
      )}
    </div>
  );
}

function ProjectGlyph({ projectId }: { projectId: string }) {
  const iconByProject: Record<string, string> = {
    'aussie-pus': `${assetBaseUrl}assets/aussie-pus-icon.png`,
    nagalttae: `${assetBaseUrl}assets/nagalttae-logo.png`,
    'photo-sorter': `${assetBaseUrl}assets/photo-sorter-icon.svg`,
    'photo-weave': `${assetBaseUrl}assets/photoweave-icon.png`,
    'premium-qr-generator': `${assetBaseUrl}assets/qr-generator-icon.svg`,
    'smart-text-analyzer': `${assetBaseUrl}assets/text-analyzer-icon.svg`,
    'salt-bread-tycoon': `${assetBaseUrl}assets/salt-bread-toss-logo.png`,
    'summer-sound': `${assetBaseUrl}assets/summer-sound-toss-logo.png`,
    decody: `${assetBaseUrl}assets/decody-icon.png`,
    'neon-tower': 'https://aussie-pus.pages.dev/neonTower.png',
    'neon-bricks': 'https://aussie-pus.pages.dev/neonBricks.png',
    arcflare: 'https://aussie-pus.pages.dev/arcflare_logo.png',
    'car-out-puzzle': 'https://aussie-pus.pages.dev/carOutPuzzle.png',
    decernum: 'https://aussie-pus.pages.dev/decernum/assets/icon.png'
  };

  const iconUrl = iconByProject[projectId];
  if (iconUrl) {
    return (
      <span className="v2-project-glyph">
        <img src={iconUrl} alt="" />
      </span>
    );
  }

  return <span className={`v2-project-glyph v2-project-glyph-${projectId}`} aria-hidden="true" />;
}

function ProjectDetail({ project, locale, onClose }: { project: PersonalProject; locale: Locale; onClose: () => void }) {
  const projectCopy = getProjectCopy(project, locale);
  const labels =
    locale === 'ko'
      ? { close: '닫기', background: '배경', architecture: '구성', outcome: '결과', website: '웹사이트' }
      : { close: 'Close', background: 'Background', architecture: 'Architecture', outcome: 'Outcome', website: 'Website' };

  return (
    <article className="v2-project-detail">
      <button type="button" onClick={onClose} className="v2-project-detail-close">
        {labels.close}
      </button>
      <span>{projectCopy.category}</span>
      <h2>{projectCopy.title}</h2>
      {project.year && <p className="v2-project-year">{project.year}</p>}
      <p>{projectCopy.shortDesc}</p>
      <div className="v2-project-tags">
        {project.tags.map((tag) => (
          <em key={tag}>{tag}</em>
        ))}
      </div>
      <div className="v2-project-process">
        <strong>{labels.background}</strong>
        <p>{projectCopy.process.background}</p>
        <strong>{labels.architecture}</strong>
        <p>{projectCopy.process.architecture}</p>
        <strong>{labels.outcome}</strong>
        <p>{projectCopy.process.outcome}</p>
      </div>
      <div className="v2-project-links">
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer">
            {labels.website}
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
      </div>
    </article>
  );
}

function SkillsExpertiseBlock({ locale }: { locale: Locale }) {
  const isKorean = locale === 'ko';

  return (
    <section className="v2-skills-expertise" aria-label={isKorean ? '기술 스택' : 'Skills and expertise'}>
      <h2>{isKorean ? '기술 스택' : 'Skills & Expertise'}</h2>
      {skillGroups.map((group) => (
        <div key={group.title} className="v2-skill-group">
          <h3>{isKorean ? group.koTitle : group.title}</h3>
          <div>
            {group.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ContactBlock({ locale }: { locale: Locale }) {
  const isKorean = locale === 'ko';

  return (
    <section className="v2-contact-card" aria-label={isKorean ? '연락처' : 'Contacts'}>
      <h2>{isKorean ? '연락처' : 'Contacts'}</h2>
      <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
      <div>
        <a href="https://github.com/amaranth92" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://aussie-pus.pages.dev/" target="_blank" rel="noreferrer">
          Aussie Pus
        </a>
        <a href="https://github.com/amaranth92?tab=repositories" target="_blank" rel="noreferrer">
          Repositories
        </a>
      </div>
    </section>
  );
}
