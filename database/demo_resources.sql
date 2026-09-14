-- CareerForge faculty-demo resources
-- Run against the careerforge database after importing careerforge.sql.
-- This script is safe to run more than once: an existing resource URL is not inserted again.

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'GitHub Skills: Introduction to GitHub', 'Practice repositories, commits, branches, pull requests, and collaboration workflows in a hands-on GitHub course.', 'Software engineering', 'course', 'https://github.com/skills/introduction-to-github', 45, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://github.com/skills/introduction-to-github');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'MDN Learn Web Development', 'A structured learning path for HTML, CSS, JavaScript, accessibility, responsive design, and front-end workflow skills.', 'Frontend development', 'course', 'https://developer.mozilla.org/en-US/docs/Learn_web_development', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://developer.mozilla.org/en-US/docs/Learn_web_development');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'React Quick Start', 'Learn components, props, state, events, lists, and practical React fundamentals from the official documentation.', 'Frontend development', 'course', 'https://react.dev/learn', 120, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://react.dev/learn');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Node.js Learn', 'Build backend fundamentals with official Node.js guides covering asynchronous JavaScript, packages, HTTP, and APIs.', 'Backend development', 'course', 'https://nodejs.org/en/learn', 150, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://nodejs.org/en/learn');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Dev.java Learn', 'Use official Java learning resources to strengthen core Java, object-oriented programming, and application development skills.', 'Java development', 'course', 'https://dev.java/learn/', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://dev.java/learn/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'The Python Tutorial', 'Start Python programming with official documentation covering language basics, modules, data structures, and object-oriented programming.', 'Python development', 'course', 'https://docs.python.org/3/tutorial/', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://docs.python.org/3/tutorial/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'SQLBolt Interactive SQL Lessons', 'Practice SELECT queries, joins, aggregation, and database manipulation through short interactive SQL lessons.', 'Data and databases', 'course', 'https://sqlbolt.com/', 120, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://sqlbolt.com/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Azure Data Analytics Fundamentals', 'Explore data warehousing, real-time analytics, data visualization, and the foundations required for data analyst roles.', 'Data analytics', 'course', 'https://learn.microsoft.com/en-us/training/paths/azure-data-fundamentals-explore-data-warehouse-analytics/', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://learn.microsoft.com/en-us/training/paths/azure-data-fundamentals-explore-data-warehouse-analytics/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Machine Learning Crash Course', 'A practical introduction to machine learning with interactive visualizations, videos, and hands-on exercises.', 'AI and machine learning', 'course', 'https://developers.google.com/machine-learning/crash-course', 240, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://developers.google.com/machine-learning/crash-course');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Figma Design Basics', 'Learn core UI and UX design principles, typography, color, prototypes, wireframes, and design workflows.', 'UI/UX design', 'article', 'https://www.figma.com/resource-library/design-basics/', 90, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://www.figma.com/resource-library/design-basics/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'OWASP Top 10 Web Application Security Risks', 'Understand the most important web application security risks and how security professionals think about them.', 'Cybersecurity', 'article', 'https://owasp.org/www-project-top-ten/', 100, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://owasp.org/www-project-top-ten/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Docker Get Started', 'Learn containers, images, Dockerfiles, and practical local development workflows for DevOps and backend roles.', 'DevOps and cloud', 'course', 'https://docs.docker.com/get-started/', 150, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://docs.docker.com/get-started/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Kubernetes Basics', 'Work through an official introduction to deploying, scaling, and managing containerized applications with Kubernetes.', 'DevOps and cloud', 'course', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://kubernetes.io/docs/tutorials/kubernetes-basics/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Postman API Fundamentals', 'Understand APIs, requests, collections, authentication, and testing workflows used by QA and backend teams.', 'Quality assurance and APIs', 'course', 'https://learning.postman.com/docs/getting-started/introduction/', 90, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://learning.postman.com/docs/getting-started/introduction/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Google Digital Marketing and E-commerce Certificate', 'Explore foundational digital marketing, analytics, e-commerce, and campaign skills for entry-level marketing roles.', 'Digital marketing', 'course', 'https://grow.google/certificates/digital-marketing-ecommerce/', 240, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://grow.google/certificates/digital-marketing-ecommerce/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'HubSpot Content Marketing Course', 'Build practical content strategy, storytelling, SEO, distribution, and measurement skills for marketing roles.', 'Digital marketing', 'course', 'https://academy.hubspot.com/courses/content-marketing', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://academy.hubspot.com/courses/content-marketing');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Atlassian Agile Project Management Guide', 'Learn agile concepts, planning, Scrum, Kanban, and team delivery practices relevant to project coordinator roles.', 'Project management', 'article', 'https://www.atlassian.com/agile/project-management', 75, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://www.atlassian.com/agile/project-management');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Create a Strong Resume', 'Use Harvard career services guidance to create a focused resume that clearly communicates your skills and achievements.', 'CV and portfolio', 'article', 'https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/', 60, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Google Technical Interview Prep', 'Practice algorithms, data structures, and interview problem-solving patterns for software engineering interviews.', 'Interview preparation', 'course', 'https://techdevguide.withgoogle.com/paths/interview/', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://techdevguide.withgoogle.com/paths/interview/');

INSERT INTO learning_resources (created_by, title, description, category, resource_type, resource_url, estimated_minutes, status)
SELECT NULL, 'Microsoft Learn: Security Fundamentals', 'Build a foundation in cybersecurity, compliance, identity, and cloud security for entry-level technology roles.', 'Cybersecurity', 'course', 'https://learn.microsoft.com/en-us/training/educator-center/programs/msle/fundamentals', 180, 'published'
WHERE NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_url = 'https://learn.microsoft.com/en-us/training/educator-center/programs/msle/fundamentals');
