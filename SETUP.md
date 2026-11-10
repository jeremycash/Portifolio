# ADCRUIZ Portfolio: free setup guide

You will end up with:
- a live website at `https://your-name.netlify.app`
- an admin page at `https://your-name.netlify.app/admin` where you log in with GitHub, upload images, paste video links and edit text, then press Publish.

Everything below is free. Takes about 20 to 30 minutes the first time.

---

## Step 1: Put the files on GitHub

1. Log in to github.com, click **+** (top right), **New repository**.
2. Name it `portfolio`, keep it **Public**, click **Create repository**.
3. On the new page click **uploading an existing file**.
4. Unzip this project on your computer. Open the unzipped folder, select **everything inside it** (index.html, css, js, content, admin, images, SETUP.md) and drag it all into the GitHub page.
5. Click **Commit changes**.

## Step 2: Tell the admin page which repository to use

1. In your repository open `admin/config.yml`, click the pencil icon (Edit).
2. Change this line:
   `repo: YOUR-GITHUB-USERNAME/YOUR-REPO-NAME`
   to your real details, for example `repo: josephuba/portfolio`
3. Click **Commit changes**.

## Step 3: Publish the site on Netlify (free)

1. Go to netlify.com and **Sign up with GitHub**.
2. Click **Add new project**, **Import an existing project**, **GitHub**, and choose your `portfolio` repository.
3. Leave build command empty and publish directory empty (or `.`). Click **Deploy**.
4. When it is live, open **Project configuration**, **Change project name** and pick something like `adcruiz`. Your address becomes `adcruiz.netlify.app`.

## Step 4: Make the admin login work (one time only)

The admin page logs you in with your GitHub account. GitHub needs a small "OAuth app" for this:

1. On GitHub go to **Settings**, **Developer settings**, **OAuth Apps**, **New OAuth App**.
2. Fill in:
   - Application name: `Portfolio Admin`
   - Homepage URL: your Netlify address, for example `https://adcruiz.netlify.app`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
3. Click **Register application**, then **Generate a new client secret**. Keep this page open.
4. In Netlify open your project, **Project configuration**, **Access & security**, **OAuth**, **Authentication providers**, **Install provider**.
5. Choose GitHub, paste the **Client ID** and **Client Secret**, click **Install**.

(Netlify sometimes renames menu items. If a name differs, look for "OAuth" or "Authentication providers" under the project settings.)

## Step 5: Add your real work

1. Go to `https://your-name.netlify.app/admin` and click **Login with GitHub**.
2. Open **My Portfolio**, then **Projects (images and videos)**.
3. Each **category** is a section on the website (Logo Design, Brand Flyer, Album Art...). Open a category and:
   - **Add Items** and choose **Image**, then upload your design and add a caption (optional).
   - Or choose **Video link** and paste a YouTube or Vimeo link. It plays inside the site. Links from Instagram, TikTok or Behance open in a new tab.
   - Pick the **Image shape** (portrait for flyers, square for logos and album covers) and **Fit**.
4. Delete the sample categories and sample images (the colourful "Your design goes here" tiles).
5. Open **Site text, contact and photo** to upload your portrait and edit text, tools, services and contact details.
6. Click **Publish** (top right). The site updates in about one minute.

## Tips that help you win clients

- **Image size:** export as JPG or WebP, about 1600 px on the long side, under 400 KB each. 30 images then load fast, even on mobile data.
- **Lead with your strongest work:** the first image of each of your first three categories appears inside the animated folder on the home page.
- **Testimonials:** when a client says something nice, add it under *Client testimonials*. The section stays hidden until you add one, so nothing fake appears.
- **Every "Get a quote" button opens WhatsApp** with the message already typed (the service name or design the visitor was looking at is included).
- Please double-check your email in *Contact*. I typed `josephuba11@gmail.com` from your screenshot; make sure it is exact.

## Preview on your own computer (optional)

Open a terminal in the project folder and run `python3 -m http.server 8000`, then visit `http://localhost:8000`. (Double-clicking index.html will not work because the site loads its content from files.)

## Later: custom domain

When you are ready, buy a domain (for example adcruiz.com) and connect it in Netlify under **Domain management**. Until then the free address works fine.
