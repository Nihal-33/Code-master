import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'codemaster-ebook-arena';

  // Disable Right-Click Context Menu
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  // Block Developer Tools Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Block F12
    if (event.key === 'F12') {
      event.preventDefault();
      return;
    }

    // Block Ctrl + Shift + I/J/C, Ctrl + U (View Source), Ctrl + S (Save Page)
    if (event.ctrlKey) {
      const key = event.key.toLowerCase();
      if (
        (event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        key === 'u' ||
        key === 's'
      ) {
        event.preventDefault();
        return;
      }
    }
  }
}
