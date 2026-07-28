USE careerforge;

INSERT INTO users (name, email, password_hash, role, status) VALUES
  ('Nadia Ahmed', 'student@careerforge.com', '$2a$12$KBQ9gK0Wdi7xryVbIHo3nenybLNMPIW.n5TnhXaNmCKblL1P5cj0O', 'student', 'active'),
  ('Farhan Rahman', 'admin@careerforge.com', '$2a$12$ej6VIp5PPlf3dT9q.uYIAex9LIO8dOrt/ihmsAB3r.i2x.xveEaMa', 'admin', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), status='active';

INSERT INTO student_profiles (user_id, university, degree, graduation_year, target_role, location, readiness_score, profile_completion)
SELECT id, 'North South University', 'BSc in Computer Science', 2027, 'Product Analyst', 'Dhaka, Bangladesh', 78, 92
FROM users WHERE email='student@careerforge.com'
ON DUPLICATE KEY UPDATE university=VALUES(university), degree=VALUES(degree), target_role=VALUES(target_role), readiness_score=78, profile_completion=92;

INSERT INTO skills (name, category) VALUES
  ('JavaScript', 'Development'),
  ('React', 'Development'),
  ('SQL', 'Analytics'),
  ('Python', 'Development'),
  ('Product Analytics', 'Product'),
  ('Product Thinking', 'Product'),
  ('Professional Communication', 'Soft Skills'),
  ('User Research', 'Design'),
  ('Statistics', 'Analytics'),
  ('Figma', 'Design')
ON DUPLICATE KEY UPDATE category=VALUES(category);

INSERT INTO user_skills (user_id, skill_id, score, source)
SELECT u.id, s.id,
  CASE s.name WHEN 'JavaScript' THEN 82 WHEN 'React' THEN 79 WHEN 'SQL' THEN 76 WHEN 'Product Analytics' THEN 72 WHEN 'Professional Communication' THEN 91 ELSE 68 END,
  'assessment'
FROM users u JOIN skills s ON s.name IN ('JavaScript','React','SQL','Product Analytics','Product Thinking','Professional Communication')
WHERE u.email='student@careerforge.com'
ON DUPLICATE KEY UPDATE score=VALUES(score), source=VALUES(source);

INSERT INTO companies (name, description, website, employee_rating, review_count) VALUES
  ('Pathao', 'A leading digital services platform in Bangladesh.', 'https://pathao.com', 4.7, 248),
  ('Brain Station 23', 'A global software engineering company headquartered in Dhaka.', 'https://brainstation-23.com', 4.5, 186),
  ('bKash', 'Bangladesh''s largest mobile financial services provider.', 'https://bkash.com', 4.8, 412),
  ('ShopUp', 'A full-stack B2B commerce platform for small businesses.', 'https://shopup.org', 4.3, 134)
ON DUPLICATE KEY UPDATE employee_rating=VALUES(employee_rating), review_count=VALUES(review_count);

INSERT INTO jobs (company_id, title, slug, description, requirements, category, employment_type, location, workplace_type, salary_min, salary_max, status, expires_at)
SELECT id, 'Product Analyst', 'product-analyst-pathao', 'Turn customer and product data into clear decisions for a fast-moving digital platform.', 'SQL, product thinking, analytics, and communication.', 'Product & Analytics', 'Full-time', 'Dhaka', 'Hybrid', 55000, 75000, 'live', DATE_ADD(NOW(), INTERVAL 30 DAY) FROM companies WHERE name='Pathao'
ON DUPLICATE KEY UPDATE status='live', expires_at=VALUES(expires_at);
INSERT INTO jobs (company_id, title, slug, description, requirements, category, employment_type, location, workplace_type, salary_min, salary_max, status, expires_at)
SELECT id, 'Junior Frontend Engineer', 'junior-frontend-engineer-bs23', 'Build polished, accessible web products with an experienced engineering team.', 'React, JavaScript, CSS, accessibility.', 'Engineering', 'Full-time', 'Dhaka', 'On-site', 45000, 65000, 'live', DATE_ADD(NOW(), INTERVAL 24 DAY) FROM companies WHERE name='Brain Station 23'
ON DUPLICATE KEY UPDATE status='live', expires_at=VALUES(expires_at);
INSERT INTO jobs (company_id, title, slug, description, requirements, category, employment_type, location, workplace_type, salary_min, salary_max, status, expires_at)
SELECT id, 'Data Science Intern', 'data-science-intern-bkash', 'Support customer intelligence initiatives with predictive analysis.', 'Python, statistics, machine learning.', 'Data Science', 'Internship', 'Dhaka', 'Hybrid', 25000, 35000, 'live', DATE_ADD(NOW(), INTERVAL 21 DAY) FROM companies WHERE name='bKash'
ON DUPLICATE KEY UPDATE status='live', expires_at=VALUES(expires_at);
INSERT INTO jobs (company_id, title, slug, description, requirements, category, employment_type, location, workplace_type, salary_min, salary_max, status, expires_at)
SELECT id, 'UX Research Associate', 'ux-research-associate-shopup', 'Find the human insight behind product opportunities for small businesses.', 'User research, Figma, interviews.', 'Design', 'Contract', 'Remote', 'Remote', 40000, 58000, 'live', DATE_ADD(NOW(), INTERVAL 18 DAY) FROM companies WHERE name='ShopUp'
ON DUPLICATE KEY UPDATE status='live', expires_at=VALUES(expires_at);

INSERT INTO assessments (title, description, category, difficulty, time_limit_minutes, status) VALUES
  ('JavaScript Foundations', 'Measure practical JavaScript knowledge.', 'Development', 'Intermediate', 18, 'published'),
  ('Data Analysis Essentials', 'Test core analysis and data reasoning.', 'Analytics', 'Intermediate', 15, 'published'),
  ('Professional Communication', 'Evaluate workplace communication decisions.', 'Soft Skills', 'Beginner', 12, 'published'),
  ('Product Thinking', 'Explore product judgment and prioritization.', 'Business', 'Advanced', 20, 'published'),
  ('SQL & Databases', 'Assess SQL querying and relational concepts.', 'Analytics', 'Intermediate', 18, 'published'),
  ('UX Research Basics', 'Test foundational research methods.', 'Design', 'Beginner', 14, 'published');

INSERT INTO questions (assessment_id, prompt, question_type, difficulty, explanation, points, status)
SELECT id, 'Which JavaScript method creates a new array containing only elements that pass a test?', 'multiple_choice', 'Intermediate', 'filter() evaluates every element and retains elements for which the callback returns true.', 1, 'published'
FROM assessments WHERE title='JavaScript Foundations' LIMIT 1;
INSERT INTO questions (assessment_id, prompt, question_type, difficulty, explanation, points, status)
SELECT id, 'What is the most useful first step when a metric changes unexpectedly?', 'multiple_choice', 'Intermediate', 'Validate the data and instrumentation before interpreting or acting on the change.', 1, 'published'
FROM assessments WHERE title='Data Analysis Essentials' LIMIT 1;
INSERT INTO questions (assessment_id, prompt, question_type, difficulty, explanation, points, status)
SELECT id, 'Which structure is most useful for a behavioral interview response?', 'multiple_choice', 'Beginner', 'STAR structures the situation, task, action and result.', 1, 'published'
FROM assessments WHERE title='Professional Communication' LIMIT 1;

INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'map()', FALSE, 1 FROM questions WHERE prompt LIKE 'Which JavaScript method%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'filter()', TRUE, 2 FROM questions WHERE prompt LIKE 'Which JavaScript method%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'reduce()', FALSE, 3 FROM questions WHERE prompt LIKE 'Which JavaScript method%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'forEach()', FALSE, 4 FROM questions WHERE prompt LIKE 'Which JavaScript method%' LIMIT 1;

INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'Publish the result', FALSE, 1 FROM questions WHERE prompt LIKE 'What is the most useful first%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'Validate the data', TRUE, 2 FROM questions WHERE prompt LIKE 'What is the most useful first%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'Change the target', FALSE, 3 FROM questions WHERE prompt LIKE 'What is the most useful first%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'Ignore the outlier', FALSE, 4 FROM questions WHERE prompt LIKE 'What is the most useful first%' LIMIT 1;

INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'SWOT', FALSE, 1 FROM questions WHERE prompt LIKE 'Which structure is most useful%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'STAR', TRUE, 2 FROM questions WHERE prompt LIKE 'Which structure is most useful%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'AIDA', FALSE, 3 FROM questions WHERE prompt LIKE 'Which structure is most useful%' LIMIT 1;
INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
SELECT id, 'RACE', FALSE, 4 FROM questions WHERE prompt LIKE 'Which structure is most useful%' LIMIT 1;

INSERT INTO learning_resources (title, description, category, difficulty, resource_type, resource_url, estimated_minutes, featured, status) VALUES
  ('SQL for Product Decisions', 'Use SQL to answer practical product questions.', 'Data & Analytics', 'Intermediate', 'course', '/resources/sql-product', 160, TRUE, 'published'),
  ('Write an ATS-ready Resume', 'A practical guide to a recruiter-readable resume.', 'Career Toolkit', 'Beginner', 'course', '/resources/ats-resume', 55, TRUE, 'published'),
  ('Interview Stories that Stick', 'Build a reusable bank of structured stories.', 'Communication', 'Intermediate', 'course', '/resources/interview-stories', 80, FALSE, 'published'),
  ('Product Analytics Field Guide', 'A downloadable analytics reference.', 'Data & Analytics', 'Advanced', 'pdf', '/downloads/product-analytics.pdf', 45, TRUE, 'published');

INSERT INTO events (title, description, event_type, host, location, event_url, starts_at, ends_at, capacity, status) VALUES
  ('Designing your first 90-day career plan', 'Build a focused plan for the next phase of your career.', 'Workshop', 'CareerForge', 'Online', '/events/90-day-plan', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 90 MINUTE, 300, 'published'),
  ('Dhaka Graduate Career Fair 2026', 'Meet employers recruiting graduate talent.', 'Career fair', 'NSU Career Center', 'NSU Auditorium', '/events/dhaka-career-fair', DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 12 DAY) + INTERVAL 6 HOUR, 1000, 'published'),
  ('Live resume teardown with recruiters', 'See how recruiters evaluate real resumes.', 'Live session', 'Talent Circle', 'Online', '/events/resume-teardown', DATE_ADD(NOW(), INTERVAL 16 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY) + INTERVAL 75 MINUTE, 400, 'published');

INSERT INTO achievements (code, title, description, icon, xp_reward, criteria) VALUES
  ('profile_pioneer', 'Profile Pioneer', 'Complete every profile section.', 'user', 80, JSON_OBJECT('profile_completion', 100)),
  ('skill_sprint', 'Skill Sprint', 'Complete three assessments in a week.', 'zap', 120, JSON_OBJECT('weekly_assessments', 3)),
  ('community_voice', 'Community Voice', 'Receive 25 likes on your posts.', 'message', 100, JSON_OBJECT('post_likes', 25)),
  ('interview_ready', 'Interview Ready', 'Reach an 80% readiness score.', 'target', 160, JSON_OBJECT('readiness_score', 80)),
  ('application_ace', 'Application Ace', 'Submit ten tailored applications.', 'briefcase', 140, JSON_OBJECT('applications', 10))
ON DUPLICATE KEY UPDATE title=VALUES(title), criteria=VALUES(criteria);

INSERT INTO community_posts (user_id, content, tags, status)
SELECT id, 'Just finished my first technical interview. Writing my STAR stories before the interview made the behavioral round feel much more structured.', JSON_ARRAY('Interview prep','Small wins'), 'visible'
FROM users WHERE email='student@careerforge.com';
