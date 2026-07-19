import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course, Chapter } from '../../../core/services/course.service';
import { ProgressService } from '../../../core/services/progress.service';
import { BookmarkService } from '../../../core/services/bookmark.service';
import { NoteService, Note } from '../../../core/services/note.service';

@Component({
  selector: 'app-ebook-reader',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ebook-reader.component.html',
  styleUrls: ['./ebook-reader.component.css']
})
export class EbookReaderComponent implements OnInit, OnDestroy {
  @ViewChild('readerContent', { static: false }) readerContentElement!: ElementRef;

  course: Course | null = null;
  chapters: Chapter[] = [];
  currentChapter: Chapter | null = null;
  parsedContent = '';

  // Collapsible sections
  tocOpen = true;
  notesOpen = true;
  isFullscreen = false;

  // Search in chapter
  searchQuery = '';
  originalParsedContent = '';

  // Reading settings
  fontSize = 16; // px
  isBookmarked = false;

  // Chapter Note
  chapterNote = '';
  noteSavedMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private progressService: ProgressService,
    private bookmarkService: BookmarkService,
    private noteService: NoteService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const chapterId = params.get('chapterId');
      if (chapterId) {
        this.loadChapter(chapterId);
      }
    });

    // Check window dimensions to auto-collapse on small viewports
    if (window.innerWidth < 768) {
      this.tocOpen = false;
      this.notesOpen = false;
    }
  }

  ngOnDestroy(): void {
    if (this.isFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth < 768) {
      this.tocOpen = false;
      this.notesOpen = false;
    }
  }

  loadChapter(chapterId: string): void {
    this.courseService.getChapterById(chapterId).subscribe(chapter => {
      if (chapter) {
        this.currentChapter = chapter;
        this.parsedContent = this.parseMarkdown(chapter.content);
        this.originalParsedContent = this.parsedContent;
        this.searchQuery = ''; // Reset search query on load

        // Load siblings
        this.courseService.getChapters(chapter.course_id).subscribe(chapters => {
          this.chapters = chapters;
        });

        // Load Course Info
        this.courseService.getCourses().subscribe(courses => {
          this.course = courses.find(c => c.id === chapter.course_id) || null;
        });

        // Load bookmark status
        this.bookmarkService.isBookmarked(chapterId).subscribe(status => {
          this.isBookmarked = status;
        });

        // Load Note for this chapter
        this.noteService.getNoteForChapter(chapterId).subscribe(note => {
          this.chapterNote = note ? note.content : '';
        });

        // Mark as 100% read progress on open
        this.progressService.updateChapterProgress(chapterId, 100, true).subscribe();
      }
    });
  }

  toggleBookmark(): void {
    if (!this.currentChapter) return;
    this.bookmarkService.toggleBookmark(this.currentChapter.id).subscribe(status => {
      this.isBookmarked = status;
    });
  }

  saveNote(): void {
    if (!this.currentChapter) return;
    this.noteService.saveNote(this.currentChapter.id, this.chapterNote).subscribe(() => {
      this.noteSavedMsg = 'Study note saved!';
      setTimeout(() => this.noteSavedMsg = '', 3000);
    });
  }

  deleteNote(): void {
    if (!this.currentChapter) return;
    this.noteService.deleteNote(this.currentChapter.id).subscribe(() => {
      this.chapterNote = '';
      this.noteSavedMsg = 'Note deleted.';
      setTimeout(() => this.noteSavedMsg = '', 3000);
    });
  }

  exportNote(): void {
    if (!this.currentChapter || !this.chapterNote) return;
    this.noteService.exportNotesAsFile(this.currentChapter.title, this.chapterNote);
  }

  // Next / Prev Navigation
  get hasNext(): boolean {
    if (!this.currentChapter || this.chapters.length === 0) return false;
    return this.currentChapter.order_index < this.chapters.length;
  }

  get hasPrev(): boolean {
    if (!this.currentChapter) return false;
    return this.currentChapter.order_index > 1;
  }

  goNext(): void {
    if (!this.currentChapter) return;
    const nextChapter = this.chapters.find(c => c.order_index === this.currentChapter!.order_index + 1);
    if (nextChapter) {
      this.router.navigate(['/dashboard/ebook', nextChapter.id]);
    }
  }

  goPrev(): void {
    if (!this.currentChapter) return;
    const prevChapter = this.chapters.find(c => c.order_index === this.currentChapter!.order_index - 1);
    if (prevChapter) {
      this.router.navigate(['/dashboard/ebook', prevChapter.id]);
    }
  }

  // Adjust Font Size
  adjustFont(dir: 'plus' | 'minus'): void {
    if (dir === 'plus' && this.fontSize < 24) {
      this.fontSize += 2;
    } else if (dir === 'minus' && this.fontSize > 12) {
      this.fontSize -= 2;
    }
  }

  // Selection Highlight
  highlightSelection(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      return;
    }
    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.className = 'bg-yellow-500/40 text-white font-semibold rounded px-0.5';
    try {
      mark.appendChild(range.extractContents());
      range.insertNode(mark);
      // Trigger a progress recalculation or update saved content local highlights
      if (this.readerContentElement) {
        this.parsedContent = this.readerContentElement.nativeElement.innerHTML;
        this.originalParsedContent = this.parsedContent;
      }
      window.getSelection()?.removeAllRanges();
    } catch (e) {
      console.warn('Selection cross-node highlighting restriction.', e);
    }
  }

  // Search text highlighting
  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.parsedContent = this.originalParsedContent;
      return;
    }

    const escapedQuery = this.searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Simple HTML parsing support (avoiding breaking tag elements)
    // We replace target text outside of HTML tags (<...>)
    let content = this.originalParsedContent;
    let parts = content.split(/(<[^>]*>)/);
    
    parts = parts.map(part => {
      if (part.startsWith('<')) {
        return part;
      }
      return part.replace(regex, '<mark class="bg-cyan-500/40 text-white font-bold">$1</mark>');
    });

    this.parsedContent = parts.join('');
  }

  // Full Screen mode
  toggleFullscreen(): void {
    const docEl = document.documentElement;
    if (!this.isFullscreen) {
      docEl.requestFullscreen().then(() => {
        this.isFullscreen = true;
      }).catch(err => {
        console.error('Fullscreen toggle failure', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
      }).catch(() => {});
    }
  }

  // Custom simple parser for Markdown content
  private parseMarkdown(md: string): string {
    if (!md) return '';
    let html = md;
    
    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-white mt-8 mb-4">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-6 mb-3 border-b border-surface-border pb-2">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-4 mb-2">$1</h3>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    
    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-6 list-disc text-text-muted my-1.5">$1</li>');
    
    // Fenced Code blocks
    html = html.replace(/```html([\s\S]*?)```/g, '<pre class="bg-surface border border-surface-border p-4 rounded-xl font-mono text-xs text-text my-4 overflow-x-auto"><code class="text-emerald-400">$1</code></pre>');
    html = html.replace(/```javascript([\s\S]*?)```/g, '<pre class="bg-surface border border-surface-border p-4 rounded-xl font-mono text-xs text-text my-4 overflow-x-auto"><code class="text-yellow-400">$1</code></pre>');
    html = html.replace(/```js([\s\S]*?)```/g, '<pre class="bg-surface border border-surface-border p-4 rounded-xl font-mono text-xs text-text my-4 overflow-x-auto"><code class="text-yellow-400">$1</code></pre>');
    html = html.replace(/```css([\s\S]*?)```/g, '<pre class="bg-surface border border-surface-border p-4 rounded-xl font-mono text-xs text-text my-4 overflow-x-auto"><code class="text-cyan-400">$1</code></pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-surface border border-surface-border p-4 rounded-xl font-mono text-xs text-text my-4 overflow-x-auto"><code class="text-text">$1</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code class="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-secondary-light font-bold">$1</code>');
    
    // Paragraph spacing
    html = html.split('\n\n').map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<li') || trimmed.startsWith('<ul') || trimmed.startsWith('<div')) {
        return trimmed;
      }
      return `<p class="my-4 text-text-muted leading-relaxed">${p}</p>`;
    }).join('\n\n');

    return html;
  }
}
