import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  chapters_count: number;
  questions_count: number;
  quizzes_count: number;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  content: string; // Markdown
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  // Pre-configured Mock Data matching the DB Seed
  private mockCourses: Course[] = [
    {
      id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'HTML5 Mastery',
      slug: 'html5-mastery',
      description: 'Learn semantic layout, Forms, Audio/Video media elements, Canvas API, SEO basics and modern ARIA accessibility standards.',
      cover_image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop',
      difficulty: 'Beginner',
      chapters_count: 11,
      questions_count: 20,
      quizzes_count: 2
    },
    {
      id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      title: 'CSS3 & Modern Layouts',
      slug: 'css3-layouts',
      description: 'Master Box Model, Flexbox, CSS Grid layouts, standard/custom animations, media queries, CSS variables and design token practices.',
      cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=600&auto=format&fit=crop',
      difficulty: 'Intermediate',
      chapters_count: 12,
      questions_count: 22,
      quizzes_count: 2
    },
    {
      id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      title: 'JavaScript Deep Dive',
      slug: 'javascript-deep-dive',
      description: 'Comprehensive logic covering ES6+, DOM manipulation, asynchronous programming, event loops, Fetch API, and data storage patterns.',
      cover_image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=600&auto=format&fit=crop',
      difficulty: 'Advanced',
      chapters_count: 15,
      questions_count: 25,
      quizzes_count: 3
    },
    {
      id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
      title: 'Legacy & Modern AngularJS',
      slug: 'angularjs-essentials',
      description: 'Dive into MVC/MVVM patterns, Scope, Controllers, custom Directives, Services, Filters, Dependency Injection, and modern Angular upgrade paths.',
      cover_image: 'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?q=80&w=600&auto=format&fit=crop',
      difficulty: 'Advanced',
      chapters_count: 13,
      questions_count: 18,
      quizzes_count: 2
    }
  ];

  private mockChapters: Chapter[] = [
    // HTML Chapters
    {
      id: '11111111-1111-1111-1111-111111111111',
      course_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Introduction to HTML5',
      order_index: 1,
      content: `# Introduction to HTML5

Welcome to the **HTML5 Mastery** course! HTML (HyperText Markup Language) is the standard markup language for creating web pages. Along with CSS and JavaScript, it forms the triad of core technologies for the World Wide Web.

## Key Learning Points
1. **HTML History**: Originating in 1990 by Tim Berners-Lee, HTML has evolved into HTML5, which provides robust APIs, native media, and clean semantics.
2. **Elements and Tags**: Elements are defined by a start tag, some content, and an end tag: \`<tagname>Content...</tagname>\`.
3. **The Doctype Declaration**: The \`<!DOCTYPE html>\` declaration is required at the very top to trigger standards rendering mode.

### Basic Document Skeleton
\`\`\`html
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
\`\`\`

### Element Attributes
Attributes provide additional information about elements. They are always specified in the start tag and usually come in name/value pairs like: \`name="value"\`.
- \`href\` in \`<a>\` specifies the URL for a link.
- \`src\` in \`<img>\` specifies the path to the image to be displayed.
`
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      course_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Semantic HTML Layouts',
      order_index: 2,
      content: `# Semantic HTML Layouts

Semantic HTML introduces tags that clearly describe their meaning to both the browser and the developer.

## Why Use Semantics?
1. **Accessibility**: Screen readers navigate pages much better using landmarks like \`<header>\`, \`<nav>\`, \`<main>\`, and \`<footer>\`.
2. **SEO**: Search engines weigh semantic content layout heavier than standard \`<div>\` structures.
3. **Readability**: Code is significantly cleaner and easier to maintain.

### Main Landmark Elements
- \`<header>\`: Introductory content or set of navigational links.
- \`<nav>\`: Section intended for navigation links.
- \`<main>\`: Main unique content of the \`<body>\`.
- \`<article>\`: Self-contained composition in a document (e.g. blog post, forum post).
- \`<section>\`: Standalone section of a document.
- \`<aside>\`: Section with content tangentially related to the content around it (e.g. sidebar).
- \`<footer>\`: Footer for its nearest sectioning content.

### Visual Representation of Semantics
\`\`\`
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
\`\`\`
`
    },
    {
      id: 'html-3',
      course_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Headings & Paragraphs',
      order_index: 3,
      content: `# Headings & Paragraphs

Learn the basics of placing text content in HTML.

## Headings
HTML defines six levels of headings from \`<h1>\` to \`<h6>\`. \`<h1>\` is the most important heading, while \`<h6>\` is the least important.
Always use headings in sequential order. Do not skip levels for visual sizing.

\`\`\`html
<h1>Main Topic</h1>
<h2>Subheading</h2>
<h3>Subsection</h3>
\`\`\`

## Paragraphs
The \`<p>\` tag defines a paragraph of text. Browsers automatically add some space (margin) before and after each \`<p>\` element.
`
    },
    {
      id: 'html-4',
      course_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      title: 'Links & Images',
      order_index: 4,
      content: `# Links & Images

Learn how to connect pages and display illustrations.

## Hyperlinks
Links are defined with the \`<a>\` (anchor) tag. The destination address is defined in the \`href\` attribute.

\`\`\`html
<a href="https://google.com" target="_blank">Search on Google</a>
\`\`\`

## Images
Images are defined with the \`<img>\` tag. It is an empty tag, meaning it contains attributes only and has no closing tag.
Always supply the \`alt\` attribute for screen readers.

\`\`\`html
<img src="logo.png" alt="CodeMaster Logo" width="120" height="40">
\`\`\`
`
    },
    // CSS Chapters
    {
      id: '33333333-3333-3333-3333-333333333333',
      course_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      title: 'CSS Box Model Explained',
      order_index: 1,
      content: `# CSS Box Model Explained

Everything in CSS is represented by a box. Understanding the CSS Box Model is the single most important concept in web layout design.

## Components of the Box Model
A box consists of four distinct boundaries:
1. **Content**: The text, images, or child elements of the element.
2. **Padding**: A transparent area surrounding the content, inside the border.
3. **Border**: A border surrounding the padding and content.
4. **Margin**: A transparent area outside the border that separates this element from adjacent elements.

\`\`\`
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
\`\`\`

## \`box-sizing: border-box\` vs \`content-box\`
- **\`content-box\` (Default)**: Width and height apply only to the content. Adding padding or border makes the element wider/taller on screen.
- **\`border-box\`**: Width and height apply to content, padding, and borders. If you set width to 300px, it stays 300px, absorbing padding/borders internally.
`
    },
    {
      id: 'css-2',
      course_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      title: 'Flexbox Alignment',
      order_index: 2,
      content: `# Flexbox Layout

Flexible Box Layout (Flexbox) is a 1-dimensional layout model designed for arranging items in rows or columns.

## Main Properties
- **\`display: flex\`**: Defines a flex container.
- **\`flex-direction\`**: Arranges items horizontally (\`row\`) or vertically (\`column\`).
- **\`justify-content\`**: Aligns items along the main axis (\`flex-start\`, \`flex-end\`, \`center\`, \`space-between\`, \`space-around\`).
- **\`align-items\`**: Aligns items along the cross axis (\`stretch\`, \`flex-start\`, \`flex-end\`, \`center\`).

### Example Code
\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`
`
    },
    // JS Chapters
    {
      id: '44444444-4444-4444-4444-444444444444',
      course_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      title: 'JavaScript Scope & Closure',
      order_index: 1,
      content: `# JavaScript Scope & Closure

Scope determines the accessibility of variables in JavaScript. Closure is the mechanism by which inner functions retain access to their outer scopes.

## 1. Types of Scope
- **Global Scope**: Variables declared outside functions/blocks. Accessible anywhere.
- **Function Scope**: Variables declared inside a \`function\`. Not accessible outside.
- **Block Scope**: Variables declared with \`let\` and \`const\` inside \`{ ... }\`. Not accessible outside. (Note: \`var\` is NOT block scoped).

## 2. Closure
A **closure** is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope even after the outer function returns.

### Closure Example
\`\`\`javascript
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
\`\`\`
Here, the anonymous inner function maintains a live reference to \`count\` inside \`makeCounter\`'s scope.
`
    },
    // AngularJS Chapters
    {
      id: 'angular-1',
      course_id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
      title: 'AngularJS Architecture (MVC)',
      order_index: 1,
      content: `# AngularJS Architecture (MVC)

AngularJS is a structural framework for dynamic web apps. It uses Model-View-Controller (MVC) or Model-View-ViewModel (MVVM) patterns to decouple application logic from UI design.

## Core Concepts
1. **Modules (\`angular.module\`)**: Containers for different parts of an application (controllers, services, directives).
2. **Controllers (\`ng-controller\`)**: JavaScript functions that bind data and logic to the DOM scope.
3. **Scope (\`$scope\`)**: The glue between the controller and view. It houses model data.

### Example AngularJS App
\`\`\`html
<div ng-app="myApp" ng-controller="myCtrl">
  <input type="text" ng-model="name">
  <h1>Hello, {{ name }}!</h1>
</div>

<script>
  var app = angular.module('myApp', []);
  app.controller('myCtrl', function($scope) {
    $scope.name = "AngularJS Scholar";
  });
</script>
\`\`\`
`
    }
  ];

  constructor(private supabaseService: SupabaseService) {
    // Auto-generate placeholder chapters for missing items to ensure full content
    this.generateMockPlaceholders();
  }

  private generateMockPlaceholders(): void {
    const courseChaptersMap: { [key: string]: string[] } = {
      'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d': [
        'Introduction to HTML5', 'Semantic HTML Layouts', 'Headings & Paragraphs', 'Links & Images', 
        'Lists', 'Tables', 'Forms & Inputs', 'Semantic Tags', 'Audio & Video Elements', 'A11y & ARIA Standards', 'SEO Basics'
      ],
      'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e': [
        'CSS Box Model Explained', 'Flexbox Alignment', 'Selectors & Specificity', 'Colors & Typography', 
        'CSS Grid layouts', 'Positioning Properties', 'Transitions & Transforms', 'CSS Keyframe Animations', 
        'Responsive Media Queries', 'CSS Variables & Variables', 'Modern Layout Strategies', 'CSS Methodologies'
      ],
      'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f': [
        'JavaScript Scope & Closure', 'Variables & Constants', 'Data Types & Casting', 'Conditional Logic', 
        'Loops & Iterations', 'Arrow Functions', 'Arrays & Map/Filter', 'Objects & Prototypes', 
        'DOM Manipulation', 'Event Propagation & Listeners', 'Async/Await & Promises', 'Fetch API Requests', 
        'ES6+ Features', 'Local Storage Web Storage', 'Try-Catch Error Handling'
      ],
      'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a': [
        'AngularJS Architecture (MVC)', 'Modules Setup', 'Controllers Scope', 'Built-in Directives', 
        'Two-way Data Binding', 'Services & Factories', 'Routing & ngRoute', 'Forms & Validation', 
        'HTTP Requests ($http)', 'Custom Directives Creation', 'Filters Formatting', 'Dependency Injection', 'Best Practices'
      ]
    };

    Object.keys(courseChaptersMap).forEach(courseId => {
      const titles = courseChaptersMap[courseId];
      titles.forEach((title, idx) => {
        const order = idx + 1;
        const exists = this.mockChapters.some(c => c.course_id === courseId && c.order_index === order);
        if (!exists) {
          this.mockChapters.push({
            id: `${courseId.slice(0, 4)}-ch-${order}`,
            course_id: courseId,
            title: title,
            order_index: order,
            content: `# ${title}

Welcome to this chapter!

This material covers essential theories and industrial practices regarding **${title}**.

## Summary
- Detailed code guidelines.
- Standard syntax applications.
- Practical interactive practice drills.

Check the **Practice Arena** or the **Quiz Arena** related to this chapter to validate your progress and gain XP!
`
          });
        }
      });
    });
  }

  // Fetch all courses
  public getCourses(): Observable<Course[]> {
    if (this.supabaseService.isMockMode) {
      return of(this.mockCourses);
    }

    return from(
      this.supabaseService.client
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Course[];
      })
    );
  }

  // Fetch course by slug
  public getCourseBySlug(slug: string): Observable<Course | undefined> {
    if (this.supabaseService.isMockMode) {
      return of(this.mockCourses.find(c => c.slug === slug));
    }

    return from(
      this.supabaseService.client
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Course;
      })
    );
  }

  // Fetch chapters of a course
  public getChapters(courseId: string): Observable<Chapter[]> {
    if (this.supabaseService.isMockMode) {
      const chapters = this.mockChapters
        .filter(c => c.course_id === courseId)
        .sort((a, b) => a.order_index - b.order_index);
      return of(chapters);
    }

    return from(
      this.supabaseService.client
        .from('chapters')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Chapter[];
      })
    );
  }

  // Fetch a single chapter by ID
  public getChapterById(chapterId: string): Observable<Chapter | undefined> {
    if (this.supabaseService.isMockMode) {
      return of(this.mockChapters.find(c => c.id === chapterId));
    }

    return from(
      this.supabaseService.client
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Chapter;
      })
    );
  }
}
