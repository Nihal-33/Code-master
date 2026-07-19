-- ===================================================
-- CODEMASTER E-BOOK ARENA: DATABASE SCHEMA & SEED DATA
-- ===================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Profile Table (links to auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  xp integer not null default 0,
  level text not null default 'Beginner',
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  last_activity_date date,
  achievements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS for users
alter table public.users enable row level security;

-- Drop policy if exists and create
drop policy if exists "Users can view all profiles" on public.users;
create policy "Users can view all profiles" on public.users 
  for select using (true);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users 
  for update using (auth.uid() = id);

-- 2. Courses Table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  slug text not null unique,
  description text not null,
  cover_image text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  chapters_count integer not null default 0,
  questions_count integer not null default 0,
  quizzes_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS for courses
alter table public.courses enable row level security;
drop policy if exists "Anyone can view courses" on public.courses;
create policy "Anyone can view courses" on public.courses for select using (true);

-- 3. Chapters Table
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  order_index integer not null,
  content text not null, -- Markdown content
  created_at timestamptz not null default now(),
  unique (course_id, order_index)
);

-- Enable RLS for chapters
alter table public.chapters enable row level security;
drop policy if exists "Anyone can view chapters" on public.chapters;
create policy "Anyone can view chapters" on public.chapters for select using (true);

-- 4. Questions Table (For practice and quizzes)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  type text not null check (type in ('MCQ', 'FILL_IN_BLANKS', 'TRUE_FALSE', 'PREDICT_OUTPUT', 'DEBUG_CODE', 'INTERVIEW')),
  question text not null,
  options jsonb, -- e.g. ["<a>", "<link>", "<href>", "<url>"] for MCQ
  correct_answer text not null,
  explanation text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  marks integer not null default 10,
  tags jsonb not null default '[]'::jsonb,
  time_estimate_seconds integer not null default 60,
  created_at timestamptz not null default now()
);

-- Enable RLS for questions
alter table public.questions enable row level security;
drop policy if exists "Anyone can view questions" on public.questions;
create policy "Anyone can view questions" on public.questions for select using (true);

-- 5. Quizzes Table
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  duration_minutes integer not null default 10,
  created_at timestamptz not null default now()
);

-- Enable RLS for quizzes
alter table public.quizzes enable row level security;
drop policy if exists "Anyone can view quizzes" on public.quizzes;
create policy "Anyone can view quizzes" on public.quizzes for select using (true);

-- 6. Quiz Questions Join Table
create table if not exists public.quiz_questions (
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  primary key (quiz_id, question_id)
);

-- Enable RLS for quiz_questions
alter table public.quiz_questions enable row level security;
drop policy if exists "Anyone can view quiz questions" on public.quiz_questions;
create policy "Anyone can view quiz questions" on public.quiz_questions for select using (true);

-- 7. Quiz Attempts Table
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  score integer not null,
  accuracy numeric(5,2) not null,
  xp_gained integer not null default 0,
  completed_at timestamptz not null default now()
);

-- Enable RLS for quiz_attempts
alter table public.quiz_attempts enable row level security;
drop policy if exists "Users can view own quiz attempts" on public.quiz_attempts;
create policy "Users can view own quiz attempts" on public.quiz_attempts for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own quiz attempts" on public.quiz_attempts;
create policy "Users can insert own quiz attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);

-- 8. Progress Table
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  completed boolean not null default false,
  reading_percentage integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

-- Enable RLS for progress
alter table public.progress enable row level security;
drop policy if exists "Users can view own progress" on public.progress;
create policy "Users can view own progress" on public.progress for select using (auth.uid() = user_id);
drop policy if exists "Users can insert/update own progress" on public.progress;
create policy "Users can insert/update own progress" on public.progress for all using (auth.uid() = user_id);

-- 9. Bookmarks Table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

-- Enable RLS for bookmarks
alter table public.bookmarks enable row level security;
drop policy if exists "Users can manage own bookmarks" on public.bookmarks;
create policy "Users can manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- 10. Notes Table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_id)
);

-- Enable RLS for notes
alter table public.notes enable row level security;
drop policy if exists "Users can manage own notes" on public.notes;
create policy "Users can manage own notes" on public.notes for all using (auth.uid() = user_id);

-- 11. Certificates Table
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade, -- Null if for "Full Frontend Path"
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- Enable RLS for certificates
alter table public.certificates enable row level security;
drop policy if exists "Anyone can verify certificates" on public.certificates;
create policy "Anyone can verify certificates" on public.certificates for select using (true);
drop policy if exists "System can insert certificates" on public.certificates;
create policy "System can insert certificates" on public.certificates for insert with check (auth.uid() = user_id);


-- ===================================================
-- TRIGGERS FOR PROFILE INITIALIZATION
-- ===================================================

-- Create a trigger function to insert new users into public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url, xp, level, current_streak, max_streak, achievements)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Code Scholar'),
    new.raw_user_meta_data->>'avatar_url',
    0,
    'Beginner',
    0,
    0,
    '[]'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ===================================================
-- SEED DATA
-- ===================================================

-- Seed Courses
insert into public.courses (id, title, slug, description, cover_image, difficulty, chapters_count, questions_count, quizzes_count)
values 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'HTML5 Mastery', 'html5-mastery', 'Learn semantic layout, Forms, Audio/Video media elements, Canvas API, SEO basics and modern ARIA accessibility standards.', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=300&auto=format&fit=crop', 'Beginner', 11, 20, 2),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'CSS3 & Modern Layouts', 'css3-layouts', 'Master Box Model, Flexbox, CSS Grid layouts, standard/custom animations, media queries, CSS variables and design token practices.', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=300&auto=format&fit=crop', 'Intermediate', 12, 22, 2),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'JavaScript Deep Dive', 'javascript-deep-dive', 'Comprehensive logic covering ES6+, DOM manipulation, asynchronous programming, event loops, Fetch API, and data storage patterns.', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=300&auto=format&fit=crop', 'Advanced', 15, 25, 3),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Legacy & Modern AngularJS', 'angularjs-essentials', 'Dive into MVC/MVVM patterns, Scope, Controllers, custom Directives, Services, Filters, Dependency Injection, and modern Angular upgrade paths.', 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?q=80&w=300&auto=format&fit=crop', 'Advanced', 13, 18, 2)
on conflict (title) do update set 
  description = excluded.description,
  cover_image = excluded.cover_image,
  difficulty = excluded.difficulty,
  chapters_count = excluded.chapters_count,
  questions_count = excluded.questions_count,
  quizzes_count = excluded.quizzes_count;

-- Seed Chapters (Examples)
-- Course 1: HTML5 Mastery
insert into public.chapters (id, course_id, title, order_index, content)
values
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Introduction to HTML5', 1, '# Introduction to HTML5

Welcome to the **HTML5 Mastery** chapter! HTML (HyperText Markup Language) is the backbone of the web. It defines the structure and core content of a webpage.

## Key Learning Points
1. **HTML History**: Originating in 1990 by Tim Berners-Lee, HTML has evolved into HTML5, which provides robust APIs, native media, and clean semantics.
2. **Elements and Tags**: Elements are defined by a start tag, some content, and an end tag: `<tagname>Content...</tagname>`.
3. **The Doctype Declaration**: The `<!DOCTYPE html>` declaration is required at the very top to trigger standards rendering mode.

### Basic Document Skeleton
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Web Page</title>
</head>
<body>
  <h1>Hello, CodeMaster!</h1>
  <p>Your educational journey starts here.</p>
</body>
</html>
```

### Element Attributes
Attributes provide additional information about elements. They are always specified in the start tag and usually come in name/value pairs like: `name="value"`.
- `href` in `<a>` specifies the URL for a link.
- `src` in `<img>` specifies the path to the image to be displayed.
'),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Semantic HTML Layouts', 2, '# Semantic HTML Layouts

Semantic HTML introduces tags that clearly describe their meaning to both the browser and the developer.

## Why Use Semantics?
1. **Accessibility**: Screen readers navigate pages much better using landmarks like `<header>`, `<nav>`, `<main>`, and `<footer>`.
2. **SEO**: Search engines weigh semantic content layout heavier than standard `<div>` structures.
3. **Readability**: Code is significantly cleaner and easier to maintain.

### Main Landmark Elements
- `<header>`: Introductory content or set of navigational links.
- `<nav>`: Section intended for navigation links.
- `<main>`: Main unique content of the `<body>`.
- `<article>`: Self-contained composition in a document (e.g. blog post, forum post).
- `<section>`: Standalone section of a document.
- `<aside>`: Section with content tangentially related to the content around it (e.g. sidebar).
- `<footer>`: Footer for its nearest sectioning content.

### Visual Representation of Semantics
```
+------------------------------------------+
|                 <header>                 |
+------------------------------------------+
|                  <nav>                   |
+------------------------------------------+
|  <main>                                  |
|  +--------------------+  +------------+  |
|  |     <article>      |  |  <aside>   |  |
|  +--------------------+  +------------+  |
|  |     <section>      |               |  |
|  +--------------------+               |  |
+------------------------------------------+
|                 <footer>                 |
+------------------------------------------+
```
'),
  ('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'CSS Box Model Explained', 1, '# CSS Box Model Explained

Everything in CSS is represented by a box. Understanding the CSS Box Model is the single most important concept in layouts.

## Components of the Box Model
A box consists of four areas:
1. **Content**: The text or image in the element.
2. **Padding**: Transparent area surrounding the content, inside the border.
3. **Border**: Border surrounding the padding and content.
4. **Margin**: Transparent area outside the border that separates this element from others.

```
+---------------------------------------+
|  Margin                               |
|   +-------------------------------+   |
|   |  Border                       |   |
|   |   +-----------------------+   |   |
|   |   |  Padding              |   |   |
|   |   |   +---------------+   |   |   |
|   |   |   | Content       |   |   |   |
|   |   |   | (Width x Ht)  |   |   |   |
|   |   |   +---------------+   |   |   |
|   |   +-----------------------+   |   |
|   +-------------------------------+   |
+---------------------------------------+
```

## `box-sizing: border-box` vs `content-box`
- **`content-box` (Default)**: Width and height apply only to the content. Adding padding or border makes the element wider/taller on screen.
- **`border-box`**: Width and height apply to content, padding, and borders. If you set width to 300px, it stays 300px, absorbing padding/borders internally.
'),
  ('44444444-4444-4444-4444-444444444444', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'JavaScript Scope & Closure', 1, '# JavaScript Scope & Closure

Scope determines the accessibility of variables in JavaScript. Closure is the mechanism by which inner functions retain access to their outer scopes.

## 1. Types of Scope
- **Global Scope**: Variables declared outside functions/blocks. Accessible anywhere.
- **Function Scope**: Variables declared inside a `function`. Not accessible outside.
- **Block Scope**: Variables declared with `let` and `const` inside `{ ... }`. Not accessible outside. (Note: `var` is NOT block scoped).

## 2. Closure
A **closure** is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function''s scope even after the outer function returns.

### Closure Example
```javascript
function makeCounter() {
  let count = 0; // Private state
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```
Here, the anonymous inner function maintains a live reference to `count` inside `makeCounter`''s scope.
')
on conflict (course_id, order_index) do update set 
  title = excluded.title,
  content = excluded.content;

-- Seed Questions
insert into public.questions (id, chapter_id, type, question, options, correct_answer, explanation, difficulty, marks, tags, time_estimate_seconds)
values
  -- MCQ
  ('11111111-2222-3333-4444-555555555555', '11111111-1111-1111-1111-111111111111', 'MCQ', 
   'Which HTML tag is used to create a hyperlink?', 
   '["<link>", "<a>", "<href>", "<url>"]'::jsonb, 
   '<a>', 
   'The <a> (anchor) tag is used to define hyperlinks which connect pages. The href attribute specifies the destination URL.', 
   'Beginner', 10, '["html", "basics", "tags"]'::jsonb, 60),

  -- MCQ 2
  ('22222222-3333-4444-5555-666666666666', '11111111-1111-1111-1111-111111111111', 'MCQ', 
   'Which doctype declaration is correct for HTML5?', 
   '["<!DOCTYPE HTML5>", "<!DOCTYPE html>", "<!doctype html5>", "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 5.0//EN\">"]'::jsonb, 
   '<!DOCTYPE html>', 
   'In HTML5, the doctype declaration is case-insensitive and is simply written as <!DOCTYPE html> to enable standard rendering mode.', 
   'Beginner', 10, '["html", "syntax"]'::jsonb, 45),

  -- Fill in the blanks
  ('33333333-4444-5555-6666-777777777777', '22222222-2222-2222-2222-222222222222', 'FILL_IN_BLANKS', 
   'The semantic tag used to define navigation links is ________.', 
   '["<nav>"]'::jsonb, 
   '<nav>', 
   'The <nav> element represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents.', 
   'Beginner', 10, '["semantics", "accessibility"]'::jsonb, 60),

  -- True / False
  ('44444444-5555-6666-7777-888888888888', '33333333-3333-3333-3333-333333333333', 'TRUE_FALSE', 
   'Setting box-sizing to border-box means that padding and borders are added to the outer dimensions of the element, making it larger.', 
   '["True", "False"]'::jsonb, 
   'False', 
   'Setting box-sizing to border-box incorporates the padding and borders inside the declared width/height, keeping the total rendered box dimensions constant.', 
   'Intermediate', 10, '["css", "box-model"]'::jsonb, 50),

  -- Output Predict
  ('55555555-6666-7777-8888-999999999999', '44444444-4444-4444-4444-444444444444', 'PREDICT_OUTPUT', 
   'What is the output of the following code?
```js
function test() {
  var x = 1;
  if (true) {
    var x = 2;
    console.log(x);
  }
  console.log(x);
}
test();
```', 
   '["2 and 1", "2 and 2", "1 and 2", "undefined"]'::jsonb, 
   '2 and 2', 
   'Since "var" is function-scoped rather than block-scoped, redeclaring "var x" inside the block overwrites the variable "x" in the same function scope, so both logs print 2.', 
   'Intermediate', 15, '["js", "scope", "var"]'::jsonb, 90)
on conflict (id) do nothing;

-- Seed Quizzes
insert into public.quizzes (id, title, course_id, duration_minutes)
values 
  ('11111111-3333-3333-3333-111111111111', 'HTML Basics Challenge', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 10),
  ('22222222-4444-4444-4444-222222222222', 'Core Layouts Quiz', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 12)
on conflict (id) do update set 
  title = excluded.title,
  duration_minutes = excluded.duration_minutes;

-- Seed Quiz Questions
insert into public.quiz_questions (quiz_id, question_id)
values 
  ('11111111-3333-3333-3333-111111111111', '11111111-2222-3333-4444-555555555555'),
  ('11111111-3333-3333-3333-111111111111', '22222222-3333-4444-5555-666666666666'),
  ('11111111-3333-3333-3333-111111111111', '33333333-4444-5555-6666-777777777777'),
  ('22222222-4444-4444-4444-222222222222', '44444444-5555-6666-7777-888888888888')
on conflict (quiz_id, question_id) do nothing;
