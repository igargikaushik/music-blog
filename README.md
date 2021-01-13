# Classical for Everyone
## Goal
Classical for Everyone is a music blog meant to make classical accessible for everyone. It seeks to use approachable writing, good design, and interactive tools to make listening fun and enlightening. 

## Features
### Landing page
* A grid view displays articles in order of recency
* Title, description, image, color-coded category, and tags
* Pagination

### Articles
* Fully-featured markdown display, including images and HTML5 audio
* Dynamic table of contents
* Social media share buttons for Twitter, Facebook, and Reddit

### Listening guides
* Interactive music videos with timestamps and sectioned descriptions
* Dropdown of video choices, which updates listening guide timestamps
* Automatic expansion of sections (for example, when a new movement begins)

### Fully-featured custom CMS
* Admin authorization with Google OAuth2
* Admin dashboard with tables and logout button
    * Articles table shows published articles and unpublished drafts
    * Drafts table shows all drafts, published or otherwise
    * Archives automatically save old versions of articles, and can be used to manually "unpublish" old articles
    * Trash table backs up clutter, and allows old articles and drafts to be restored
* Draft editor with tabs for metadata, content, and listening guides
    * Metadata tab shows a dynamic preview of the landing page card for the article
    * Image uploading tied into Google Cloud Storage, with a dialog to set alt text
    * Content editor is a split-screen between a text editor and a WYSIWYG markdown display, including table of contents and share buttons
    * Listening guide editor shows a table where videos can be added, configured, grouped, and ordered
    * Listening guide editor has a table of descriptions, allowing the editor to set timestamps for each video
    * The listening guide editor has a split screen, the right side dynamically rendering the actual listening guide

## Running the project
### Running the Nuxt.js frontend
1. In the root directory, run `npm install`
2. Run the development server with `npm run dev`
3. Manually build the production files with `npm build`, or deploy with Google Cloud Build

### Running the Node.js backend
1. In the `/api` directory, run `npm install`
2. If you are missing environment variables, consult the `node-pg` and Google OAuth2 documentation
3. Configure a PostgreSQL server, and configure your `NODE_ENV` and `PGHOST` environment variables to configure your servers
4. Run the server with `npm start`, or run the tests with `npm test`
