export type PortfolioMilestone = {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  chapterTheme: 'campus' | 'office' | 'australia' | 'lab' | 'modern' | 'contact';
  summary: string;
  details: string[];
  skills: string[];
};

export const profile = {
  name: 'Backend / Web Developer',
  headline: 'Stability-minded developer who keeps learning current tools',
  location: 'Seoul, South Korea',
  experience: '6 years 9 months',
  contact: {
    email: 'contact@example.com',
    note: 'Available for backend developer, web developer, system engineer, network engineer roles.'
  }
};

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
    skills: ['Java', 'SQL', 'JSP', 'Servlet']
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
    skills: ['HTML5', 'JavaScript', 'jQuery', 'Ajax', 'Spring']
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
    skills: ['WebSquare', 'Git', 'Sourcetree']
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
    skills: ['C#', '.NET', 'MSSQL', 'AWS', 'SEO', 'PHP']
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
    skills: ['Communication', 'Adaptability', 'Self-management']
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
    skills: ['Python', 'ffmpeg', 'Gemini API', 'Naver API', 'Selenium', 'WebView']
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
    skills: ['Oracle', 'Thymeleaf', 'SVN', 'IntelliJ']
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
    skills: ['Spring Boot', 'React', 'PostgreSQL', 'Apache POI', 'COPY']
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
    skills: ['Jenkins', 'Jira', 'GitHub', 'JSON', 'XML', 'MyBatis']
  }
];
