import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteService, Note } from '../../core/services/note.service';
import { CourseService, Course, Chapter } from '../../core/services/course.service';

interface ResolvedNote extends Note {
  chapterTitle: string;
  courseTitle: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  notesList: ResolvedNote[] = [];
  filteredNotes: ResolvedNote[] = [];
  searchQuery = '';
  loading = true;

  constructor(
    private noteService: NoteService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.noteService.getNotes().subscribe((notes: Note[]) => {
      if (notes.length === 0) {
        this.notesList = [];
        this.filteredNotes = [];
        this.loading = false;
        return;
      }

      this.notesList = [];
      let resolvedCount = 0;

      notes.forEach((note: Note) => {
        this.courseService.getChapterById(note.chapter_id).subscribe((ch: Chapter | undefined) => {
          if (ch) {
            this.courseService.getCourses().subscribe((courses: Course[]) => {
              const course = courses.find((c: Course) => c.id === ch.course_id);
              this.notesList.push({
                ...note,
                chapterTitle: ch.title,
                courseTitle: course ? course.title : 'General Course'
              });

              resolvedCount++;
              if (resolvedCount === notes.length) {
                this.filterNotes();
                this.loading = false;
              }
            });
          } else {
            resolvedCount++;
            if (resolvedCount === notes.length) {
              this.filterNotes();
              this.loading = false;
            }
          }
        });
      });
    });
  }

  filterNotes(): void {
    if (!this.searchQuery.trim()) {
      this.filteredNotes = [...this.notesList];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredNotes = this.notesList.filter(n => 
      n.content.toLowerCase().includes(q) || 
      n.chapterTitle.toLowerCase().includes(q) ||
      n.courseTitle.toLowerCase().includes(q)
    );
  }

  deleteNote(chapterId: string): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteService.deleteNote(chapterId).subscribe(() => {
        this.loadNotes();
      });
    }
  }

  exportNote(note: ResolvedNote): void {
    this.noteService.exportNotesAsFile(note.chapterTitle, note.content);
  }
}
