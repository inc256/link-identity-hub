# Link Identity Hub

CYTIC LINK — FULL PRODUCT BUILD PROMPT

Build a complete, production-quality web application called Cytic Link.

Cytic Link is a free platform that allows individuals, professionals, creators, and businesses to create a beautiful digital profile/business page, receive a permanent shareable link, and generate a customizable QR code that points to that page.

The product should feel like a professional digital identity platform, NOT an AI product, NOT a generic link-in-bio clone, and NOT a basic QR-code generator.

The entire application must be functional.

1. PRODUCT NAME

Cytic Link

Use exactly this spelling throughout the product.

Brand positioning:

Your identity. One link. One scan.

Alternative supporting phrase:

Create a professional digital page and share everything through one simple link or QR code.

Do not overuse taglines.

2. CORE PRODUCT IDEA

A user creates a Cytic Link profile.

They receive a public URL such as:

/p/luna-restaurant

They can generate a QR code for that URL.

When someone scans the QR code, they see the user's customized digital profile.

The user can update their profile at any time without changing the QR code.

The QR code is therefore dynamic because it always points to the user's Cytic Link page.

Example:

Cytic Link account
        |
        v
Luna Restaurant
        |
        +---- Public URL
        |     /p/luna-restaurant
        |
        +---- QR Code
        |
        +---- Digital Profile
              |
              +-- About
              +-- Website
              +-- Phone
              +-- WhatsApp
              +-- Email
              +-- TikTok
              +-- YouTube
              +-- Instagram
              +-- Facebook
              +-- LinkedIn
              +-- Location
              +-- Opening Hours
              +-- Services
              +-- Products
              +-- Custom Links


3. EVERYTHING MUST BE FREE

There are NO paid plans.

There are NO subscriptions.

There are NO locked features.

There should be no:

Pro plan

Premium plan

Credit system

Payment page

Billing page

Upgrade prompts

Artificial feature limitations

All users should have access to the complete functionality.

The goal is to create a fully functional free product.

4. DATABASE REQUIREMENT

Use SQLite3 as the primary database.

Prefer a simple SQLite file stored with the project/application.

Example:

/data/cytic-link.sqlite


Use an ORM or clean database abstraction where appropriate.

Recommended:

SQLite

Prisma ORM or equivalent

TypeScript

Server-side API routes

Do NOT store user data permanently in browser localStorage as the primary database.

localStorage may only be used for temporary UI preferences such as:

theme preference

editor state

unsaved draft

Persistent application data must be stored in SQLite.

IMPORTANT:

Structure the database access layer cleanly so SQLite can later be replaced by PostgreSQL or another relational database without rewriting the entire application.

5. AUTHENTICATION

Implement proper authentication.

Users should be able to:

Register

Log in

Log out

Change password

Delete account

Registration:

Full Name
Email
Password
Confirm Password


Use secure password hashing.

Never store plaintext passwords.

Maintain sessions securely using HTTP-only cookies or an appropriate secure authentication mechanism.

6. USER PROFILE MODEL

Each user should be able to create one primary Cytic Link profile.

Profile fields:

Identity

Display name

Username / slug

Profile image

Cover image

Professional title

Short bio

Longer description

Example:

Luna Restaurant

Restaurant & Café

Fresh meals, great coffee and a welcoming atmosphere in Kampala.


7. CONTACT INFORMATION

Allow users to optionally add:

Phone number

WhatsApp number

Email

Website

Physical address

Google Maps URL

Opening hours

Phone numbers should create a clickable telephone link.

WhatsApp should create a WhatsApp conversation link.

Email should create a mailto link.

Website should open externally.

Maps should open externally.

Do not display empty fields.

8. SOCIAL MEDIA

Allow users to add social links.

Supported platforms:

Instagram

Facebook

TikTok

YouTube

X

LinkedIn

Telegram

Snapchat

Pinterest

GitHub

Threads

Each social profile should have:

Platform

URL

Optional custom label

Visibility toggle

Ordering

Users should be able to drag/reorder them.

Use recognizable platform icons.

Do not hardcode the user's social URLs.

9. FLEXIBLE PAGE BUILDER

The central feature is a block-based page builder.

Users should be able to add, remove, edit, hide, and reorder content blocks.

The editor should feel similar to a modern website builder, but remain extremely simple.

Available blocks:

Profile

Profile header

Profile image

Name

Professional title

Bio

Contact

Call button

WhatsApp button

Email button

Website button

Location button

Social

Social icons

Social links

Content

Text

Heading

Image

Image gallery

Video

Divider

Spacer

Business

Services

Products

Opening hours

Business information

Location

Contact information

Links

Custom link

Link collection

Media

YouTube video

YouTube channel

TikTok profile

Instagram profile

Advanced

Contact form

Downloadable file

Custom HTML should NOT be allowed by default for security reasons.

Every block should support:

Add

Edit

Delete

Hide/show

Duplicate where useful

Reorder

10. PAGE EDITOR UX

Use a professional split-screen editor on desktop.

Left:

PAGE
Blocks
Appearance
Settings
QR Code


Middle:

Block editing controls.

Right:

Live mobile page preview.

Example:

┌──────────────┬───────────────────────┬─────────────────────┐
│              │                       │                     │
│   SETTINGS   │      EDITOR           │    LIVE PREVIEW     │
│              │                       │                     │
│ Profile      │  Profile             │      ┌───────┐      │
│ Blocks       │  ─────────────        │      │       │      │
│ Appearance   │                       │      │ PHOTO │      │
│ QR Code      │  Name                 │      │       │      │
│              │  [____________]       │      │ NAME  │      │
│              │                       │      │       │      │
│              │  Bio                  │      │ LINKS │      │
│              │  [____________]       │      │       │      │
│              │                       │      │       │      │
│              │  + Add Block          │      └───────┘      │
│              │                       │                     │
└──────────────┴───────────────────────┴─────────────────────┘


On mobile, turn this into a clean tabbed editor.

The public profile itself must be highly responsive.

11. TEMPLATES

Many users will not want to design their page manually.

Create a template selection system.

Templates should be professionally designed.

Do NOT make them look like AI-generated website templates.

Create at least these templates:

Template 1 — Classic Business

For:

Businesses

Shops

Restaurants

Services

Structure:

Profile
Description
Contact buttons
Services
Website
Social links
Location
Opening hours

Template 2 — Professional

For:

Doctors

Lawyers

Engineers

Consultants

Freelancers

Developers

Designers

Structure:

Profile
Name
Professional title
About
Services
Experience
Portfolio
Contact
Social links

Template 3 — Creator

For:

YouTubers

TikTok creators

Influencers

Content creators

Structure:

Profile
Bio
Featured content
Social links
YouTube
TikTok
Instagram
Custom links

Template 4 — Personal

Minimal personal profile.

Structure:

Photo
Name
Bio
Social links
Website
Contact

Template 5 — Restaurant

Structure:

Logo
Restaurant name
Description
Call
WhatsApp
Menu
Opening hours
Location
Social media

Template 6 — Services

For service providers.

Structure:

Profile
About
Services
Pricing/details
Contact
Location
Social links

Template 7 — Portfolio

For:

Designers

Developers

Photographers

Artists

Creatives

Structure:

Profile
About
Portfolio/gallery
Services
Social links
Contact

Template 8 — Company

More corporate layout.

Structure:

Company logo
Company name
Description
Services
Website
Contact
Location
Social media
About

12. TEMPLATE BEHAVIOR

Templates are starting points, NOT locked designs.

When the user selects a template:

Create the corresponding blocks.

Populate them with the user's existing profile information.

Allow every block to be modified.

Allow blocks to be removed.

Allow new blocks to be added.

Allow blocks to be reordered.

The user must never be trapped inside a template.

13. DESIGN SYSTEM

The application must use these main brand colors:

Primary Navy

#1F2A44

Use for:

Header

Navigation

Primary buttons

Important text

Dark surfaces

Gold

#C6A75E

Use as an accent for:

Highlights

Selected states

Small decorative elements

Icons

Important accents

QR design options

Warm Beige

#E8DCC8

Use for:

Background accents

Soft sections

Cards

Template backgrounds

Secondary surfaces

Supporting colors may include:

White       #FFFFFF
Near Black  #151922
Gray        #667085
Light Gray  #F5F5F3
Border      #D9D9D2
Success     #2E7D5B
Error       #B42318


Do not allow the supporting colors to overpower the three primary brand colors.

14. VERY IMPORTANT VISUAL DIRECTION

The UI must look:

Professional

Mature

Elegant

Trustworthy

Clean

Premium

Human-designed

Business-oriented

It must NOT look:

AI-generated

Futuristic

Cyberpunk

Neon

Gamer-like

Excessively rounded

Overly colorful

Like ChatGPT

Like an AI SaaS landing page

Avoid:

Gradient-heavy backgrounds

Glowing elements

Excessive glassmorphism

Neon blue/purple

Huge decorative blobs

Floating AI particles

Excessive shadows

Excessive rounded cards

"AI magic" language

Robot imagery

Use restrained borders, spacing, typography and hierarchy.

15. TYPOGRAPHY

Use a professional modern font.

Preferred:

Inter

Use strong typographic hierarchy.

Headings should be confident and relatively compact.

Body text should be highly readable.

Avoid overly futuristic fonts.

16. LANDING PAGE

Create a polished landing page.

Navigation:

Cytic Link

Create your page
Templates
Features

Log in
Create your page


Hero:

Your identity.
One link.
One scan.

Create a professional digital page for your business,
profession, brand or personal identity.

Share everything through one simple link or QR code.

[ Create your page ]

No payment. No subscription.


Beside the hero text show a realistic Cytic Link profile preview and QR code.

Do not make the hero look like an AI startup.

17. LANDING PAGE SECTIONS

Include:

Hero

Clear value proposition.

How it works

Three steps:

01
Create your page

02
Customize it

03
Share your link or QR code


Templates

Show the available templates visually.

Features

Explain:

Digital profile

Custom page

QR codes

Social links

Contact buttons

Templates

Page customization

Dynamic links

Use cases

Show:

Businesses
Professionals
Creators
Freelancers
Restaurants
Organizations
Personal profiles


QR section

Explain that users can update their page without replacing the QR code.

Final CTA

Create your Cytic Link

Your information deserves one simple home.

[ Get started ]


18. DASHBOARD

After login, show a clean dashboard.

Navigation:

Dashboard
My Page
Templates
QR Code
Settings


Dashboard overview:

Welcome back

Your Cytic Link
cytic.link/p/username

[ Edit Page ]
[ View Page ]
[ QR Code ]


Statistics can be included:

Page views
QR scans
Link clicks


If analytics are implemented, store them in SQLite.

Do not fabricate statistics.

If there is no data, show:

No activity yet
Share your page to start seeing activity.


19. QR CODE GENERATOR

Implement a real QR code generator.

The QR code must point to the user's public Cytic Link URL.

Allow customization:

QR colors

Brand Navy

Gold

Black

White

Custom color

QR styles

Square

Rounded

Dots where technically safe

Eye/frame styles

Offer several safe QR finder-pattern styles.

Logo

Allow user to upload a small logo.

Center logo

Place it safely in the center while maintaining QR scannability.

Optional frame

Example:

┌─────────────────────┐
│                     │
│       QR CODE       │
│                     │
│       SCAN ME       │
└─────────────────────┘


Allow:

Frame

Text

Text alignment

Always preserve sufficient contrast and quiet zone.

Include a warning if the user's customization risks QR readability.

20. QR DOWNLOADS

Allow users to download:

PNG

SVG

If technically practical, also allow:

Print-ready version

The generated QR should remain valid after profile edits.

21. PUBLIC PROFILE

Public profile URL:

/p/:username


Example:

/p/luna-restaurant


The page should:

Load quickly

Be mobile-first

Be responsive

Have clean typography

Have accessible buttons

Support social links

Support contact actions

Support profile image

Support all selected blocks

Do not show dashboard navigation on the public page.

22. PUBLIC PROFILE DESIGN

The public page should feel like a small professional website.

Example:

        [PROFILE IMAGE]

        Luna Restaurant
        Restaurant & Café

        Fresh food and great coffee.

     [ Call ] [ WhatsApp ]

     ─────────────────────

        Our Menu
        [ View Menu ]

        About
        Fresh meals...

        Opening Hours
        Mon – Sat
        8:00 AM – 10:00 PM

        Find Us
        Kampala, Uganda

        [ Instagram ] [ TikTok ]
        [ YouTube ]

        Powered by Cytic Link


The footer branding should be subtle.

23. PAGE APPEARANCE SETTINGS

Users can customize:

Layout

Centered

Left aligned

Card-based

Minimal

Theme

Light

Dark

Warm

Navy

Custom

Buttons

Rectangle

Rounded

Pill

Outline

Do not allow customization that destroys usability.

24. PROFILE IMAGE

Support image upload.

Requirements:

JPG

PNG

WebP

Allow:

Circular profile image

Rounded square

Square

Validate file size.

Generate optimized versions where practical.

25. COVER IMAGE

Optional cover image.

Allow users to disable it.

The cover should work elegantly on mobile.

Do not force every template to use a cover.

26. LINK MANAGEMENT

Users can create custom links.

Each link should contain:

Title
URL
Icon
Description (optional)
Visibility
Order


Example:

Our Website
https://example.com

View Our Menu
https://example.com/menu

Book an Appointment
https://example.com/book


Allow drag-and-drop ordering.

27. SERVICES BLOCK

Users can add services.

Each service:

Name
Description
Optional price
Optional image
Optional link


Example:

Website Design
Professional websites for businesses

Logo Design
Professional brand identity


28. PRODUCTS BLOCK

Allow basic product cards.

Each product:

Name
Description
Price
Image
Optional link


Do not build a full e-commerce system.

This is only a showcase/contact feature.

29. ANALYTICS

Basic analytics should be free.

Track:

Page views

QR scans

Link clicks

Contact button clicks

Website clicks

Social link clicks

Do not collect unnecessary personal information.

Avoid invasive tracking.

Use privacy-conscious analytics.

Dashboard example:

Last 30 days

Page views       348
QR scans         192
Website clicks    74
Phone clicks      28
WhatsApp clicks   41


Use simple charts.

Do not create excessive dashboards.

30. QR SCAN TRACKING

When a QR code is scanned, it should redirect through an internal route that can record a scan before opening the public page.

Example:

/qr/:profileId


Then redirect to:

/p/:username


Do not collect unnecessary device fingerprinting.

Keep analytics anonymous where possible.

31. SETTINGS

Settings should include:

Account

Name

Email

Password

Profile

Username

Profile visibility

Privacy

Public/private profile

Analytics preferences

Account deletion

Allow permanent account deletion.

Clearly warn that deletion removes the user's stored profile data.

32. USERNAME SYSTEM

Username must:

Be unique

Be URL-safe

Support letters

Support numbers

Support hyphens

Not contain spaces

Example:

cafe-luna
john-doe
luna-designs


Show live availability while editing.

Prevent reserved routes such as:

login
register
dashboard
settings
admin
api
templates
qr


33. RESPONSIVE DESIGN

Desktop:

Use a full dashboard/editor layout.

Tablet:

Use responsive two-column layouts where appropriate.

Mobile:

The public profile must feel native and polished.

The dashboard must remain usable.

The page builder should switch to:

Edit
Preview


tabs on smaller screens.

34. ACCESSIBILITY

Implement:

Proper semantic HTML

Keyboard navigation

Visible focus states

Accessible buttons

Alt text

Sufficient color contrast

Form labels

Error messages

Do not rely solely on color to communicate states.

35. SECURITY

Implement basic production security.

Requirements:

Password hashing

Secure sessions

Input validation

URL validation

File type validation

File size limits

Protection against XSS

Protection against SQL injection

CSRF protection where applicable

Rate limiting for authentication endpoints

Sanitize user-generated text

Never execute user-provided HTML/JavaScript

Do not allow arbitrary scripts inside profile pages.

36. DATABASE STRUCTURE

Create a clean relational schema.

Suggested tables:

users

id
name
email
password_hash
created_at
updated_at


profiles

id
user_id
username
display_name
title
bio
description
profile_image
cover_image
phone
whatsapp
email
website
address
maps_url
template
theme
created_at
updated_at


social_links

id
profile_id
platform
url
label
visible
position


page_blocks

id
profile_id
type
content_json
visible
position
created_at
updated_at


services

id
profile_id
name
description
price
image
url
position


products

id
profile_id
name
description
price
image
url
position


analytics_events

id
profile_id
event_type
block_id
created_at


Use appropriate indexes and foreign keys.

37. FILE STORAGE

For the initial simple version, keep the architecture simple.

If using local storage for uploaded images:

/uploads


Store only the file path/URL in SQLite.

Do not store huge binary image data directly inside SQLite unless there is a strong reason.

Structure the upload service so it can later be replaced with S3, Supabase Storage, Cloudflare R2, etc.

38. ADMIN

Create a minimal protected admin system only if needed for application maintenance.

Admin functionality:

View users

View profiles

Disable profile

Delete abusive content

Basic statistics

Do not expose admin routes publicly.

39. EMPTY STATES

Make empty states useful.

Example:

Your page is waiting for its first section.

Choose a template or add your first block.

[ Choose a template ]
[ Add block ]


Avoid generic:

Nothing here.


40. ERROR STATES

Use human-friendly messages.

Bad:

500 Internal Server Error


Better:

Something went wrong.

We couldn't save your changes.
Please try again.

[ Try again ]


41. LOADING STATES

Use subtle skeletons or progress indicators.

Do not use flashy animations.

Keep animations short and functional.

42. ANIMATIONS

Use restrained animation.

Good:

Button hover

Dropdown transitions

Page transitions

Drag/reorder feedback

QR generation feedback

Avoid:

Floating objects

Excessive parallax

Constant movement

AI-style glowing animations

43. ICONS

Use a professional icon library such as Lucide.

Icons should be consistent.

Do not use random emoji as interface icons.

User content may contain emojis if they choose to add them.

44. LANDING PAGE VISUAL MOCKUPS

Create realistic examples of Cytic Link profiles.

Do not use generic AI-generated illustrations.

Use actual UI components as the visual examples.

For example:

Business profile preview
Professional profile preview
Restaurant profile preview
Creator profile preview


This makes the website demonstrate the product itself.

45. ONBOARDING

After registration:

Step 1:

Let's create your Cytic Link

What are you creating?

○ Business
○ Professional profile
○ Creator profile
○ Personal profile
○ Restaurant
○ Portfolio
○ Company


Step 2:

Choose a starting template


Step 3:

Tell us about yourself

Name
Title
Bio


Step 4:

Open the editor.

Do not make onboarding long.

Users should reach their page quickly.

46. TEMPLATE PREVIEW

Template cards should display realistic previews.

Each card:

[Preview]

Classic Business

For businesses and services

[Use template]


Avoid excessive marketing language.

47. DASHBOARD INFORMATION ARCHITECTURE

Desktop sidebar:

CYTIC LINK

Dashboard

My Page
Templates
QR Code
Analytics

────────────────

Settings

View Page


Top bar:

Cytic Link
                    View Page
                    Profile


Mobile bottom navigation:

Home
Page
QR
Analytics
More


48. PAGE PUBLISHING

Users should be able to:

Save
Preview
Publish
Unpublish


A page should not become public until published.

Show:

Published

cytic.link/p/luna-restaurant


Include a copy button.

49. PAGE STATUS

Possible states:

Draft
Published
Unpublished


Do not delete user content when unpublishing.

50. SEO

Every public profile should dynamically generate:

Title

Description

Open Graph title

Open Graph description

Open Graph image

Example:

Luna Restaurant | Cytic Link

Restaurant & Café in Kampala.


Use profile information.

Also generate an appropriate canonical URL.

51. QR SEO / ROBOTS

Do not index QR redirect routes.

Index public profile pages where appropriate.

Add appropriate robots metadata.

52. PERFORMANCE

Prioritize:

Fast initial load

Optimized images

Lazy loading

Minimal JavaScript where possible

Efficient database queries

Caching where appropriate

The public profile should load quickly even on mobile networks.

53. TECH STACK

Use a modern, stable stack suitable for Lovable.

Preferred:

React

TypeScript

Vite or the project's appropriate React framework

Tailwind CSS

shadcn/ui where useful

Lucide icons

SQLite3

Prisma or another clean ORM

Server/API layer appropriate for the chosen architecture

Do not introduce unnecessary dependencies.

Keep the architecture simple.

54. COMPONENT ARCHITECTURE

Create reusable components such as:

Navbar
Sidebar
ProfileHeader
ProfilePreview
BlockEditor
BlockRenderer
TemplateCard
TemplateSelector
SocialLinkEditor
LinkEditor
ServiceEditor
ProductEditor
QRCodeGenerator
QRCodePreview
AnalyticsCard
AnalyticsChart
ImageUploader
ColorPicker
ThemeSelector
PublishButton
PublicProfile


Avoid creating huge monolithic components.

55. PAGE BLOCK ARCHITECTURE

The block renderer should use a registry pattern.

Example conceptual structure:

BlockRenderer
    |
    +-- ProfileBlock
    +-- TextBlock
    +-- LinkBlock
    +-- SocialBlock
    +-- ServicesBlock
    +-- ProductsBlock
    +-- GalleryBlock
    +-- VideoBlock
    +-- HoursBlock
    +-- LocationBlock
    +-- ContactBlock


This makes future block types easy to add.

56. DRAG AND DROP

Use a reliable drag-and-drop library.

Users should be able to reorder:

Blocks

Social links

Custom links

Services

Products

Show clear drag handles.

Do not make the entire card draggable if it interferes with editing.

57. AUTOSAVE

Implement autosave carefully.

When the user changes profile information:

Save changes without requiring constant manual save.

Show:

Saving...
Saved


Do not save every keystroke directly to SQLite.

Debounce updates.

58. UNSAVED CHANGES

If a user is editing a large block and navigates away before saving, warn them if necessary.

59. BRAND APPLICATION

Cytic Link branding should consistently use:

Primary:

#1F2A44

Accent:

#C6A75E

Background accent:

#E8DCC8

Suggested usage:

Navy
████████

Gold
████████

Warm Beige
████████


Do not use gradients as a primary design technique.

60. LOGO

Create a simple text-based Cytic Link brand mark.

The logo should be:

Elegant

Minimal

Professional

Easy to recognize

Do not create a futuristic AI logo.

Use the navy and gold palette.

61. PUBLIC PROFILE BRANDING

The Cytic Link footer should be subtle:

Create your own Cytic Link


or:

Powered by Cytic Link


Do not dominate the user's profile with platform branding.

62. QR PAGE

Create a dedicated QR management page.

Show:

Your QR Code

[ LARGE QR PREVIEW ]

cytic.link/p/luna-restaurant

[ Download PNG ]
[ Download SVG ]

Customize

Color
Style
Logo
Frame
Text


Also provide:

Test QR code


which opens the public profile.

63. ANALYTICS PAGE

Keep it simple.

Top:

Analytics

Last 7 days | Last 30 days | Last 90 days


Cards:

Page Views
QR Scans
Link Clicks
Contact Actions


Then a simple line/bar chart.

Below:

Top links


Do not turn analytics into an overly complex business intelligence dashboard.

64. NO AI FEATURES

Do NOT add:

AI chatbot

AI profile generator

AI copywriting

AI image generation

AI assistant

AI recommendations

Cytic Link should intentionally feel like a traditional professional software product.

65. NO GENERIC AI DESIGN LANGUAGE

Do not use phrases such as:

"Powered by AI"

"Unlock the future"

"AI-powered"

"Magic"

"Supercharge"

"Transform your workflow"

The product is about digital identity, profiles, links and QR codes.

66. DEMO CONTENT

Create realistic seed/demo data for development.

Example:

Luna Restaurant
Restaurant & Café
Kampala, Uganda


Use it to demonstrate the templates.

Do not make the final product dependent on demo data.

67. DATA PRIVACY

Only store information required for the product.

Do not collect unnecessary personal data.

Provide:

Account deletion

Profile unpublish

Privacy settings

Analytics should be privacy-conscious.

68. FINAL QUALITY REQUIREMENTS

Before considering the implementation complete, verify:

Authentication

Registration works

Login works

Logout works

Passwords are securely hashed

Sessions work

Profiles

Profile creation works

Profile editing works

Username uniqueness works

Publishing works

Unpublishing works

Page builder

Add block works

Delete block works

Reorder works

Hide/show works

Editing works

Autosave works

Templates

All templates load

Templates create usable blocks

Templates can be customized

QR

QR generation works

QR points to the correct profile

QR remains valid after profile edits

PNG download works

SVG download works

Customization works

QR remains scannable

Links

Website links work

Phone links work

WhatsApp links work

Email links work

Social links work

Custom links work

Analytics

Page views work

QR scans work

Link clicks work

Charts reflect actual stored data

Database

SQLite stores persistent data

Foreign keys work

Data survives application restart

No important profile data depends on localStorage

Responsive

Test:

Desktop

Tablet

Mobile

Security

Test:

Authentication

Input validation

URL validation

File uploads

Authorization

Protected dashboard routes

69. MOST IMPORTANT PRODUCT PRINCIPLE

Do not build Cytic Link as merely:

"A QR code generator."

Build it as:

A professional digital identity platform where a QR code and link are the simplest ways to access someone's customized page.

The user should be able to go from:

Sign up
   ↓
Choose template
   ↓
Enter information
   ↓
Customize page
   ↓
Publish
   ↓
Get link
   ↓
Get QR code
   ↓
Share


with as little friction as possible.

The final result should look like a serious, polished software product that could realistically be launched publicly.

Do not leave major features as placeholders.

Do not create fake buttons.

Do not create non-functional UI.

Implement the complete working flow using SQLite3 and the chosen stack.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/279dda09-994b-4eb5-90e1-4c09d403d2f3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
