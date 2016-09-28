import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Tools } from '../../backend/tools';

@Component({
  selector: 'login-newsletter',
  templateUrl: 'login-newsletter.template.html',
})
export class LoginNewsletter {
  aEmail: string;

  constructor(private http: Http) {
  }

  loginNews() {
    if (this.aEmail && Tools.validateEmail(this.aEmail)) {
      this.http.post('/newsletter/login', {email: this.aEmail})
        .subscribe(res => {
          let data = res.json() || [];
          console.log(data);
        });
    }
  }
}
