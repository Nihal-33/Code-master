import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookmarkService, Bookmark } from '../../core/services/bookmark.service';
import { CourseService, Course, Chapter } from '../../core/services/course.service';

interface BookmarkedChapter {
  id: string;
  title: string;
  courseTitle: string;
}

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {
  bookmarkedChapters: BookmarkedChapter[] = [];
  loading = true;

  constructor(
    private bookmarkService: BookmarkService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    this.loading = true;
    this.bookmarkService.getBookmarks().subscribe((bookmarks: Bookmark[]) => {
      if (bookmarks.length === 0) {
        this.bookmarkedChapters = [];
        this.loading = false;
        return;
      }

      this.bookmarkedChapters = [];
      let resolvedCount = 0;

      bookmarks.forEach((b: Bookmark) => {
        this.courseService.getChapterById(b.chapter_id).subscribe((ch: Chapter | undefined) => {
          if (ch) {
            // Fetch Course Title
            this.courseService.getCourses().subscribe((courses: Course[]) => {
              const course = courses.find((c: Course) => c.id === ch.course_id);
              this.bookmarkedChapters.push({
                id: ch.id,
                title: ch.title,
                courseTitle: course ? course.title : 'General Course'
              });

              resolvedCount++;
              if (resolvedCount === bookmarks.length) {
                this.loading = false;
              }
            });
          } else {
            resolvedCount++;
            if (resolvedCount === bookmarks.length) {
              this.loading = false;
            }
          }
        });
      });
    });
  }

  removeBookmark(chapterId: string): void {
    this.bookmarkService.toggleBookmark(chapterId).subscribe(() => {
      this.loadBookmarks();
    });
  }
}
