# Bruno Scholles – Portfolio Page

Static personal website built with plain HTML/CSS and JavaScript.

## Local development
- Open `index.html` directly in your browser, or run a lightweight web server such as `python -m http.server` and visit `http://localhost:8000`.
- Ensure the `Icons/` and `SiteImgs/` folders stay alongside the HTML files so image paths resolve correctly.

## Deployment
- Automatic GitHub Pages deployments are configured via `.github/workflows/deploy.yml`.
- Push changes to the `main` branch; the workflow publishes the current tree to GitHub Pages.
- In the repository settings, under `Pages → Build and deployment`, select **GitHub Actions** the first time so GitHub trusts the workflow, then the action will handle future updates.
- After each deployment finishes, the live site URL appears in the workflow summary and on the repository’s `Pages` settings screen.
