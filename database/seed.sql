-- Accounts are never committed as seed data.
-- Students register through the public API. Create the private administrator
-- with `npm run admin:create` after setting the ADMIN_* environment variables.

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

-- Companies and jobs are intentionally not seeded. Administrators create and
-- publish real opportunities from the control center.

-- Assessments and questions are intentionally not seeded. Administrators create
-- the real assessment catalogue and question bank from the control center.

INSERT INTO learning_resources (title, description, category, difficulty, resource_type, resource_url, estimated_minutes, featured, status) VALUES
  ('SQL for Product Decisions', 'Use SQL to answer practical product questions.', 'Data & Analytics', 'Intermediate', 'course', '/resources/sql-product', 160, TRUE, 'published'),
  ('Write an ATS-ready Resume', 'A practical guide to a recruiter-readable resume.', 'Career Toolkit', 'Beginner', 'course', '/resources/ats-resume', 55, TRUE, 'published'),
  ('Interview Stories that Stick', 'Build a reusable bank of structured stories.', 'Communication', 'Intermediate', 'course', '/resources/interview-stories', 80, FALSE, 'published'),
  ('Product Analytics Field Guide', 'A downloadable analytics reference.', 'Data & Analytics', 'Advanced', 'pdf', '/downloads/product-analytics.pdf', 45, TRUE, 'published');

-- Events are intentionally not seeded. Administrators create and publish real
-- events from the control center; only those events are shown to students.

INSERT INTO achievements (code, title, description, icon, xp_reward, criteria) VALUES
  ('profile_pioneer', 'Profile Pioneer', 'Complete every profile section.', 'user', 80, JSON_OBJECT('profile_completion', 100)),
  ('skill_sprint', 'Skill Sprint', 'Complete three assessments in a week.', 'zap', 120, JSON_OBJECT('weekly_assessments', 3)),
  ('community_voice', 'Community Voice', 'Receive 25 likes on your posts.', 'message', 100, JSON_OBJECT('post_likes', 25)),
  ('interview_ready', 'Interview Ready', 'Reach an 80% readiness score.', 'target', 160, JSON_OBJECT('readiness_score', 80)),
  ('application_ace', 'Application Ace', 'Submit ten tailored applications.', 'briefcase', 140, JSON_OBJECT('applications', 10))
ON DUPLICATE KEY UPDATE title=VALUES(title), criteria=VALUES(criteria);
