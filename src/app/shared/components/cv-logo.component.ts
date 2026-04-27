import { Component } from '@angular/core';

@Component({
  selector: 'app-cv-logo',
  standalone: true,
  template: `
    <div class="cv-logo-container">
      <svg
        class="cv-logo"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background Circle -->
        <circle cx="100" cy="100" r="100" fill="#0aa2c0" />

        <!-- Text: ópticas -->
        <text x="100" y="45" font-family="Arial, sans-serif" font-size="14" font-weight="300" fill="white" text-anchor="middle">
          ópticas
        </text>

        <!-- CV+ Text -->
        <g>
          <!-- C -->
          <text x="65" y="130" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#2c3e50">
            C
          </text>
          <!-- V -->
          <text x="105" y="130" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#2c3e50">
            V
          </text>
          <!-- Plus Symbol -->
          <text x="155" y="125" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#f59e0b">
            +
          </text>
        </g>

        <!-- Tagline: Visión sin obstáculos -->
        <text x="100" y="165" font-family="Arial, sans-serif" font-size="10" font-weight="400" fill="white" text-anchor="middle">
          Visión sin obstáculos
        </text>
      </svg>
    </div>
  `,
  styles: [`
    .cv-logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      margin: 0;
    }

    .cv-logo {
      width: 120px;
      height: 120px;
      filter: drop-shadow(0 4px 12px rgba(10, 162, 192, 0.15));
      transition: transform 0.3s ease;
    }

    .cv-logo:hover {
      transform: scale(1.05);
    }
  `]
})
export class CvLogoComponent {}
