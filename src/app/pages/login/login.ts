import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup} from '@angular/forms';
import { AuthService } from '../../services/auth';
import {Router, RouterLink} from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  form: FormGroup; // ✅ declare only

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {

    // ✅ initialize form inside constructor
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  error = '';

   async submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;

     try {
       await this.auth.login(email!, password!);
       alert('Login successful!');
       this.router.navigateByUrl('/chat'); // ✅ signup அல்ல, chat/profileக்கு redirect பண்ணலாம்
     } catch (err: any) {
       console.error(err);
       this.error = err.message || 'Login failed. Try again.';
       alert(this.error);
     }
  }
}
