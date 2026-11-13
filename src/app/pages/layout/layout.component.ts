import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
	selector: 'app-layout',
	imports: [RouterLink, RouterOutlet, ToastComponent],
	templateUrl: './layout.component.html',
})
export class LayoutComponent {}
