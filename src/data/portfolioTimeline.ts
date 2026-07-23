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
  portfolioGroup: 'mobile-games' | 'apps' | 'toss';
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
    portfolioGroup: 'mobile-games',
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
    id: 'nagalttae',
    title: 'Nagalttae',
    category: 'Toss In-App Weather Mini App',
    portfolioGroup: 'toss',
    shortDesc: 'Toss In-App weather preparation mini app that recommends what to bring before leaving for work based on location and weather data.',
    githubUrl: 'https://github.com/amaranth92/portfolio-projects/blob/master/docs/nagalttae.md',
    tags: ['Toss In-App', 'React', 'TypeScript', 'Weather API'],
    process: {
      background: 'Built to solve a simple morning problem: checking the weather and remembering items like an umbrella, sunscreen, or mask before leaving.',
      architecture: 'Matched the user location to weather station data, parsed Korea Meteorological Administration API responses, and turned conditions into checklist recommendations.',
      troubleshooting: 'Handled mobile in-app constraints with a short Toss-style flow, haptic feedback, touch sorting, and a daily checklist reset.',
      outcome: 'Created a mobile-first Toss In-App weather mate that turns weather data into immediate commute preparation actions.'
    },
    ko: {
      title: '나갈때',
      category: '토스 인앱 날씨 준비 미니앱',
      shortDesc: '위치와 날씨 데이터를 바탕으로 출근 전 챙길 우산, 선크림, 마스크 같은 준비물을 추천하는 토스 인앱 미니앱입니다.',
      process: {
        background: '바쁜 아침에 날씨를 확인하고 우산, 선크림, 마스크 같은 준비물을 놓치지 않도록 돕기 위해 만들었습니다.',
        architecture: '사용자 위치를 기준으로 가까운 기상청 관측소를 매칭하고, 기상청 API 데이터를 파싱해 날씨 맞춤 체크리스트로 연결했습니다.',
        troubleshooting: '토스 인앱 환경에 맞춰 짧은 흐름, 햅틱 피드백, 터치 정렬, 자정 이후 체크리스트 초기화 같은 모바일 상호작용을 정리했습니다.',
        outcome: '날씨 정보를 출근 전 바로 실행할 수 있는 준비 행동으로 바꾸는 모바일 우선 토스 인앱 서비스를 만들었습니다.'
      }
    }
  },
  {
    id: 'salt-bread-tycoon',
    title: 'Salt Bread Tycoon',
    category: 'Toss In-App Game',
    portfolioGroup: 'toss',
    shortDesc: 'A cozy Toss In-App idle game about growing a tiny salt-bread bakery.',
    tags: ['Toss In-App', 'Game', 'React'],
    process: {
      background: 'Designed as a short, friendly idle-game experience for quick mobile sessions.',
      architecture: 'Built around simple tap, upgrade, and passive-growth interactions that fit an in-app flow.',
      troubleshooting: 'Kept the loop readable on small screens by prioritizing one primary action and compact feedback.',
      outcome: 'Created a lightweight bakery game concept that is easy to understand in a few seconds.'
    },
    ko: {
      title: '소금빵 키우기',
      category: '토스 인앱 게임',
      shortDesc: '작은 소금빵 가게를 키워가는 아기자기한 토스 인앱 방치형 게임입니다.',
      process: {
        background: '짧은 모바일 세션에 맞는 친근한 방치형 게임 경험으로 기획했습니다.',
        architecture: '탭, 업그레이드, 자동 성장 중심의 간단한 상호작용으로 인앱 흐름에 맞췄습니다.',
        troubleshooting: '작은 화면에서도 핵심 행동과 보상 피드백이 바로 보이도록 화면을 단순화했습니다.',
        outcome: '몇 초 안에 규칙을 이해할 수 있는 가벼운 베이커리 게임 콘셉트를 만들었습니다.'
      }
    }
  },
  {
    id: 'summer-sound',
    title: 'Summer Sound',
    category: 'Toss In-App Experience',
    portfolioGroup: 'toss',
    shortDesc: 'A small Toss In-App sound experience for capturing the mood of a bright summer day.',
    tags: ['Toss In-App', 'Audio UI', 'React'],
    process: {
      background: 'Created as a calm, lightweight mobile experience instead of another utility-heavy screen.',
      architecture: 'Combined a focused visual, a short audio interaction, and a simple replay-first flow.',
      troubleshooting: 'Reduced the interface to clear play and pause states so the experience stays approachable.',
      outcome: 'Produced a compact audio-led concept that works naturally inside a mobile mini app.'
    },
    ko: {
      title: '여름소리',
      category: '토스 인앱 콘텐츠',
      shortDesc: '밝은 여름날의 분위기를 담은 작은 토스 인앱 사운드 경험입니다.',
      process: {
        background: '기능을 많이 넣기보다 잠깐 쉬어갈 수 있는 차분한 모바일 경험으로 만들었습니다.',
        architecture: '집중도 높은 화면과 짧은 오디오 상호작용, 다시 듣기 중심의 간단한 흐름을 결합했습니다.',
        troubleshooting: '재생과 일시정지 상태를 명확하게 나눠 처음 사용해도 부담 없도록 정리했습니다.',
        outcome: '모바일 미니앱 안에서 자연스럽게 동작하는 오디오 중심 콘셉트를 구현했습니다.'
      }
    }
  },
  {
    id: 'photo-weave',
    title: 'PhotoWeave Resize Stitch',
    category: 'Mac App',
    portfolioGroup: 'apps',
    shortDesc: 'A simple Mac utility for resizing and stitching images into clean, share-ready layouts.',
    demoUrl: 'https://apps.apple.com/us/app/photoweave-resize-stitch/id6788288348?mt=12',
    tags: ['Mac App', 'Photo Tool', 'Utility'],
    process: {
      background: 'Built to make image resizing and stitching faster than using a full editing suite.',
      architecture: 'Focused the workflow on selecting images, choosing a layout, and exporting the final composition.',
      troubleshooting: 'Kept controls compact so common photo layout tasks stay quick and predictable.',
      outcome: 'Published a focused resize-and-stitch utility for clean image layouts.'
    },
    ko: {
      title: 'PhotoWeave Resize Stitch',
      category: 'Mac 앱',
      shortDesc: '이미지를 빠르게 리사이즈하고 이어 붙여 공유하기 좋은 레이아웃으로 만드는 Mac 유틸리티입니다.',
      process: {
        background: '무거운 이미지 편집 도구 없이 사진 크기 조정과 이어 붙이기를 빠르게 처리하기 위해 만들었습니다.',
        architecture: '이미지 선택, 레이아웃 설정, 최종 결과 내보내기로 흐름을 단순화했습니다.',
        troubleshooting: '자주 쓰는 사진 배치 작업을 예측 가능하게 처리하도록 조작 요소를 간결하게 구성했습니다.',
        outcome: '깔끔한 이미지 레이아웃을 만드는 리사이즈·스티치 전용 유틸리티로 출시했습니다.'
      }
    }
  },
  {
    id: 'premium-qr-generator',
    title: 'Premium QR Generator',
    category: 'Web App',
    portfolioGroup: 'apps',
    shortDesc: 'A focused web tool for creating polished QR codes quickly and exporting them for real use.',
    demoUrl: 'https://premium-qr-generator.pages.dev/',
    tags: ['Web App', 'QR', 'Cloudflare Pages'],
    process: {
      background: 'Created a lightweight QR workflow for people who need a usable result without a complex design tool.',
      architecture: 'Kept generation, preview, and export in one responsive browser flow.',
      troubleshooting: 'Prioritized readable output and a short path from input to downloadable QR code.',
      outcome: 'Delivered a focused QR generator that works directly in the browser.'
    },
    ko: {
      title: 'Premium QR Generator',
      category: '웹 앱',
      shortDesc: '실제로 사용할 수 있는 깔끔한 QR 코드를 빠르게 만들고 내보내는 웹 도구입니다.',
      process: {
        background: '복잡한 디자인 도구 없이 바로 쓸 수 있는 QR 결과물을 만들기 위해 구성했습니다.',
        architecture: '생성, 미리보기, 내보내기를 하나의 반응형 브라우저 흐름으로 묶었습니다.',
        troubleshooting: '입력부터 다운로드까지의 단계를 줄이고 QR 가독성을 우선했습니다.',
        outcome: '브라우저에서 바로 사용할 수 있는 집중형 QR 생성기를 완성했습니다.'
      }
    }
  },
  {
    id: 'smart-text-analyzer',
    title: 'Smart Text Analyzer',
    category: 'Web App',
    portfolioGroup: 'apps',
    shortDesc: 'A multilingual word-count and readability analyzer with autosave and SEO-friendly workflows.',
    demoUrl: 'https://smart-text-analyzer.pages.dev/',
    tags: ['Web App', 'Text Analysis', 'Multilingual'],
    process: {
      background: 'Built for writers and teams that need quick text length and legibility checks while drafting.',
      architecture: 'Combined live text metrics, readability feedback, autosave, and responsive browser UI.',
      troubleshooting: 'Handled multilingual text and kept feedback visible without interrupting the writing flow.',
      outcome: 'Created a practical browser-based analyzer for everyday writing checks.'
    },
    ko: {
      title: 'Smart Text Analyzer',
      category: '웹 앱',
      shortDesc: '자동 저장과 다국어 분석을 지원하는 단어 수·텍스트 가독성 분석 웹 도구입니다.',
      process: {
        background: '글을 작성하면서 빠르게 분량과 읽기 쉬운 정도를 확인하려는 사용자를 위해 만들었습니다.',
        architecture: '실시간 텍스트 지표, 가독성 피드백, 자동 저장, 반응형 브라우저 UI를 결합했습니다.',
        troubleshooting: '다국어 텍스트를 처리하면서도 작성 흐름을 끊지 않도록 피드백 위치를 정리했습니다.',
        outcome: '일상적인 글쓰기 점검에 바로 쓸 수 있는 브라우저 분석 도구를 만들었습니다.'
      }
    }
  },
  {
    id: 'photo-sorter',
    title: 'Photo EXIF Sorter',
    category: 'Automation Tool',
    portfolioGroup: 'apps',
    shortDesc: 'Python tool that sorts 10,000+ travel photos by date and location using EXIF metadata.',
    githubUrl: 'https://github.com/amaranth92/portfolio-projects/blob/master/docs/photo-exif-sorter.md',
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
    category: 'AI Application',
    portfolioGroup: 'apps',
    shortDesc: 'AI app that translates pet behavior from photos, videos, and audio, then helps create subtitles and voice dubbing for short clips.',
    githubUrl: 'https://github.com/amaranth92/portfolio-projects/blob/master/docs/decody.md',
    tags: ['AI', 'Pet Behavior', 'Subtitle', 'Voice Dubbing'],
    process: {
      background: 'Started as a practical AI product idea from Aussie Pus Studio: making pet behavior easier for owners to understand.',
      architecture: 'Designed around photo, video, and audio inputs, with AI interpretation plus short-form subtitle and dubbing output.',
      troubleshooting: 'Focused on keeping the output understandable instead of technical, so users can quickly read or reuse the result.',
      outcome: 'Positioned Decody as a lightweight AI app for pet behavior translation and short clip localization.'
    },
    ko: {
      title: 'Decody',
      category: 'AI 앱',
      shortDesc: '사진, 영상, 오디오 속 반려동물 행동을 사람이 이해할 수 있는 언어로 번역하고 짧은 클립용 자막과 음성 더빙을 만드는 AI 앱입니다.',
      process: {
        background: 'Aussie Pus Studio에서 반려동물의 행동을 보호자가 더 쉽게 이해할 수 있도록 만든 AI 제품 아이디어입니다.',
        architecture: '사진, 영상, 오디오 입력을 바탕으로 행동을 해석하고, 숏폼 클립에 쓸 수 있는 자막과 더빙 결과를 만드는 흐름으로 구성했습니다.',
        troubleshooting: '기술적인 설명보다 사용자가 바로 이해하고 활용할 수 있는 문장과 결과물에 집중했습니다.',
        outcome: 'Decody를 반려동물 행동 번역과 짧은 클립 현지화를 돕는 가벼운 AI 앱으로 정리했습니다.'
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
