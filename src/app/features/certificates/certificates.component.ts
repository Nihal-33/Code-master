import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateService, Certificate } from '../../core/services/certificate.service';
import { AuthService, UserProfile } from '../../core/services/auth.service';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  user: UserProfile | null = null;

  // Verification tools
  verificationCode = '';
  verificationResult: {
    searched: boolean;
    valid: boolean;
    recipientName?: string;
    courseTitle?: string;
    date?: string;
  } | null = null;

  constructor(
    private certificateService: CertificateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((profile: UserProfile | null) => {
      this.user = profile;
    });

    this.certificateService.getCertificates().subscribe((certs: Certificate[]) => {
      this.certificates = certs;
    });
  }

  verifyCode(): void {
    if (!this.verificationCode.trim()) return;

    this.certificateService.verifyCertificate(this.verificationCode.trim()).subscribe(res => {
      if (res && res.valid) {
        this.verificationResult = {
          searched: true,
          valid: true,
          recipientName: res.recipientName,
          courseTitle: res.courseTitle,
          date: res.date
        };
      } else {
        this.verificationResult = {
          searched: true,
          valid: false
        };
      }
    });
  }

  printCertificate(cert: Certificate): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow popups to view printable certificate.');
      return;
    }

    const name = this.user?.full_name || 'Code Scholar';
    const courseName = cert.course_title || 'Web Development Pathway';
    const code = cert.certificate_code;
    const dateStr = new Date(cert.issued_at || '').toLocaleDateString();

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate of Completion - ${code}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Inter:wght@400;600;700&display=swap');
            body {
              background-color: #0f172a;
              color: #f8fafc;
              font-family: 'Inter', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .cert-frame {
              border: 10px double #3b82f6;
              padding: 60px;
              background-color: #1e293b;
              border-radius: 12px;
              text-align: center;
              max-width: 800px;
              width: 90%;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
              position: relative;
            }
            .title {
              font-family: 'Cinzel', serif;
              font-size: 2.8em;
              color: #3b82f6;
              margin-bottom: 10px;
              letter-spacing: 2px;
            }
            .subtitle {
              font-size: 1.1em;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 3px;
              margin-bottom: 40px;
            }
            .recipient {
              font-family: 'Cinzel', serif;
              font-size: 2.4em;
              color: #ffffff;
              margin-bottom: 20px;
              border-bottom: 2px dashed #475569;
              display: inline-block;
              padding-bottom: 10px;
            }
            .reason {
              font-size: 1.1em;
              color: #94a3b8;
              margin-bottom: 40px;
              line-height: 1.8;
            }
            .course-name {
              color: #06b6d4;
              font-weight: 700;
              font-size: 1.3em;
            }
            .footer-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 60px;
              border-top: 1px solid #475569;
              padding-top: 30px;
            }
            .sign-block {
              text-align: left;
            }
            .sign-line {
              border-bottom: 1px solid #94a3b8;
              width: 150px;
              margin-bottom: 5px;
            }
            .meta-block {
              text-align: right;
              font-size: 0.85em;
              color: #94a3b8;
            }
            .code {
              font-family: monospace;
              color: #3b82f6;
              font-weight: bold;
            }
            @media print {
              body { background-color: #ffffff; color: #000000; }
              .cert-frame { background-color: #ffffff; border-color: #000000; box-shadow: none; color: #000000; }
              .recipient { color: #000000; border-color: #000000; }
              .title { color: #000000; }
              .course-name { color: #000000; }
            }
          </style>
        </head>
        <body>
          <div class="cert-frame">
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">CodeMaster E-Book Arena</div>
            
            <div class="reason">This is proudly awarded to</div>
            <div class="recipient">${name}</div>
            
            <div class="reason">
              for successfully completing all chapter materials, practice checkpoints,<br>
              and active timed quizzes in the course<br>
              <span class="course-name">${courseName}</span>
            </div>
            
            <div class="footer-info">
              <div class="sign-block">
                <div class="sign-line"></div>
                <div style="font-size: 0.8em; color: #94a3b8;">CodeMaster Registrar</div>
              </div>
              
              <div class="meta-block">
                <div>Issued on: <strong>${dateStr}</strong></div>
                <div style="margin-top: 5px;">Verification Code: <span class="code">${code}</span></div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
