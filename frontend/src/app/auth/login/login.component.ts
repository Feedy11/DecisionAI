import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  errorMsg     = '';
  showPassword = false;
  isLoading    = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {

    this.loginForm = this.fb.group({
      email   : ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg  = 'Email ou mot de passe incorrect';
        this.isLoading = false;
      }
    });
  }

  // Getters raccourcis pour le template
  get email()    { return this.loginForm.get('email');    }
  get password() { return this.loginForm.get('password'); }
}