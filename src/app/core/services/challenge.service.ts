import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProgressService } from './progress.service';

export interface TestCase {
  input: any[];
  expected: any;
}

export interface CodingChallenge {
  id: string;
  title: string;
  category: 'HTML' | 'CSS' | 'JavaScript' | 'AngularJS';
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  initialCode: string;
  functionName?: string;
  testCases?: TestCase[];
  hints: string[];
  explanation: string;
  xpReward: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  passedCount: number;
  totalCount: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private challenges: CodingChallenge[] = [
    {
      id: 'challenge-js-1',
      title: 'Reverse a String',
      category: 'JavaScript',
      description: 'Write a function `reverseString(str)` that takes a string as input and returns it reversed. For example, `reverseString("hello")` should return `"olleh"`.',
      difficulty: 'Beginner',
      initialCode: `function reverseString(str) {
  // Your code here
  return str;
}`,
      functionName: 'reverseString',
      testCases: [
        { input: ['hello'], expected: 'olleh' },
        { input: ['CodeMaster'], expected: 'retsaMedoC' },
        { input: [''], expected: '' }
      ],
      hints: [
        'You can convert the string into an array of characters using `.split("")`.',
        'Use the array `.reverse()` method to reverse the elements.',
        'Join the array back into a string using `.join("")`.'
      ],
      explanation: 'Reversing a string is commonly done in JavaScript by splitting it into an array, reversing the array, and joining it back into a string: `str.split("").reverse().join("")`. Alternatively, you can use a decremental loop.',
      xpReward: 30
    },
    {
      id: 'challenge-js-2',
      title: 'Check for Palindrome',
      category: 'JavaScript',
      description: 'Write a function `isPalindrome(str)` that checks whether a passed string is palindrome or not (reads the same forwards and backwards, case-insensitive). Return `true` or `false`.',
      difficulty: 'Intermediate',
      initialCode: `function isPalindrome(str) {
  // Your code here
  return false;
}`,
      functionName: 'isPalindrome',
      testCases: [
        { input: ['racecar'], expected: true },
        { input: ['hello'], expected: false },
        { input: ['Madam'], expected: true }
      ],
      hints: [
        'Convert the string to lowercase first using `.toLowerCase()`.',
        'Compare the string with its reversed counterpart.'
      ],
      explanation: 'A palindrome reads the same backwards. First normalize the string by making it lowercase, then compare `normalized === normalized.split("").reverse().join("")`.',
      xpReward: 40
    },
    {
      id: 'challenge-html-1',
      title: 'Create a Responsive Navbar Structure',
      category: 'HTML',
      description: 'Create an HTML structure for a navigation bar. Your code must include a `<nav>` landmark tag, a logo container with class `logo`, and a list (`<ul>` or `<ol>`) containing at least three navigation links (`<a>`).',
      difficulty: 'Beginner',
      initialCode: `<!-- Write your navigation bar HTML here -->
<nav>
  
</nav>`,
      hints: [
        'Ensure you use semantic HTML5 elements.',
        'Add a container with class="logo".',
        'Add at least 3 anchor tags inside a list structure.'
      ],
      explanation: 'Semantic HTML markup organizes the content hierarchy: `<nav class="navbar"><div class="logo">CodeMaster</div><ul><li><a href="#">Home</a></li>...</ul></nav>`.',
      xpReward: 30
    },
    {
      id: 'challenge-css-1',
      title: 'Build a Glassmorphism Card Style',
      category: 'CSS',
      description: 'Define CSS rules for a glassmorphism card. To pass, the class `.glass-card` must have a background color with opacity (`rgba`), a blurred backdrop-filter, a border, and a shadow.',
      difficulty: 'Intermediate',
      initialCode: `.glass-card {
  /* Write your styling declarations here */
  
}`,
      hints: [
        'Use `background: rgba(255, 255, 255, 0.1);` for transparency.',
        'Use `backdrop-filter: blur(10px);` to blur the background.',
        'Add a subtle border: `border: 1px solid rgba(255, 255, 255, 0.2);`.'
      ],
      explanation: 'Glassmorphism leverages transparency and blurring: `background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);`.',
      xpReward: 30
    },
    {
      id: 'challenge-ang-1',
      title: 'AngularJS Two-Way Binding Controller',
      category: 'AngularJS',
      description: 'Set up an AngularJS controller that initializes a scope variable named `username` with the value `"Alice"`. Write code that matches controller registration.',
      difficulty: 'Advanced',
      initialCode: `var app = angular.module('challengeApp', []);
app.controller('UserCtrl', function($scope) {
  // Initialize scope username here
  
});`,
      hints: [
        'Refer to the scope object as `$scope`.',
        'Assign value: `$scope.username = "Alice";`'
      ],
      explanation: 'AngularJS controllers interact with the view via $scope. Initializing a variable binds it instantly to any input element referencing `ng-model="username"`: `$scope.username = "Alice";`.',
      xpReward: 45
    }
  ];

  constructor(private progressService: ProgressService) {}

  public getChallenges(): Observable<CodingChallenge[]> {
    return of(this.challenges);
  }

  public getChallengeById(id: string): Observable<CodingChallenge | undefined> {
    return of(this.challenges.find(c => c.id === id));
  }

  // Execute and validate a code challenge submission
  public runChallenge(challengeId: string, code: string): Observable<ExecutionResult> {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) {
      return of({ success: false, output: 'Challenge not found.', passedCount: 0, totalCount: 0 });
    }

    // HTML / CSS Challenges validations via regex/string checks
    if (challenge.category === 'HTML') {
      const containsNav = /<nav\b[^>]*>/i.test(code);
      const containsLogoClass = /class=["'][^"']*logo[^"']*["']/i.test(code);
      const anchorsCount = (code.match(/<a\b[^>]*>/gi) || []).length;

      let success = containsNav && containsLogoClass && anchorsCount >= 3;
      let output = `Running validation checks...
- Has <nav> tag: ${containsNav ? 'PASSED' : 'FAILED'}
- Has class="logo": ${containsLogoClass ? 'PASSED' : 'FAILED'}
- Anchor links count (>=3): ${anchorsCount} (${anchorsCount >= 3 ? 'PASSED' : 'FAILED'})`;

      if (success) {
        output += '\n\nAll structural test cases passed!';
        this.progressService.awardXP(challenge.xpReward, `Completed challenge: ${challenge.title}`);
        this.progressService.unlockAchievement('Builder');
      } else {
        output += '\n\nSome test checks failed. Please check the hints.';
      }

      return of({
        success,
        output,
        passedCount: (containsNav ? 1 : 0) + (containsLogoClass ? 1 : 0) + (anchorsCount >= 3 ? 1 : 0),
        totalCount: 3
      });
    }

    if (challenge.category === 'CSS') {
      const containsBgRgba = /background(-color)?\s*:\s*rgba/i.test(code);
      const containsBlur = /backdrop-filter\s*:\s*blur/i.test(code);
      const containsBorder = /border\s*:/i.test(code);
      const containsShadow = /box-shadow\s*:/i.test(code);

      let success = containsBgRgba && containsBlur && containsBorder && containsShadow;
      let output = `Running CSS parsing checks...
- rgba transparent background: ${containsBgRgba ? 'PASSED' : 'FAILED'}
- blur backdrop-filter: ${containsBlur ? 'PASSED' : 'FAILED'}
- border rule: ${containsBorder ? 'PASSED' : 'FAILED'}
- box-shadow rule: ${containsShadow ? 'PASSED' : 'FAILED'}`;

      if (success) {
        output += '\n\nAll layout declarations verified!';
        this.progressService.awardXP(challenge.xpReward, `Completed challenge: ${challenge.title}`);
        this.progressService.unlockAchievement('Builder');
      }

      return of({
        success,
        output,
        passedCount: (containsBgRgba ? 1 : 0) + (containsBlur ? 1 : 0) + (containsBorder ? 1 : 0) + (containsShadow ? 1 : 0),
        totalCount: 4
      });
    }

    // JavaScript / AngularJS evaluations
    if (challenge.category === 'JavaScript' || challenge.category === 'AngularJS') {
      try {
        if (!challenge.functionName && challenge.category === 'AngularJS') {
          // Verify AngularJS string structure
          const initializedUsername = /username\s*=\s*['"]Alice['"]/i.test(code);
          const injectedScope = /function\s*\(\s*\$scope\s*\)/i.test(code) || /\[\s*['"]\$scope['"]\s*,\s*function/i.test(code);
          const success = initializedUsername && injectedScope;
          let output = `Parsing Controller Setup...
- Correct AngularJS dependency injection ($scope): ${injectedScope ? 'PASSED' : 'FAILED'}
- Initialized username = "Alice": ${initializedUsername ? 'PASSED' : 'FAILED'}`;

          if (success) {
            output += '\n\nAngularJS Module setup successfully verified!';
            this.progressService.awardXP(challenge.xpReward, `Completed challenge: ${challenge.title}`);
            this.progressService.unlockAchievement('Builder');
          }
          return of({
            success,
            output,
            passedCount: (injectedScope ? 1 : 0) + (initializedUsername ? 1 : 0),
            totalCount: 2
          });
        }

        // JS Function Evaluation
        const fnName = challenge.functionName!;
        // Compile string inside a safe container
        const executor = new Function(`${code}; return ${fnName};`);
        const userFn = executor();

        if (typeof userFn !== 'function') {
          return of({
            success: false,
            output: `Compilation Error: Global function "${fnName}" was not declared or exported.`,
            passedCount: 0,
            totalCount: challenge.testCases?.length || 0
          });
        }

        let passed = 0;
        let logs: string[] = [];
        const cases = challenge.testCases || [];

        cases.forEach((tc, index) => {
          try {
            // Deep copy input arguments
            const args = JSON.parse(JSON.stringify(tc.input));
            const result = userFn(...args);
            const isMatch = JSON.stringify(result) === JSON.stringify(tc.expected);

            if (isMatch) {
              passed++;
              logs.push(`Test Case ${index + 1}: input=${JSON.stringify(args)} -> PASSED`);
            } else {
              logs.push(`Test Case ${index + 1}: input=${JSON.stringify(args)} -> FAILED. Expected: ${JSON.stringify(tc.expected)}, Got: ${JSON.stringify(result)}`);
            }
          } catch (execErr: any) {
            logs.push(`Test Case ${index + 1}: Execution Error: ${execErr.message}`);
          }
        });

        const success = passed === cases.length;
        let output = logs.join('\n');
        if (success) {
          output += '\n\nAll functional test cases passed successfully!';
          this.progressService.awardXP(challenge.xpReward, `Completed challenge: ${challenge.title}`);
          this.progressService.unlockAchievement('Developer');
        }

        return of({
          success,
          output,
          passedCount: passed,
          totalCount: cases.length
        });

      } catch (compileErr: any) {
        return of({
          success: false,
          output: `Compilation / Syntax Error: ${compileErr.message}`,
          passedCount: 0,
          totalCount: challenge.testCases?.length || 0,
          error: compileErr.message
        });
      }
    }

    return of({ success: false, output: 'Unsupported execution runtime.', passedCount: 0, totalCount: 0 });
  }
}
