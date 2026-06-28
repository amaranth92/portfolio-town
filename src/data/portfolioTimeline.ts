export type PortfolioMilestone = {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  category: 'company' | 'education' | 'certificate' | 'global' | 'project';
  chapterTheme: 'campus' | 'office' | 'australia' | 'lab' | 'modern' | 'contact';
  summary: string;
  details: string[];
  skills: string[];
  ko?: {
    title: string;
    subtitle: string;
    summary: string;
    details: string[];
  };
};

export type PersonalProject = {
  id: string;
  title: string;
  category: string;
  year?: string;
  shortDesc: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  isPrivateRepo?: boolean;
  process: {
    background: string;
    architecture: string;
    troubleshooting: string;
    outcome: string;
  };
  ko: {
    title: string;
    category: string;
    shortDesc: string;
    process: {
      background: string;
      architecture: string;
      troubleshooting: string;
      outcome: string;
    };
  };
};

export const profile = {
  name: 'Backend / Web Developer',
  headline: 'Java web developer with operational stability and improvement experience',
  location: 'Seoul, South Korea',
  experience: '6 years 8 months',
  contact: {
    email: 'bible_kim@nate.com',
    note: 'Available for backend developer, web developer, system engineer, and network engineer roles.'
  },
  links: [
    { label: 'Aussie Pus Studio', url: 'https://aussie-pus.pages.dev/' },
    { label: 'GitHub', url: 'https://github.com/amaranth92' }
  ],
  ko: {
    name: '백엔드 / 웹 개발자',
    headline: '운영 안정성과 개선 경험을 갖춘 Java 웹개발자',
    location: '서울, 대한민국',
    experience: '총 경력 6년 8개월',
    contactNote: '백엔드, 웹 개발, 시스템 엔지니어, 네트워크 엔지니어 직무를 희망합니다.'
  }
};

export const personalProjects: PersonalProject[] = [
  {
    id: 'aussie-pus',
    year: '2026',
    title: 'Aussie Pus Studio',
    category: 'Side Project / Web Games',
    shortDesc: 'A collection of browser and mobile-friendly games released as a personal game studio site.',
    demoUrl: 'https://aussie-pus.pages.dev/',
    tags: ['JavaScript', 'Canvas', 'Game UI', 'Mobile Web'],
    isPrivateRepo: true,
    process: {
      background: 'Built to keep experimenting with small playable ideas outside enterprise work.',
      architecture: 'Created browser-first games with lightweight rendering, direct input handling, and responsive layouts.',
      troubleshooting: 'Iterated on mobile control size, performance, and asset loading so the games could be tested quickly on phones.',
      outcome: 'Published a public game hub that can be linked from the portfolio and expanded with new experiments.'
    },
    ko: {
      title: 'Aussie Pus Studio',
      category: '사이드 프로젝트 / 웹 게임',
      shortDesc: '개인 게임 스튜디오 형태로 브라우저와 모바일에서 테스트 가능한 게임들을 모아둔 사이트입니다.',
      process: {
        background: '업무 외에도 직접 플레이 가능한 작은 아이디어를 계속 실험하기 위해 만들었습니다.',
        architecture: '가벼운 렌더링, 직접 입력 처리, 반응형 레이아웃을 중심으로 브라우저 게임을 구성했습니다.',
        troubleshooting: '모바일 조작 크기, 성능, 에셋 로딩을 반복 조정해 휴대폰에서도 빠르게 테스트할 수 있게 했습니다.',
        outcome: '포트폴리오에서 연결 가능한 공개 게임 허브를 만들었고, 이후 프로젝트를 계속 추가할 수 있는 기반을 마련했습니다.'
      }
    }
  },
  {
    id: 'photo-sorter',
    title: 'Photo EXIF Sorter',
    category: 'Automation Tool',
    shortDesc: 'Python tool that sorts 10,000+ travel photos by date and location using EXIF metadata.',
    tags: ['Python', 'EXIF', 'File I/O', 'Automation'],
    process: {
      background: 'Created after world travel produced a large photo archive that was too slow to organize manually.',
      architecture: 'Read EXIF timestamps and GPS metadata, then generated folder structures based on configurable rules.',
      troubleshooting: 'Handled missing metadata with fallback dates and duplicate checks to avoid accidental data loss.',
      outcome: 'Reduced a repetitive photo-cleanup task from manual sorting to a reusable automation workflow.'
    },
    ko: {
      title: '사진 EXIF 자동 분류 프로그램',
      category: '자동화 도구',
      shortDesc: '여행 사진 10,000장 이상을 EXIF 날짜와 위치 기준으로 자동 분류하는 Python 도구입니다.',
      process: {
        background: '세계여행 중 쌓인 대량의 사진을 수작업으로 정리하기 어려워 직접 만들었습니다.',
        architecture: 'EXIF의 촬영 시간과 GPS 정보를 읽고, 사용자가 정한 규칙에 맞춰 폴더 구조를 생성했습니다.',
        troubleshooting: '메타데이터가 없거나 손상된 파일은 파일 날짜와 중복 검사를 활용해 데이터 손실 없이 처리했습니다.',
        outcome: '반복적인 사진 정리 작업을 재사용 가능한 자동화 흐름으로 줄였습니다.'
      }
    }
  },
  {
    id: 'decody',
    title: 'Decody',
    category: 'Developer Utility',
    shortDesc: 'Web-based parsing and decoding utility for backend debugging work.',
    githubUrl: 'https://github.com/amaranth92/decody',
    tags: ['TypeScript', 'Parsing', 'Base64', 'JWT'],
    process: {
      background: 'Built to speed up common backend debugging tasks such as decoding tokens and structured strings.',
      architecture: 'Kept parsing client-side so sensitive text does not need to be transmitted to a server.',
      troubleshooting: 'Focused on predictable formatting and immediate feedback for copied production-like strings.',
      outcome: 'Created a small developer tool that supports day-to-day debugging habits.'
    },
    ko: {
      title: 'Decody',
      category: '개발자 유틸리티',
      shortDesc: '백엔드 디버깅에 필요한 문자열 파싱과 디코딩을 빠르게 처리하는 웹 도구입니다.',
      process: {
        background: '토큰, 인코딩 문자열, 구조화된 텍스트를 빠르게 확인하기 위해 만들었습니다.',
        architecture: '민감한 문자열을 서버로 보내지 않도록 브라우저 안에서 파싱하도록 구성했습니다.',
        troubleshooting: '실무에서 복사한 문자열을 바로 확인할 수 있도록 예측 가능한 포맷과 즉시 피드백에 집중했습니다.',
        outcome: '일상적인 디버깅 습관을 도와주는 작은 개발자 도구를 만들었습니다.'
      }
    }
  }
];

export const portfolioTimeline: PortfolioMilestone[] = [
  {
    id: 'education',
    year: '2011-2017',
    title: 'Korea National University of Transportation',
    subtitle: 'Computer Information Engineering',
    category: 'education',
    chapterTheme: 'campus',
    summary: 'Graduated from the Uiwang campus and built the foundation for Java, web, and database development.',
    details: [
      'Graduation project: presidential pledge matching web page.',
      'Database practice project: presidential pledge comparison web page.',
      'GPA 3.2 / 4.5.'
    ],
    skills: ['Java', 'JSP', 'Servlet', 'SQL'],
    ko: {
      title: '한국교통대학교',
      subtitle: '컴퓨터정보공학과',
      summary: '의왕캠퍼스 컴퓨터정보공학과를 졸업하며 Java, 웹, 데이터베이스 개발 기반을 다졌습니다.',
      details: ['졸업 작품으로 대선 공약 매칭 웹페이지를 개발했습니다.', '데이터베이스 실습 작품으로 대선 공약 비교 웹페이지를 만들었습니다.', '학점 3.2 / 4.5.']
    }
  },
  {
    id: 'training',
    year: '2016-2017',
    title: 'Certification & Java Web/App Training',
    subtitle: 'Engineer Information Processing / Java Smart Web&App',
    category: 'certificate',
    chapterTheme: 'campus',
    summary: 'Earned Engineer Information Processing certification and completed intensive Java web/app training.',
    details: [
      'Studied Java, database concepts, HTML5, CSS, JavaScript, jQuery, and Ajax.',
      'Built board-style web applications with JSP, Servlet, and Spring Framework.',
      'Earned a class 1 ordinary driver license.'
    ],
    skills: ['Engineer Information Processing', 'HTML5', 'JavaScript', 'jQuery', 'Ajax', 'Spring'],
    ko: {
      title: '자격증 및 Java 웹/앱 교육',
      subtitle: '정보처리기사 / Java 스마트 융합 웹&앱 과정',
      summary: '정보처리기사를 취득하고 Java 웹/앱 개발자 전문과정을 수료했습니다.',
      details: ['Java, 데이터베이스, HTML5, CSS, JavaScript, jQuery, Ajax를 학습했습니다.', 'JSP, Servlet, Spring Framework 기반 게시판 프로젝트를 구현했습니다.', '1종보통운전면허를 취득했습니다.']
    }
  },
  {
    id: 'bogosys',
    year: '2017-2019',
    title: 'Bogo Information System',
    subtitle: 'Application Developer, LG U+ Project',
    category: 'company',
    chapterTheme: 'office',
    summary: 'Developed shared modules and enterprise screens for an LG U+ project.',
    details: [
      'Implemented screens with Java, JavaScript, and WebSquare.',
      'Worked with other teams to analyze and reflect requirements.',
      'Managed source control with Sourcetree and Git.'
    ],
    skills: ['Java', 'JavaScript', 'WebSquare', 'Git', 'Sourcetree'],
    ko: {
      title: '보고정보시스템',
      subtitle: '응용개발팀 사원, LG U+ 프로젝트',
      summary: 'LG U+ 프로젝트에서 공통 모듈과 업무 화면 개발을 담당했습니다.',
      details: ['Java, JavaScript, WebSquare로 화면을 구현했습니다.', '다른 팀과 협업해 요구사항을 분석하고 반영했습니다.', 'Sourcetree와 Git으로 소스 형상 관리를 수행했습니다.']
    }
  },
  {
    id: 'careercare',
    year: '2019-2023',
    title: 'CareerCare R&D Institute',
    subtitle: 'Senior Researcher, CANDI & BusinessPeople',
    category: 'company',
    chapterTheme: 'office',
    summary: 'Maintained CANDI, migrated legacy .NET/C# work to Java, and developed BusinessPeople web/app features.',
    details: [
      'Maintained internal CANDI systems and converted .NET/C# code paths to Java.',
      'Developed and deployed BusinessPeople web/app services with Java, MSSQL, and AWS.',
      'Handled SEO work, sitemap management, PHP homepage maintenance, and deployment operations.'
    ],
    skills: ['Java', 'C#', '.NET', 'MSSQL', 'AWS', 'SEO', 'PHP'],
    ko: {
      title: '커리어케어',
      subtitle: '정보기술연구소 책임연구원',
      summary: 'CANDI 시스템 유지보수, .NET/C# 기반 기능의 Java 전환, 비즈니스피플 웹/앱 개발과 AWS 배포를 수행했습니다.',
      details: ['사내 CANDI 시스템을 유지보수하고 신규 기능을 Java로 개발했습니다.', '비즈니스피플 웹/앱을 Java, MSSQL, AWS 기반으로 개발 및 배포했습니다.', 'SEO, 사이트맵, PHP 공식 홈페이지 유지보수도 함께 수행했습니다.']
    }
  },
  {
    id: 'australia',
    year: '2023-2024',
    title: 'Australia Perth Global Experience',
    subtitle: 'Uber Eats / Uber Driver',
    category: 'global',
    chapterTheme: 'australia',
    summary: 'Built adaptability, self-management, and customer communication experience while working independently in Perth.',
    details: [
      'Worked as an Uber Eats and Uber Driver in Perth for 10 months.',
      'Traveled around the world for about one year, including Patagonia, and built a broader global perspective.',
      'Strengthened practical English communication and customer response skills.',
      'Built personal automation projects during travel and daily life.'
    ],
    skills: ['Global Mindset', 'English Communication', 'Self-Management', 'World Travel', 'Automation'],
    ko: {
      title: '호주 퍼스 해외 경험',
      subtitle: 'Uber Eats / Uber Driver / 세계여행',
      summary: '호주 퍼스에서 자율적으로 일하고 약 1년간 세계여행을 하며 적응력, 자기관리, 글로벌 감각을 쌓았습니다.',
      details: ['10개월 동안 Uber Eats 및 Uber Driver로 활동했습니다.', '파타고니아를 포함해 약 1년간 세계여행을 하며 시야를 넓혔습니다.', '실전 영어 커뮤니케이션과 고객 응대 경험을 쌓았습니다.', '여행과 생활 속 불편함을 해결하는 개인 자동화 프로젝트를 진행했습니다.']
    }
  },
  {
    id: 'ourcom',
    year: '2025',
    title: 'Ourcom',
    subtitle: 'SK hynix Ethics Management System',
    category: 'company',
    chapterTheme: 'modern',
    summary: 'Built backend workflows and multilingual web screens for SK hynix ethics management work.',
    details: [
      'Implemented report submission, approval process, and administration logic with Java and Oracle.',
      'Designed SQL for report data management.',
      'Built multilingual frontend screens with Thymeleaf and managed code with SVN.'
    ],
    skills: ['Java', 'Oracle', 'Thymeleaf', 'SQL', 'SVN', 'IntelliJ'],
    ko: {
      title: '아워콤',
      subtitle: 'SK하이닉스 윤리경영업무 시스템',
      summary: 'SK하이닉스 윤리경영업무 시스템에서 제보 접수, 승인, 관리 기능을 개발했습니다.',
      details: ['Java와 Oracle 기반 백엔드 로직을 구현했습니다.', '제보 데이터 관리를 위한 DB 설계와 SQL을 작성했습니다.', 'Thymeleaf 다국어 화면과 SVN 형상 관리를 수행했습니다.']
    }
  },
  {
    id: 'inhouse',
    year: '2026',
    title: 'InhouseSoft',
    subtitle: 'DSIMS Platform, Spring Boot + React',
    category: 'company',
    chapterTheme: 'modern',
    summary: 'Improved pharmaceutical safety card, archive, and digital document features in a Spring Boot + React platform.',
    details: [
      'Operated and improved drug safety card issuance, search, and management functions.',
      'Developed document classification, registration, disposal management, and external viewing workflows.',
      'Improved 20,000 to 50,000 row Excel upload OutOfMemory and timeout issues with POI Streaming API and PostgreSQL COPY.'
    ],
    skills: ['Spring Boot', 'React', 'Vite', 'PostgreSQL', 'POI Streaming', 'COPY'],
    ko: {
      title: '인하우스소프트',
      subtitle: 'DSIMS 플랫폼, Spring Boot + React',
      summary: 'Spring Boot + React 기반 DSIMS 플랫폼에서 의약품안전카드, 문서고, 전자문서 핵심 기능을 운영 및 개선했습니다.',
      details: ['의약품안전카드 발급 상태 관리 로직과 조회, 관리 기능을 개선했습니다.', '문서분류, 문서등록, 파기관리, 외부열람 흐름을 개발했습니다.', 'POI Streaming API와 PostgreSQL COPY로 2만-5만 건 Excel 업로드의 OutOfMemory 및 타임아웃 문제를 개선했습니다.']
    }
  },
  {
    id: 'contact',
    year: 'Contact',
    title: 'Contact & Summary',
    subtitle: 'Backend / Web Developer',
    category: 'project',
    chapterTheme: 'contact',
    summary: 'Open to backend developer, web developer, system engineer, and network engineer roles in Seoul.',
    details: [
      'Core stack: Java, Spring Boot, React, JavaScript, MyBatis, MSSQL, Oracle, PostgreSQL, AWS.',
      'GitHub: https://github.com/amaranth92',
      'Aussie Pus Studio: https://aussie-pus.pages.dev/'
    ],
    skills: ['Java', 'Spring Boot', 'React', 'AWS', 'PostgreSQL', 'GitHub'],
    ko: {
      title: '연락 및 요약',
      subtitle: '백엔드 / 웹 개발자',
      summary: '서울 지역 백엔드 개발자, 웹 개발자, 시스템 엔지니어, 네트워크 엔지니어 직무를 희망합니다.',
      details: ['주요 스택: Java, Spring Boot, React, JavaScript, MyBatis, MSSQL, Oracle, PostgreSQL, AWS.', 'GitHub: https://github.com/amaranth92', 'Aussie Pus Studio: https://aussie-pus.pages.dev/']
    }
  }
];
