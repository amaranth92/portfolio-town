export type PortfolioMilestone = {
  id: string;
  year: string;
  title: string;
  subtitle: string;
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

export const profile = {
  // RecruiterMode의 상단 프로필과 연락처 영역에서 사용하는 정적 소개 정보입니다.
  name: 'Backend / Web Developer',
  headline: 'Stability-minded developer who keeps learning current tools',
  location: 'Seoul, South Korea',
  experience: '6 years 9 months',
  contact: {
    email: 'contact@example.com',
    note: 'Available for backend developer, web developer, system engineer, network engineer roles.'
  },
  ko: {
    name: '백엔드 / 웹 개발자',
    headline: '안정성을 중요시하며 최신 기술을 꾸준히 학습하는 개발자',
    location: '서울, 대한민국',
    experience: '총 경력 6년 9개월',
    contactNote: '백엔드 개발자, 웹 개발자, 시스템/네트워크 엔지니어 직무를 희망합니다.'
  }
};

// 배열 순서가 곧 게임 월드의 챕터 순서입니다. 각 항목은 한 개의 구간, ! 블록 팝업, 기술 수집품의 원천 데이터가 됩니다.
export const portfolioTimeline: PortfolioMilestone[] = [
  {
    id: 'education',
    year: '2011-2017',
    title: 'Korea National University of Transportation',
    subtitle: 'Computer Information Engineering',
    chapterTheme: 'campus',
    summary: 'Graduated from the Uiwang campus with a GPA of 3.2 / 4.5.',
    details: [
      'Built a presidential pledge matching web page as a graduation project.',
      'Created a presidential pledge comparison page for database practice.',
      'Completed the foundation for Java, web programming and database work.'
    ],
    skills: ['Java', 'SQL', 'JSP', 'Servlet'],
    ko: {
      title: '한국교통대학교',
      subtitle: '컴퓨터정보공학과',
      summary: '의왕 캠퍼스 컴퓨터정보공학과를 졸업했으며 학점은 3.2 / 4.5입니다.',
      details: [
        '졸업 작품으로 대선 공약 매칭 웹페이지를 개발했습니다.',
        '데이터베이스 실습 작품으로 대선 공약 비교 웹페이지를 만들었습니다.',
        'Java, 웹 프로그래밍, 데이터베이스 개발의 기초를 쌓았습니다.'
      ]
    }
  },
  {
    id: 'training',
    year: '2016-2017',
    title: 'Certification and Java training',
    subtitle: 'Engineer Information Processing',
    chapterTheme: 'campus',
    summary: 'Earned Engineer Information Processing and completed Java web/app training.',
    details: [
      'Studied Java syntax, database concepts, HTML5, CSS, JavaScript, jQuery and Ajax.',
      'Implemented boards and projects with JSP, Servlet and Spring framework.',
      'Prepared for practical web development through structured training.'
    ],
    skills: ['HTML5', 'JavaScript', 'jQuery', 'Ajax', 'Spring'],
    ko: {
      title: '자격증 및 Java 교육',
      subtitle: '정보처리기사 / Java 스마트 융합 웹&앱 과정',
      summary: '정보처리기사를 취득하고 Java 웹/앱 개발자 전문과정을 수료했습니다.',
      details: [
        'Java 문법, 데이터베이스 개념, HTML5, CSS, JavaScript, jQuery, Ajax를 학습했습니다.',
        'JSP, Servlet, Spring framework 기반 게시판과 프로젝트를 구현했습니다.',
        '실무 웹 개발을 위한 기본기를 체계적으로 준비했습니다.'
      ]
    }
  },
  {
    id: 'bogosys',
    year: '2017-2019',
    title: 'Bogo Information System',
    subtitle: 'Application developer, LG U+ project',
    chapterTheme: 'office',
    summary: 'Built common modules and screens while collaborating across teams.',
    details: [
      'Used Java, JavaScript and WebSquare for business screens.',
      'Handled requirements with other teams and reflected them in common modules.',
      'Used Sourcetree and Git for source control.'
    ],
    skills: ['WebSquare', 'Git', 'Sourcetree'],
    ko: {
      title: '보고정보시스템',
      subtitle: '응용개발팀 사원, LG U+ 프로젝트',
      summary: '공통 모듈과 업무 화면을 개발하며 여러 팀과 협업했습니다.',
      details: [
        'Java, JavaScript, WebSquare로 업무 화면을 구현했습니다.',
        '타 팀과 요구사항을 분석하고 공통 모듈에 반영했습니다.',
        'Sourcetree와 Git으로 소스 형상 관리를 수행했습니다.'
      ]
    }
  },
  {
    id: 'careercare',
    year: '2019-2023',
    title: 'CareerCare R&D',
    subtitle: 'Senior researcher, CANDI and BusinessPeople',
    chapterTheme: 'office',
    summary: 'Maintained CANDI, migrated .NET/C# flows into Java, and supported AWS service deployment.',
    details: [
      'Maintained and improved the internal CANDI system.',
      'Converted existing .NET/C# code or rebuilt features in Java.',
      'Worked with MSSQL, deployments, AWS, SEO and PHP homepage maintenance.'
    ],
    skills: ['C#', '.NET', 'MSSQL', 'AWS', 'SEO', 'PHP'],
    ko: {
      title: '커리어케어 정보기술연구소',
      subtitle: '책임연구원, CANDI 및 비즈니스피플',
      summary: 'CANDI를 유지보수하고 .NET/C# 흐름을 Java로 전환하며 AWS 배포를 지원했습니다.',
      details: [
        '사내 시스템 CANDI의 신규 기능과 유지보수를 담당했습니다.',
        '.NET/C# 기반 기존 기능을 분석해 Java로 전환하거나 재구현했습니다.',
        'MSSQL, 배포, AWS, SEO, PHP 홈페이지 유지보수 업무를 수행했습니다.'
      ]
    }
  },
  {
    id: 'australia',
    year: '2023-2024',
    title: 'Australia, Perth',
    subtitle: 'Independent work and adaptation',
    chapterTheme: 'australia',
    summary: 'Worked as an Uber Eats and Uber driver in Perth while building adaptability.',
    details: [
      'Operated independently and handled customer-facing work in a new environment.',
      'Built practical communication habits and global perspective.',
      'Used the period to reset, learn and widen perspective outside a Korean office context.'
    ],
    skills: ['Communication', 'Adaptability', 'Self-management'],
    ko: {
      title: '호주 퍼스',
      subtitle: '해외 경험과 자율 업무',
      summary: '퍼스에서 Uber Eats 및 Uber Driver로 활동하며 적응력과 고객 응대 경험을 쌓았습니다.',
      details: [
        '새로운 환경에서 자율적으로 업무를 운영하고 고객을 응대했습니다.',
        '실전 커뮤니케이션 습관과 글로벌 감각을 키웠습니다.',
        '한국 사무실 밖에서 시야를 넓히고 다시 성장 방향을 정리한 시기였습니다.'
      ]
    }
  },
  {
    id: 'automation',
    year: 'Personal',
    title: 'Automation projects',
    subtitle: 'Tools built from real-life friction',
    chapterTheme: 'lab',
    summary: 'Built small tools for video checks, travel photo sorting, AI posting and browser automation.',
    details: [
      'Used Linux commands and ffmpeg to batch-check and convert dashcam videos.',
      'Built a Python EXIF sorter for more than 10,000 travel photos.',
      'Automated content creation and posting with Gemini, Blogger, Naver APIs and Selenium.'
    ],
    skills: ['Python', 'ffmpeg', 'Gemini API', 'Naver API', 'Selenium', 'WebView'],
    ko: {
      title: '개인 자동화 프로젝트',
      subtitle: '반복 작업을 줄이기 위해 만든 도구들',
      summary: '영상 점검, 여행 사진 정리, AI 포스팅, 브라우저 자동화 도구를 직접 만들었습니다.',
      details: [
        'Linux 명령어와 ffmpeg로 블랙박스 영상을 일괄 점검/변환했습니다.',
        'Python으로 10,000장 이상의 여행 사진을 EXIF 기반으로 자동 분류했습니다.',
        'Gemini, Blogger, Naver API와 Selenium을 활용해 콘텐츠 생성과 포스팅을 자동화했습니다.'
      ]
    }
  },
  {
    id: 'ourcom',
    year: '2025',
    title: 'Ourcom',
    subtitle: 'SK hynix ethics management system',
    chapterTheme: 'modern',
    summary: 'Implemented backend logic, approval workflows and multilingual screens.',
    details: [
      'Built report intake, approval process and management features with Java and Oracle.',
      'Implemented multilingual frontend screens with Thymeleaf.',
      'Used IntelliJ and SVN in a structured enterprise development process.'
    ],
    skills: ['Oracle', 'Thymeleaf', 'SVN', 'IntelliJ'],
    ko: {
      title: '아워콤',
      subtitle: 'SK하이닉스 윤리경영업무 시스템',
      summary: '제보 시스템 백엔드 로직, 승인 흐름, 다국어 화면을 구현했습니다.',
      details: [
        'Java와 Oracle로 제보 접수, 승인 프로세스, 관리 기능을 개발했습니다.',
        'Thymeleaf 기반 다국어 프론트엔드 화면을 구현했습니다.',
        'IntelliJ와 SVN을 활용한 기업 개발 프로세스에서 작업했습니다.'
      ]
    }
  },
  {
    id: 'inhouse',
    year: '2026',
    title: 'InhouseSoft',
    subtitle: 'DSIMS platform, Spring Boot + React',
    chapterTheme: 'modern',
    summary: 'Improved drug safety card and document management features.',
    details: [
      'Worked on DSIMS with Spring Boot and React Vite.',
      'Improved drug safety card issuing, search, management and document archive workflows.',
      'Used Apache POI and PostgreSQL COPY for Excel uploads around 20,000 to 50,000 rows.'
    ],
    skills: ['Spring Boot', 'React', 'PostgreSQL', 'Apache POI', 'COPY'],
    ko: {
      title: '인하우스소프트',
      subtitle: 'DSIMS 플랫폼, Spring Boot + React',
      summary: '의약품안전카드와 문서고/전자문서 관리 기능을 운영하고 개선했습니다.',
      details: [
        'Spring Boot와 React Vite 기반 DSIMS 기능을 개발했습니다.',
        '의약품안전카드 발급/조회/관리와 문서고 업무 흐름을 개선했습니다.',
        'Apache POI와 PostgreSQL COPY로 2만~5만 건 규모 Excel 업로드 성능을 확보했습니다.'
      ]
    }
  },
  {
    id: 'contact',
    year: 'Contact',
    title: 'Contact chapter',
    subtitle: 'Recruiter-friendly summary',
    chapterTheme: 'contact',
    summary: 'Backend and web developer focused on reliable delivery and continuous learning.',
    details: [
      'Core stack: Java, Spring Boot, React, JavaScript, MyBatis, MSSQL, Oracle, PostgreSQL and AWS.',
      'Open to backend developer, web developer, system engineer and related software roles.',
      'Use Recruiter Mode for the full scrollable portfolio without gameplay.'
    ],
    skills: ['Jenkins', 'Jira', 'GitHub', 'JSON', 'XML', 'MyBatis'],
    ko: {
      title: '연락 및 지원 요약',
      subtitle: '채용 담당자를 위한 정리',
      summary: '안정적인 결과물과 꾸준한 학습을 중요하게 생각하는 백엔드/웹 개발자입니다.',
      details: [
        '주요 스택은 Java, Spring Boot, React, JavaScript, MyBatis, MSSQL, Oracle, PostgreSQL, AWS입니다.',
        '백엔드 개발자, 웹 개발자, 시스템 엔지니어 등 소프트웨어 직무를 희망합니다.',
        '전체 이력은 이력서 모드에서 게임 없이 스크롤 문서로 확인할 수 있습니다.'
      ]
    }
  }
];
