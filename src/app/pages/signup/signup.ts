import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../services/auth';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule,  RouterLink,],
  templateUrl:'./signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required]]
    });
  }

  async submit() {
    if (this.form.invalid) return;
    const { email, password, displayName } = this.form.value;

    try {
      await this.auth.signup(email!, password!, displayName!);
      alert('Signup successful!');
      await this.router.navigateByUrl('/Login');
    } catch (err: any) {
      console.error(err);
      this.error = err.message || 'Signup failed. Try again.';
      alert(this.error);
    }
  }
}
