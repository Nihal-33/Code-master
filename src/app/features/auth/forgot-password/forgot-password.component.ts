import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  recoveryForm: FormGroup;
  loading = false;
  error = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.recoveryForm.controls; }

  onSubmit(): void {
    if (this.recoveryForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMsg = '';

    const { email } = this.recoveryForm.value;

    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.successMsg = 'A recovery link has been sent to your email address.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error occurred. Please verify your email.';
        this.loading = false;
      }
    });
  }
}
